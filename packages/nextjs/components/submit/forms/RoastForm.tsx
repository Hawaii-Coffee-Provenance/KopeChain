"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchSelect from "../inputs/BatchSelect";
import LocationInput from "../inputs/LocationInput";
import MediaPreview from "../inputs/MediaPreview";
import MediaUploader from "../inputs/MediaUploader";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useFormFields } from "~~/hooks/useFormFields";
import { useMediaFiles } from "~~/hooks/useMediaFiles";
import { ROASTING_METHODS, ROAST_LEVELS, toUnixSeconds } from "~~/utils/coffee";
import { ROAST_INITIAL_FORM } from "~~/utils/forms";
import { mapTraitsToAttributes } from "~~/utils/nft";
import {
  ensureQrCode,
  fetchMetadata,
  getCoffeeTrackerGroupName,
  getOrCreateGroup,
  mergeGallery,
  pinJSON,
  pinNFT,
  uploadGallery,
} from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const RoastForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(ROAST_INITIAL_FORM);
  const { mediaFiles, addFiles, updateDescription, removeFile, resetFiles } = useMediaFiles();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { targetNetwork } = useTargetNetwork();

  const { data: batchData } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchByNumber",
    args: [form.batchNumber?.trim()],
  });

  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "CoffeeTracker" });

  const resetForm = () => {
    resetFormFields();
    resetFiles();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.batchNumber ||
      !form.cuppingNotes ||
      !form.roastingDate ||
      !form.transportTime ||
      !form.beforeWeight ||
      !form.afterWeight ||
      !form.latitude ||
      !form.longitude
    ) {
      notification.error("Complete every field before submitting.");
      return;
    }

    if (!batchData) return;

    const transportTime = Number(form.transportTime);
    const beforeWeight = Number(form.beforeWeight);
    const afterWeight = Number(form.afterWeight);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const roastingDate = toUnixSeconds(form.roastingDate);

    if (
      [transportTime, beforeWeight, afterWeight, latitude, longitude, roastingDate].some(value => Number.isNaN(value))
    ) {
      notification.error("Check the numeric fields. One or more values are invalid.");
      return;
    }

    setIsUploading(true);
    const notificationId = notification.loading("Generating new NFT and pinning to IPFS...");
    let newMetadataCID = "";

    try {
      const networkName = (targetNetwork as { network?: string }).network ?? targetNetwork.name;
      const groupId = await getOrCreateGroup(getCoffeeTrackerGroupName(networkName, "batch"));
      const nftGroupId = await getOrCreateGroup(getCoffeeTrackerGroupName(networkName, "nft"));
      const metadata = await fetchMetadata(batchData.metadataCID);
      const galleryCIDs = await uploadGallery(mediaFiles, form.batchNumber.trim(), networkName);

      await ensureQrCode(metadata, batchData.batchNumber, networkName);

      // Get existing NFT traits (region, mug, band, steam)
      const region = metadata.attributes.find((a: any) => a.trait_type === "Region")?.value;
      const existingMug = metadata.attributes.find((a: any) => a.trait_type === "Mug")?.value;
      const existingSteam = metadata.attributes.find((a: any) => a.trait_type === "Steam")?.value;

      if (!region || !existingMug) {
        throw new Error("Metadata is missing required NFT traits (Region or Mug).");
      }

      // Generate new  NFT
      const { IpfsHash: nftCID, traits } = await pinNFT({
        region: region as string,
        stage: "Roasted",
        batchNumber: form.batchNumber.trim(),
        groupId: nftGroupId,
        roastLevel: ROAST_LEVELS[Number(form.roastLevel)],
        existingMug: existingMug as string,

        existingSteam: existingSteam as string,
      });
      metadata.image = `ipfs://${nftCID}`;
      metadata.properties.images = metadata.properties.images || {};
      metadata.properties.images.nft = { cid: nftCID, description: "NFT Certificate" };
      metadata.attributes = mapTraitsToAttributes(metadata.attributes, "Roasted", traits);

      // Merge roasting data
      metadata.attributes = [
        ...metadata.attributes.filter((attr: any) => attr.trait_type !== "Roast Level"),
        { trait_type: "Roast Level", value: ROAST_LEVELS[Number(form.roastLevel)] },
      ];

      metadata.properties.roasting = {
        roastingMethod: ROASTING_METHODS[Number(form.roastingMethod)],
        roastLevel: ROAST_LEVELS[Number(form.roastLevel)],
        cuppingNotes: form.cuppingNotes.trim(),
        roastingDate,
        transportTime,
        beforeWeight,
        afterWeight,
        location: { latitude, longitude },
      };

      mergeGallery(metadata, galleryCIDs);

      newMetadataCID = await pinJSON(metadata, `batch-${form.batchNumber.trim()}`, form.batchNumber.trim(), groupId);
    } catch (error) {
      console.error(error);
      notification.error("Failed to upload to Pinata. See console for details.");
      setIsUploading(false);
      notification.remove(notificationId);
      return;
    }

    notification.remove(notificationId);

    try {
      await writeContractAsync(
        {
          functionName: "roastBatch",
          args: [batchData.batchId, Number(form.roastingMethod), Number(form.roastLevel), newMetadataCID],
        },
        {
          onBlockConfirmation: () => {
            notification.success(`Batch ${form.batchNumber.trim()} was roasted on-chain.`);
            resetForm();
            setTimeout(() => {
              router.push("/explore");
            }, 500);
          },
        },
      );
    } catch {
      // scaffold hook handles error notification
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = isMining || isUploading;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-base-300 bg-base-100 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-base-300">
        <h2 className="heading-card text-4xl mb-2">Roast Batch</h2>
        <p className="text-muted text-sm m-0">Enter the roasting data to update a batch.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Batch Number</span>
            <BatchSelect
              value={form.batchNumber}
              onSelect={val => updateField("batchNumber", val)}
              requiredStage="Processed"
              isDisabled={isDisabled}
            />
          </div>

          {/* Row 1, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Roasting Method</span>
            <select
              className="select select-bordered w-full text-sm h-10"
              value={form.roastingMethod}
              onChange={e => updateField("roastingMethod", e.target.value)}
            >
              {Object.entries(ROASTING_METHODS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1, Col 3 — Spans 5 Rows (Last on mobile) */}
          <div className="order-last md:order-none md:col-start-3 md:row-start-1 md:row-span-5 relative">
            <div className="md:absolute md:inset-0 flex flex-col gap-2">
              <MediaUploader onAddFiles={addFiles} isDisabled={isDisabled} />
              <MediaPreview
                mediaFiles={mediaFiles}
                onUpdateDescription={updateDescription}
                onRemoveFile={removeFile}
                isDisabled={isDisabled}
              />
            </div>
          </div>

          {/* Row 2, Col 1 — Spans 2 Rows */}
          <div className="flex flex-col gap-2 w-full md:row-span-2 h-full">
            <span className="text-label">Cupping Notes</span>
            <textarea
              className="textarea textarea-bordered w-full text-sm resize-none flex-grow"
              placeholder="e.g. milk chocolate, brown sugar, citrus"
              value={form.cuppingNotes}
              onChange={e => updateField("cuppingNotes", e.target.value)}
            />
          </div>

          {/* Row 2, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Roasting Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.roastingDate}
              onChange={e => updateField("roastingDate", e.target.value)}
            />
          </div>

          {/* Row 3, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Roast Level</span>
            <select
              className="select select-bordered w-full text-sm h-10"
              value={form.roastLevel}
              onChange={e => updateField("roastLevel", e.target.value)}
            >
              {Object.entries(ROAST_LEVELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 4, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Before Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="e.g. 272"
              min="0"
              type="number"
              value={form.beforeWeight}
              onChange={e => updateField("beforeWeight", e.target.value)}
            />
          </div>

          {/* Row 4, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Transport Time (days)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="e.g. 3"
              min="0"
              type="number"
              value={form.transportTime}
              onChange={e => updateField("transportTime", e.target.value)}
            />
          </div>

          {/* Row 5, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">After Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="e.g. 233"
              min="0"
              type="number"
              value={form.afterWeight}
              onChange={e => updateField("afterWeight", e.target.value)}
            />
          </div>

          {/* Row 5, Col 2 */}
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={updateField}
            disabled={isDisabled}
            latPlaceholder="e.g. 19.636820"
            longPlaceholder="e.g. -155.993450"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-t border-base-300 px-6 py-5 sm:px-8">
        <p className="text-hint text-xs leading-relaxed">
          Batch data and media are pinned to IPFS and linked to this batch on-chain for permanent transparency.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-80">
          <button
            type="button"
            className="btn btn-ghost border flex-1 text-base tracking-wide whitespace-nowrap"
            onClick={resetForm}
            disabled={isDisabled}
          >
            Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary flex-1 text-base tracking-wide whitespace-nowrap"
            disabled={isDisabled || !batchData || (batchData?.batchId ?? 0n) === 0n}
          >
            {isUploading ? "Uploading..." : isMining ? "Submitting..." : "Roast Batch"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RoastForm;
