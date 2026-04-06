"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchSelect from "../inputs/BatchSelect";
import LocationInput from "../inputs/LocationInput";
import MediaPreview from "../inputs/MediaPreview";
import MediaUploader from "../inputs/MediaUploader";
import { zeroAddress } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useFormFields } from "~~/hooks/useFormFields";
import { useMediaFiles } from "~~/hooks/useMediaFiles";
import { PROCESSING_METHODS, toUnixSeconds } from "~~/utils/coffee";
import { PROCESS_INITIAL_FORM } from "~~/utils/forms";
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

const ProcessForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(PROCESS_INITIAL_FORM);
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
      !form.moistureContent ||
      !form.scaScore ||
      !form.humidity ||
      !form.dryTemperature ||
      !form.processingDate ||
      !form.beforeWeight ||
      !form.afterWeight ||
      !form.latitude ||
      !form.longitude
    ) {
      notification.error("Complete every field before submitting.");
      return;
    }

    if (!batchData) return;

    if (batchData.processor !== zeroAddress) {
      notification.warning("This batch already has a processor assigned!");
      return;
    }

    const moistureContent = Number(form.moistureContent);
    const scaScore = Number(form.scaScore);
    const humidity = Number(form.humidity);
    const dryTemperature = Number(form.dryTemperature);
    const beforeWeight = Number(form.beforeWeight);
    const afterWeight = Number(form.afterWeight);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const processingDate = toUnixSeconds(form.processingDate);

    if (
      [
        moistureContent,
        scaScore,
        humidity,
        dryTemperature,
        beforeWeight,
        afterWeight,
        latitude,
        longitude,
        processingDate,
      ].some(value => Number.isNaN(value))
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

      // Generate new NFT
      const { IpfsHash: nftCID, traits } = await pinNFT({
        region: region as string,
        stage: "Processed",
        batchNumber: form.batchNumber.trim(),
        groupId: nftGroupId,
        existingMug: existingMug as string,

        existingSteam: existingSteam as string,
      });
      metadata.image = `ipfs://${nftCID}`;
      metadata.properties.images = metadata.properties.images || {};
      metadata.properties.images.nft = { cid: nftCID, description: "NFT Certificate" };
      metadata.attributes = mapTraitsToAttributes(metadata.attributes, "Processed", traits);

      // Merge processing data
      metadata.properties.processing = {
        processingMethod: PROCESSING_METHODS[Number(form.processingMethod)],
        moistureContent,
        scaScore,
        humidity,
        dryTemperature,
        processingDate,
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
          functionName: "processBatch",
          args: [batchData.batchId, Number(form.processingMethod), newMetadataCID],
        },
        {
          onBlockConfirmation: () => {
            notification.success(`Batch ${form.batchNumber.trim()} was processed on-chain.`);
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
        <h2 className="heading-card text-4xl mb-2">Process Batch</h2>
        <p className="text-muted text-sm m-0">Enter the processing data to update a batch.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Batch Number</span>
            <BatchSelect
              value={form.batchNumber}
              onSelect={val => updateField("batchNumber", val)}
              requiredStage="Harvested"
              isDisabled={isDisabled}
            />
          </div>

          {/* Row 1, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Processing Method</span>
            <select
              className="select select-bordered w-full text-sm h-10"
              value={form.processingMethod}
              onChange={e => updateField("processingMethod", e.target.value)}
            >
              {Object.entries(PROCESSING_METHODS).map(([value, label]) => (
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

          {/* Row 2, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">SCA Score</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="e.g. 86.5"
              step="0.1"
              min="0"
              max="100"
              type="number"
              value={form.scaScore}
              onChange={e => updateField("scaScore", e.target.value)}
            />
          </div>

          {/* Row 2, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Processing Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.processingDate}
              onChange={e => updateField("processingDate", e.target.value)}
            />
          </div>

          {/* Row 3, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Humidity (%)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="e.g. 72.0"
              step="0.1"
              type="number"
              value={form.humidity}
              onChange={e => updateField("humidity", e.target.value)}
            />
          </div>

          {/* Row 3, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Dry Temperature (°C)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="e.g. 28.5"
              step="0.1"
              type="number"
              value={form.dryTemperature}
              onChange={e => updateField("dryTemperature", e.target.value)}
            />
          </div>

          {/* Row 4, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Before Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 1360"
              type="number"
              value={form.beforeWeight}
              onChange={e => updateField("beforeWeight", e.target.value)}
            />
          </div>

          {/* Row 4, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Moisture Content (%)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="e.g. 11.2"
              step="0.1"
              type="number"
              value={form.moistureContent}
              onChange={e => updateField("moistureContent", e.target.value)}
            />
          </div>

          {/* Row 5, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">After Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 272"
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
            latPlaceholder="e.g. 19.521480"
            longPlaceholder="e.g. -155.907250"
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
            disabled={
              isDisabled || !batchData || (batchData?.batchId ?? 0n) === 0n || batchData?.processor !== zeroAddress
            }
          >
            {isUploading ? "Uploading..." : isMining ? "Submitting..." : "Process Batch"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProcessForm;
