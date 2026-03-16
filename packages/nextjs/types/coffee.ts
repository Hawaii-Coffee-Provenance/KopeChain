export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CoffeeBatch = {
  batchId: bigint;
  batchNumber: string;
  verified: boolean;
  mintTimestamp: bigint;

  // HarvestData
  region: number;
  variety: number;
  elevation: number;
  harvestDate: bigint;
  harvestWeight: bigint;
  farmer: string;
  farmName: string;
  harvestLocation: Coordinates;

  // ProcessingData
  processingMethod: number;
  moistureContent: number;
  scaScore: number;
  humidity: number;
  dryTemperature: number;
  processingDate: bigint;
  processingBeforeWeight: bigint;
  processingAfterWeight: bigint;
  processor: string;
  processingLocation: Coordinates;

  // RoastingData
  roastingMethod: number;
  roastLevel: number;
  transportTime: number;
  roastingDate: bigint;
  roastingBeforeWeight: bigint;
  roastingAfterWeight: bigint;
  roaster: string;
  cuppingNotes: string;
  roastingLocation: Coordinates;

  // DistributionData
  distributionDate: bigint;
  bagCount: number;
  distributionWeight: bigint;
  distributor: string;
  destination: string;
  distributionLocation: Coordinates;
};

export type PipelineData = {
  harvested: number;
  processed: number;
  roasted: number;
  distributed: number;
};

export type RegionData = { name: string; count: number }[];

export type ScaBucket = { score: string; count: number };

export const STAGES = ["Harvested", "Processed", "Roasted", "Distributed"] as const;
export type Stage = (typeof STAGES)[number];

export type StageFilter = "All" | Stage | "Verified";
export type SortOrder = "newest" | "oldest";
export type BatchFilterState = {
  stage: StageFilter;
  region: string;
  sort: SortOrder;
};
