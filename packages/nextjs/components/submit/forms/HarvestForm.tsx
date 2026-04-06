"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationInput from "../inputs/LocationInput";
import MediaPreview from "../inputs/MediaPreview";
import MediaUploader from "../inputs/MediaUploader";
import { useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useFormFields } from "~~/hooks/useFormFields";
import { useMediaFiles } from "~~/hooks/useMediaFiles";
import { BatchMetadata } from "~~/types/batch";
import { REGIONS, VARIETIES, toUnixSeconds } from "~~/utils/coffee";
import { HARVEST_INITIAL_FORM } from "~~/utils/forms";
import { getCoffeeTrackerGroupName, getOrCreateGroup, pinJSON, pinNFT, pinQR, uploadGallery } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const HarvestForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(HARVEST_INITIAL_FORM);
  const { mediaFiles, addFiles, updateDescription, removeFile, resetFiles } = useMediaFiles();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  const { targetNetwork } = useTargetNetwork();

  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "CoffeeTracker" });

  const resetForm = () => {
    resetFormFields();
    resetFiles();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.batchNumber ||
      !form.farmName ||
      !form.elevation ||
      !form.harvestDate ||
      !form.harvestWeight ||
      !form.latitude ||
      !form.longitude
    ) {
      notification.error("Complete every field before submitting.");
      return;
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const elevation = Number(form.elevation);
    const harvestWeight = Number(form.harvestWeight);
    const harvestDate = toUnixSeconds(form.harvestDate);

    if ([latitude, longitude, elevation, harvestWeight, harvestDate].some(value => Number.isNaN(value))) {
      notification.error("Check the numeric fields. One or more values are invalid.");
      return;
    }

    setIsUploading(true);
    const notificationId = notification.loading("Generating NFT and uploading data to IPFS...");
    let metadataCID = "";

    try {
      const networkName = (targetNetwork as { network?: string }).network ?? targetNetwork.name;
      const groupId = await getOrCreateGroup(getCoffeeTrackerGroupName(networkName, "batch"));
      const qrGroupId = await getOrCreateGroup(getCoffeeTrackerGroupName(networkName, "qr"));
      const nftGroupId = await getOrCreateGroup(getCoffeeTrackerGroupName(networkName, "nft"));
      const qrCID = await pinQR(form.batchNumber.trim(), qrGroupId);
      const galleryCIDs = await uploadGallery(mediaFiles, form.batchNumber.trim(), networkName);

      // Generate NFT
      const { IpfsHash: nftCID, traits } = await pinNFT({
        region: REGIONS[Number(form.region)],
        stage: "Harvested",
        batchNumber: form.batchNumber.trim(),
        groupId: nftGroupId,
      });

      const metadata: BatchMetadata = {
        name: `${REGIONS[Number(form.region)]} ${VARIETIES[Number(form.variety)]} - ${form.batchNumber.trim()}`,
        description: `Single origin ${VARIETIES[Number(form.variety)]} harvested at ${form.elevation}m. Farm: ${form.farmName.trim()}.`,
        image: `ipfs://${nftCID}`,
        external_url: `${APP_URL}/explore/batch/${form.batchNumber.trim()}`,

        attributes: [
          { trait_type: "Region", value: REGIONS[Number(form.region)] },
          { trait_type: "Stage", value: "Harvested" },
          { trait_type: "Mug", value: traits.mug },
          { trait_type: "Band", value: traits.band },
          ...(traits.steam ? [{ trait_type: "Steam", value: traits.steam }] : []),
        ],

        properties: {
          batchNumber: form.batchNumber.trim(),
          harvest: {
            farmName: form.farmName.trim(),
            region: REGIONS[Number(form.region)],
            variety: VARIETIES[Number(form.variety)],
            elevation,
            harvestDate,
            harvestWeight,
            location: { latitude, longitude },
          },
          images: {
            nft: { cid: nftCID, description: "NFT Certificate" },
            qrCode: { cid: qrCID, description: "Batch QR Code" },
            ...(galleryCIDs.length > 0 && { gallery: galleryCIDs }),
          },
        },
      };

      metadataCID = await pinJSON(metadata, `batch-${form.batchNumber.trim()}`, form.batchNumber.trim(), groupId);
    } catch (error) {
      console.error(error);
      notification.error(`Batch ${form.batchNumber.trim()} failed to harvest on-chain.`);
      setIsUploading(false);
      notification.remove(notificationId);
      return;
    }

    notification.remove(notificationId);

    try {
      await writeContractAsync(
        {
          functionName: "harvestBatch",
          args: [form.batchNumber.trim(), Number(form.region), Number(form.variety), metadataCID],
        },
        {
          onBlockConfirmation: () => {
            notification.success(`Batch ${form.batchNumber.trim()} was harvested on-chain.`);
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
        <h2 className="heading-card text-4xl mb-2">Harvest Batch</h2>
        <p className="text-muted text-sm m-0">Enter the initial coffee batch data.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Batch Number</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              placeholder="e.g. KONA-2026-201"
              value={form.batchNumber}
              onChange={e => updateField("batchNumber", e.target.value)}
            />
          </div>

          {/* Row 1, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Farm Name</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              placeholder="e.g. Holualoa Kona Coffee Co"
              value={form.farmName}
              onChange={e => updateField("farmName", e.target.value)}
            />
          </div>

          {/* Row 1, Col 3 — Spans 4 Rows (Last on mobile) */}
          <div className="order-last md:order-none md:col-start-3 md:row-start-1 md:row-span-4 relative">
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
            <span className="text-label">Variety</span>
            <select
              className="select select-bordered w-full text-sm h-10"
              value={form.variety}
              onChange={e => updateField("variety", e.target.value)}
            >
              {Object.entries(VARIETIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Region</span>
            <select
              className="select select-bordered w-full text-sm h-10"
              value={form.region}
              onChange={e => updateField("region", e.target.value)}
            >
              {Object.entries(REGIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Harvest Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.harvestDate}
              onChange={e => updateField("harvestDate", e.target.value)}
            />
          </div>

          {/* Row 3, Col 2 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Harvest Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 1360"
              type="number"
              value={form.harvestWeight}
              onChange={e => updateField("harvestWeight", e.target.value)}
            />
          </div>

          {/* Row 4, Col 1 */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-label">Elevation (m)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 670"
              type="number"
              value={form.elevation}
              onChange={e => updateField("elevation", e.target.value)}
            />
          </div>

          {/* Row 4, Col 2 */}
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={updateField}
            disabled={isDisabled}
            latPlaceholder="e.g. 19.681101"
            longPlaceholder="e.g. -155.980404"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-t border-base-300 p-6">
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
            disabled={isDisabled}
          >
            {isUploading ? "Uploading..." : isMining ? "Submitting..." : "Submit Batch"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default HarvestForm;
