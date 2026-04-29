export type Coordinates = {
  latitude: number;
  longitude: number;
};

// Raw Struct From Contract
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
  batchName: string;
  metadataCID: string;
};

// Display Data
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
  batchName: string;
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
    nft?: { cid: string; description: string };
    qrCode?: { cid: string; description: string };
    gallery?: Array<{ cid: string; description: string }>;
  };
};

// Metadata Stored on IPFS
export type BatchMetadata = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties: {
    batchName: string;
    harvest?: {
      farmName: string;
      region: string;
      variety: string;
      elevation: number;
      harvestDate: number;
      harvestWeight: number;
      location: { latitude: number; longitude: number };
    };
    processing?: {
      processingMethod: string;
      moistureContent: number;
      scaScore: number;
      humidity: number;
      dryTemperature: number;
      processingDate: number;
      beforeWeight: number;
      afterWeight: number;
      location: { latitude: number; longitude: number };
    };
    roasting?: {
      roastingMethod: string;
      roastLevel: string;
      cuppingNotes: string;
      roastingDate: number;
      transportTime: number;
      beforeWeight: number;
      afterWeight: number;
      location: { latitude: number; longitude: number };
    };
    distribution?: {
      distributionDate: number;
      bagCount: number;
      distributionWeight: number;
      destination: string;
      location: { latitude: number; longitude: number };
    };
    images: {
      nft?: { cid: string; description: string };
      qrCode?: { cid: string; description: string };
      gallery?: Array<{ cid: string; description: string }>;
    };
  };
};

// Map BatchId to Hashes
export type BatchTxHashes = {
  harvested?: `0x${string}`;
  processed?: `0x${string}`;
  roasted?: `0x${string}`;
  distributed?: `0x${string}`;
  verified?: `0x${string}`;
};
