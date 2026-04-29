export type MediaFile = {
  file: File;
  description: string;
  mediapreview: string;
};

export type MediaPreviewProps = {
  mediaFiles: MediaFile[];
  onUpdateDescription: (index: number, description: string) => void;
  onRemoveFile: (index: number) => void;
  isDisabled?: boolean;
};

export type MediaUploaderProps = {
  onAddFiles: (files: FileList | null) => void;
  isDisabled?: boolean;
};

export type BatchData = {
  farmer: string;
  processor: string;
  roaster: string;
  distributor: string;
  batchId: bigint;
};

export type BatchSelectProps = {
  value: string;
  onSelect: (batchName: string) => void;
  requiredStage: "Harvested" | "Processed" | "Roasted";
  isDisabled?: boolean;
};

export type HarvestFormState = {
  batchName: string;
  farmName: string;
  region: string;
  variety: string;
  elevation: string;
  harvestDate: string;
  harvestWeight: string;
  latitude: string;
  longitude: string;
};

export type ProcessFormState = {
  batchName: string;
  processingMethod: string;
  moistureContent: string;
  scaScore: string;
  humidity: string;
  dryTemperature: string;
  processingDate: string;
  beforeWeight: string;
  afterWeight: string;
  latitude: string;
  longitude: string;
};

export type RoastFormState = {
  batchName: string;
  roastingMethod: string;
  roastLevel: string;
  cuppingNotes: string;
  roastingDate: string;
  transportTime: string;
  beforeWeight: string;
  afterWeight: string;
  latitude: string;
  longitude: string;
};

export type DistributeFormState = {
  batchName: string;
  distributionDate: string;
  bagCount: string;
  distributionWeight: string;
  destination: string;
  latitude: string;
  longitude: string;
};
