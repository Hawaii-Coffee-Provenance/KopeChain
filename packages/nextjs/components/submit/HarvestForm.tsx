"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";
import LocationInput from "./LocationInput";
import MediaPreview from "./MediaPreview";
import MediaUploader from "./MediaUploader";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useFormFields } from "~~/hooks/useFormFields";
import { useMediaFiles } from "~~/hooks/useMediaFiles";
import { BatchMetadata } from "~~/types/batch";
import { REGIONS, VARIETIES, toUnixSeconds } from "~~/utils/coffee";
import { HARVEST_INITIAL_FORM } from "~~/utils/forms";
import { getOrCreateGroup, pinJSON, pinQR, uploadGallery } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const HarvestForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(HARVEST_INITIAL_FORM);
  const { mediaFiles, addFiles, updateDescription, removeFile, resetFiles } = useMediaFiles();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

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
    const notificationId = notification.loading("Uploading batch data and media to IPFS...");
    let metadataCID = "";

    try {
      const groupId = await getOrCreateGroup("CoffeeTracker-local-batch");
      const qrGroupId = await getOrCreateGroup("CoffeeTracker-local-qr");
      const qrCID = await pinQR(form.batchNumber.trim(), qrGroupId);
      const galleryCIDs = await uploadGallery(mediaFiles, form.batchNumber.trim());

      const metadata: BatchMetadata = {
        name: `${REGIONS[Number(form.region)]} ${VARIETIES[Number(form.variety)]} - ${form.batchNumber.trim()}`,
        description: `Single origin ${VARIETIES[Number(form.variety)]} harvested at ${form.elevation}m. Farm: ${form.farmName.trim()}.`,
        image: `ipfs://${qrCID}`,
        external_url: `${APP_URL}/explore/batch/${form.batchNumber.trim()}`,

        attributes: [
          { trait_type: "Stage", value: "Harvested" },
          { trait_type: "Region", value: REGIONS[Number(form.region)] },
          { trait_type: "Variety", value: VARIETIES[Number(form.variety)] },
          { trait_type: "Elevation (m)", value: form.elevation },
          { trait_type: "Harvest Weight (kg)", value: form.harvestWeight },
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
            notification.success(`Batch ${form.batchNumber.trim()} was harvested onchain.`);
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
      <FormHeader title="Harvest Batch" description="Enter the initial coffee batch data." />

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Batch Number</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              placeholder="KONA-2026-201"
              value={form.batchNumber}
              onChange={e => updateField("batchNumber", e.target.value)}
            />
          </label>

          {/* Row 1, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Farm Name</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              placeholder="Holualoa Kona Coffee Co"
              value={form.farmName}
              onChange={e => updateField("farmName", e.target.value)}
            />
          </label>

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
          <label className="form-control w-full">
            <span className="text-label mb-2">Variety</span>
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
          </label>

          {/* Row 2, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Region</span>
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
          </label>

          {/* Row 3, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Harvest Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.harvestDate}
              onChange={e => updateField("harvestDate", e.target.value)}
            />
          </label>

          {/* Row 3, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Harvest Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="1360"
              type="number"
              value={form.harvestWeight}
              onChange={e => updateField("harvestWeight", e.target.value)}
            />
          </label>

          {/* Row 4, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Elevation (m)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="670"
              type="number"
              value={form.elevation}
              onChange={e => updateField("elevation", e.target.value)}
            />
          </label>

          {/* Row 4, Col 2 */}
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={updateField}
            disabled={isDisabled}
          />
        </div>
      </div>

      <FormFooter
        onReset={resetForm}
        isUploading={isUploading}
        isMining={isMining}
        submitLabel="Submit Batch"
        disabled={isDisabled}
      />
    </form>
  );
};

export default HarvestForm;
