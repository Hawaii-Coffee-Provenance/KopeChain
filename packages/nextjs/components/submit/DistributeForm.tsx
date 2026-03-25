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
import { toUnixSeconds } from "~~/utils/coffee";
import { DISTRIBUTE_INITIAL_FORM } from "~~/utils/forms";
import { ensureQrCode, fetchMetadata, getOrCreateGroup, mergeGallery, pinJSON, uploadGallery } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const DistributeForm = () => {
  const { form, updateField, resetForm: resetFormFields } = useFormFields(DISTRIBUTE_INITIAL_FORM);
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
      !form.distributionDate ||
      !form.bagCount ||
      !form.distributionWeight ||
      !form.destination ||
      !form.latitude ||
      !form.longitude
    ) {
      notification.error("Complete every field before submitting.");
      return;
    }

    if (!batchData) return;

    const bagCount = Number(form.bagCount);
    const distributionWeight = Number(form.distributionWeight);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const distributionDate = toUnixSeconds(form.distributionDate);

    if ([bagCount, distributionWeight, latitude, longitude, distributionDate].some(value => Number.isNaN(value))) {
      notification.error("Check the numeric fields. One or more values are invalid.");
      return;
    }

    setIsUploading(true);
    const notificationId = notification.loading("Finalizing distribution data and pinning to IPFS...");
    let newMetadataCID = "";

    try {
      const groupId = await getOrCreateGroup("CoffeeTracker-local-batch");
      const metadata = await fetchMetadata(batchData.metadataCID);
      const galleryCIDs = await uploadGallery(mediaFiles, form.batchNumber.trim());

      await ensureQrCode(metadata, batchData.batchNumber);

      // Merge distribution data
      metadata.attributes.push({ trait_type: "Stage", value: "Distributed" });

      metadata.properties.distribution = {
        distributionDate,
        bagCount,
        distributionWeight,
        destination: form.destination.trim(),
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
          functionName: "distributeBatch",
          args: [batchData.batchId, newMetadataCID],
        },
        {
          onBlockConfirmation: () => {
            notification.success(`Batch ${form.batchNumber.trim()} was distributed onchain.`);
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
      <FormHeader title="Distribute Batch" description="Enter the distribution data to finalize a batch." />

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-x-6">
          {/* Row 1, Col 1 */}
          <div className="form-control w-full">
            <span className="text-label mb-2">Batch Number</span>
            <BatchSelect
              value={form.batchNumber}
              onSelect={val => updateField("batchNumber", val)}
              requiredStage="Roasted"
              isDisabled={isDisabled}
            />
          </div>

          {/* Row 1, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Destination</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              placeholder="Kailua-Kona Cafe"
              value={form.destination}
              onChange={e => updateField("destination", e.target.value)}
            />
          </label>

          {/* Row 1, Col 3 — Spans 3 Rows (Last on mobile) */}
          <div className="order-last md:order-none md:col-start-3 md:row-start-1 md:row-span-3 relative">
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
            <span className="text-label mb-2">Total Distribute Weight (kg)</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="233"
              min="0"
              type="number"
              value={form.distributionWeight}
              onChange={e => updateField("distributionWeight", e.target.value)}
            />
          </label>

          {/* Row 2, Col 2 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Distribution Date</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              type="date"
              value={form.distributionDate}
              onChange={e => updateField("distributionDate", e.target.value)}
            />
          </label>

          {/* Row 3, Col 1 */}
          <label className="form-control w-full">
            <span className="text-label mb-2">Bag Count</span>
            <input
              className="input input-bordered w-full text-sm h-10"
              inputMode="numeric"
              placeholder="25"
              min="0"
              type="number"
              value={form.bagCount}
              onChange={e => updateField("bagCount", e.target.value)}
            />
          </label>

          {/* Row 3, Col 2 */}
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={updateField}
            disabled={isDisabled}
            latPlaceholder="19.641720"
            longPlaceholder="-155.996480"
          />
        </div>
      </div>

      <FormFooter
        onReset={resetForm}
        isUploading={isUploading}
        isMining={isMining}
        submitLabel="Distribute Batch"
        disabled={isDisabled}
        submitDisabled={!batchData || (batchData?.batchId ?? 0n) === 0n}
      />
    </form>
  );
};

export default DistributeForm;
