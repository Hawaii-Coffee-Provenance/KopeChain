import { DistributeFormState, HarvestFormState, ProcessFormState, RoastFormState } from "~~/types/forms";

export const HARVEST_INITIAL_FORM: HarvestFormState = {
  batchName: "",
  farmName: "",
  region: "0",
  variety: "0",
  elevation: "",
  harvestDate: "",
  harvestWeight: "",
  latitude: "",
  longitude: "",
};

export const PROCESS_INITIAL_FORM: ProcessFormState = {
  batchName: "",
  processingMethod: "0",
  moistureContent: "",
  scaScore: "",
  humidity: "",
  dryTemperature: "",
  processingDate: "",
  beforeWeight: "",
  afterWeight: "",
  latitude: "",
  longitude: "",
};

export const ROAST_INITIAL_FORM: RoastFormState = {
  batchName: "",
  roastingMethod: "0",
  roastLevel: "0",
  cuppingNotes: "",
  roastingDate: "",
  transportTime: "",
  beforeWeight: "",
  afterWeight: "",
  latitude: "",
  longitude: "",
};

export const DISTRIBUTE_INITIAL_FORM: DistributeFormState = {
  batchName: "",
  distributionDate: "",
  bagCount: "",
  distributionWeight: "",
  destination: "",
  latitude: "",
  longitude: "",
};

type CopyFeedbackOptions<T> = {
  value: string;
  showValue: T;
  clearValue: T;
  setShowCopiedText: (value: T) => void;
  setCopied?: (value: T) => void;
  resetDelayMs?: number;
  hideDelayMs?: number;
};

export const copyWithFeedback = <T>({
  value,
  showValue,
  clearValue,
  setShowCopiedText,
  setCopied,
  resetDelayMs = 2000,
  hideDelayMs = 500,
}: CopyFeedbackOptions<T>) => {
  if (typeof window === "undefined" || !navigator?.clipboard) return;
  navigator.clipboard.writeText(value);
  setCopied?.(showValue);
  setShowCopiedText(showValue);
  setTimeout(() => {
    setCopied?.(clearValue);
    setTimeout(() => setShowCopiedText(clearValue), hideDelayMs);
  }, resetDelayMs);
};
