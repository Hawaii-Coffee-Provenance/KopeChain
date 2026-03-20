export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RawBatch = {
  batchId: bigint;
  mintTimestamp: number;
  verified: boolean;
  region: number;
  variety: number;
  processingMethod: number;
  roastingMethod: number;
  roastLevel: number;
  farmer: `0x${string}`;
  processor: `0x${string}`;
  roaster: `0x${string}`;
  distributor: `0x${string}`;
  batchNumber: string;
  metadataCID: string;
};

export type CoffeeBatch = {
  batchId: bigint;
  mintTimestamp: bigint;
  verified: boolean;
  region: number;
  variety: number;
  processingMethod: number;
  roastingMethod: number;
  roastLevel: number;
  farmer: string;
  processor: string;
  roaster: string;
  distributor: string;
  batchNumber: string;
  metadataCID: string;

  farmName: string;
  elevation: number;
  harvestDate: bigint;
  harvestWeight: bigint;
  harvestLocation: Coordinates;

  moistureContent: number;
  scaScore: number;
  humidity: number;
  dryTemperature: number;
  processingDate: bigint;
  processingBeforeWeight: bigint;
  processingAfterWeight: bigint;
  processingLocation: Coordinates;

  transportTime: number;
  roastingDate: bigint;
  roastingBeforeWeight: bigint;
  roastingAfterWeight: bigint;
  cuppingNotes: string;
  roastingLocation: Coordinates;

  distributionDate: bigint;
  bagCount: number;
  distributionWeight: bigint;
  destination: string;
  distributionLocation: Coordinates;

  images: {
    nft?: string;
    qrCode?: string;
  };
};

export type PipelineData = {
  harvested: number;
  processed: number;
  roasted: number;
  distributed: number;
};

export type RegionCounter = {
  name: string;
  count: number;
};

export type RegionData = RegionCounter[];

export type ScaBucket = {
  score: string;
  count: number;
};

export type CoffeeTrackerStats = {
  totalBatches: number;
  batchesThisWeek: number;
  batchesToday: number;
  verifiedCount: number;
  verifiedPercent: number;
  averageScaScore: string | number;
  scaLabel: string;
  highestSca: number;
  lowestSca: number;
  totalWeightDisplay: string;
  islandCount: number;

  pipeline: PipelineData;
  regionCounters: RegionCounter[];
  scaBuckets: ScaBucket[];

  recentBatches: CoffeeBatch[];
  allBatches: CoffeeBatch[];

  averageElevation: number;
  averageYield: number;
  varietyCount: number;
  averageMoisture: number;
  processMethodCount: number;
  roastMethodCount: number;
  averageRoastWeightLoss: number;
  averageTransportTime: number;
};

export type Stage = "Harvested" | "Processed" | "Roasted" | "Distributed";

export type UserRole = "None" | "Farmer" | "Processor" | "Roaster" | "Distributor" | "Verifier" | "User";

export type StageFilter = "All" | Stage | "Verified";
export type SortOrder = "newest" | "oldest";
export type BatchFilterState = {
  stage: StageFilter;
  region: string;
  sort: SortOrder;
};

export type BatchTxHashes = {
  harvested?: `0x${string}`;
  processed?: `0x${string}`;
  roasted?: `0x${string}`;
  distributed?: `0x${string}`;
  verified?: `0x${string}`;
};
