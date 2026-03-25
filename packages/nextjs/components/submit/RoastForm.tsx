"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchSelect from "./BatchSelect";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";
import LocationInput from "./LocationInput";
import MediaPreview from "./MediaPreview";
import MediaUploader from "./MediaUploader";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useFormFields } from "~~/hooks/useFormFields";
import { useMediaFiles } from "~~/hooks/useMediaFiles";
import { ROASTING_METHODS, ROAST_LEVELS, toUnixSeconds } from "~~/utils/coffee";
import { ROAST_INITIAL_FORM } from "~~/utils/forms";
import { ensureQrCode, fetchMetadata, getOrCreateGroup, mergeGallery, pinJSON, uploadGallery } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const RoastForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(ROAST_INITIAL_FORM);
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
    const notificationId = notification.loading("Adding roasting data and pinning to IPFS...");
    let newMetadataCID = "";

    try {
      const groupId = await getOrCreateGroup("CoffeeTracker-local-batch");
      const metadata = await fetchMetadata(batchData.metadataCID);
      const galleryCIDs = await uploadGallery(mediaFiles, form.batchNumber.trim());

      await ensureQrCode(metadata, batchData.batchNumber);

      // Merge roasting data
      metadata.attributes.push({ trait_type: "Stage", value: "Roasted" });
      metadata.attributes.push({ trait_type: "Roast Level", value: ROAST_LEVELS[Number(form.roastLevel)] });

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
            notification.success(`Batch ${form.batchNumber.trim()} was roasted onchain.`);
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
      <FormHeader title="Roast Batch" description="Enter the roasting data to update a batch." />

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <div className="form-control w-full">
            <span className="text-label mb-2">Batch Number</span>
            <BatchSelect
              value={form.batchNumber}
              onSelect={val => updateField("batchNumber", val)}
              requiredStage="Processed"
              isDisabled={isDisabled}
            />
          </div>

          {/* Row 1, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Roasting Method</span>
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

          {/* Row 2, Col 1 — Spans 2 Rows */}
          <label className="form-control w-full md:row-span-2 flex flex-col h-full">
            <span className="text-label mb-2">Cupping Notes</span>
            <textarea
              className="textarea textarea-bordered w-full text-sm resize-none flex-grow"
              placeholder="Milk chocolate, roasted macadamia nut, brown sugar, hints of tropical fruit"
              value={form.cuppingNotes}
              onChange={e => updateField("cuppingNotes", e.target.value)}
            />
          </label>

          {/* Row 2, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Roasting Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.roastingDate}
              onChange={e => updateField("roastingDate", e.target.value)}
            />
          </label>

          {/* Row 3, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Roast Level</span>
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
          </label>

          {/* Row 4, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Before Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="272"
              min="0"
              type="number"
              value={form.beforeWeight}
              onChange={e => updateField("beforeWeight", e.target.value)}
            />
          </label>

          {/* Row 4, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Transport Time (days)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="3"
              min="0"
              type="number"
              value={form.transportTime}
              onChange={e => updateField("transportTime", e.target.value)}
            />
          </label>

          {/* Row 5, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">After Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="233"
              min="0"
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
            latPlaceholder="19.636820"
            longPlaceholder="-155.993450"
          />
        </div>
      </div>

      <FormFooter
        onReset={resetForm}
        isUploading={isUploading}
        isMining={isMining}
        submitLabel="Roast Batch"
        disabled={isDisabled}
        submitDisabled={!batchData || (batchData?.batchId ?? 0n) === 0n}
      />
    </form>
  );
};

export default RoastForm;
