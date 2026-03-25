"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchSelect from "./BatchSelect";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";
import LocationInput from "./LocationInput";
import MediaPreview from "./MediaPreview";
import MediaUploader from "./MediaUploader";
import { zeroAddress } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useFormFields } from "~~/hooks/useFormFields";
import { useMediaFiles } from "~~/hooks/useMediaFiles";
import { PROCESSING_METHODS, toUnixSeconds } from "~~/utils/coffee";
import { PROCESS_INITIAL_FORM } from "~~/utils/forms";
import { ensureQrCode, fetchMetadata, getOrCreateGroup, mergeGallery, pinJSON, uploadGallery } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const ProcessForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(PROCESS_INITIAL_FORM);
  const { mediaFiles, addFiles, updateDescription, removeFile, resetFiles } = useMediaFiles();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

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
    const notificationId = notification.loading("Adding processing data and pinning to IPFS...");
    let newMetadataCID = "";

    try {
      const groupId = await getOrCreateGroup("CoffeeTracker-local-batch");
      const metadata = await fetchMetadata(batchData.metadataCID);
      const galleryCIDs = await uploadGallery(mediaFiles, form.batchNumber.trim());

      await ensureQrCode(metadata, batchData.batchNumber);

      // Merge processing data
      metadata.attributes.push({ trait_type: "Stage", value: "Processed" });
      metadata.attributes.push({
        trait_type: "Processing Method",
        value: PROCESSING_METHODS[Number(form.processingMethod)],
      });
      metadata.attributes.push({ trait_type: "SCA Score", value: scaScore });

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
            notification.success(`Batch ${form.batchNumber.trim()} was processed onchain.`);
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
      <FormHeader title="Process Batch" description="Enter the processing data to update a batch." />

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <div className="form-control w-full">
            <span className="text-label mb-2">Batch Number</span>
            <BatchSelect
              value={form.batchNumber}
              onSelect={val => updateField("batchNumber", val)}
              requiredStage="Harvested"
              isDisabled={isDisabled}
            />
          </div>

          {/* Row 1, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Processing Method</span>
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
          </label>

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
          <label className="form-control w-full">
            <span className="text-label mb-2">SCA Score</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="86.5"
              step="0.1"
              min="0"
              max="100"
              type="number"
              value={form.scaScore}
              onChange={e => updateField("scaScore", e.target.value)}
            />
          </label>

          {/* Row 2, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Processing Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.processingDate}
              onChange={e => updateField("processingDate", e.target.value)}
            />
          </label>

          {/* Row 3, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Humidity (%)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="72"
              step="0.1"
              type="number"
              value={form.humidity}
              onChange={e => updateField("humidity", e.target.value)}
            />
          </label>

          {/* Row 3, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Dry Temperature (°C)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="28.5"
              step="0.1"
              type="number"
              value={form.dryTemperature}
              onChange={e => updateField("dryTemperature", e.target.value)}
            />
          </label>

          {/* Row 4, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Before Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="1360"
              type="number"
              value={form.beforeWeight}
              onChange={e => updateField("beforeWeight", e.target.value)}
            />
          </label>

          {/* Row 4, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Moisture Content (%)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="decimal"
              placeholder="11.2"
              step="0.1"
              type="number"
              value={form.moistureContent}
              onChange={e => updateField("moistureContent", e.target.value)}
            />
          </label>

          {/* Row 5, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">After Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              min="0"
              placeholder="272"
              type="number"
              value={form.afterWeight}
              onChange={e => updateField("afterWeight", e.target.value)}
            />
          </label>

          {/* Row 5, Col 2 */}
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={updateField}
            disabled={isDisabled}
            latPlaceholder="19.521480"
            longPlaceholder="-155.907250"
          />
        </div>
      </div>

      <FormFooter
        onReset={resetForm}
        isUploading={isUploading}
        isMining={isMining}
        submitLabel="Process Batch"
        disabled={isDisabled}
        submitDisabled={!batchData || (batchData?.batchId ?? 0n) === 0n}
      />
    </form>
  );
};

export default ProcessForm;
