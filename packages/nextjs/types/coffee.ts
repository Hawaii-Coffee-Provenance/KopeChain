import { zeroAddress } from "viem";

export type CoffeeBatch = {
  batchId: bigint;
  batchNumber: string;
  verified: boolean;
  mintTimestamp: bigint;

  farmer: string;
  farmName: string;
  region: number;
  variety: number;
  elevation: number;
  harvestWeight: bigint;
  harvestDate: bigint;

  processor: string;
  processingMethod: number;
  processingBeforeWeight: bigint;
  processingAfterWeight: bigint;
  moistureContent: number;
  scaScore: number;
  humidity: number;
  dryTemperature: number;

  roaster: string;
  roastingMethod: number;
  roastingBeforeWeight: bigint;
  roastingAfterWeight: bigint;
  roastLevel: number;
  cuppingNotes: string;
  transportTime: number;
  distributor: string;
};

export const REGIONS: Record<number, string> = {
  0: "Kona",
  1: "Ka'ū",
  2: "Puna",
  3: "Hamakua",
  4: "Maui",
  5: "Kauai",
  6: "Other",
};

export const VARIETIES: Record<number, string> = {
  0: "Arabica",
  1: "Geisha",
  2: "Typica",
  3: "Caturra",
  4: "Catuai",
  5: "Maui Mokka",
  6: "Bourbon",
  7: "Peaberry",
  8: "Maragogype",
  9: "Other",
};

export const PROCESSING_METHODS: Record<number, string> = {
  0: "Natural",
  1: "Washed",
  2: "Honey",
  3: "Anaerobic",
  4: "Other",
};

export const ROASTING_METHODS: Record<number, string> = {
  0: "Drum",
  1: "Hot Air",
  2: "Fluid Bed",
  3: "Infrared",
  4: "Other",
};

export const ROAST_LEVELS: Record<number, string> = {
  0: "Light",
  1: "Medium",
  2: "Dark",
  3: "Other",
};

export type PipelineData = {
  harvested: number;
  processed: number;
  roasted: number;
  distributed: number;
};

export type RegionData = { name: string; count: number }[];

export type ScaBucket = { score: string; count: number };

export const PIPELINE_SEGMENTS = [
  { key: "harvested", label: "Harvested", color: "var(--color-stage-harvest)" },
  { key: "processed", label: "Processed", color: "var(--color-stage-process)" },
  { key: "roasted", label: "Roasted", color: "var(--color-stage-roast)" },
  { key: "distributed", label: "Distributed", color: "var(--color-stage-distribute)" },
] as const;

export const SCA_TIERS = [
  { min: 90, label: "Excellent", color: "#4a6741", qualityClass: "text-primary" },
  { min: 86, label: "Very Good", color: "#4a6741cc", qualityClass: "text-primary" },
  { min: 82, label: "Good", color: "#4a674199", qualityClass: "text-primary" },
  { min: 0, label: "Below Specialty", color: "#4a674155", qualityClass: "text-secondary" },
] as const;

export const getScaTier = (score: number) => SCA_TIERS.find(t => score >= t.min) ?? SCA_TIERS[SCA_TIERS.length - 1];

export const REGION_TO_ISLAND: Record<number, string> = {
  0: "Hawai'i Island",
  1: "Hawai'i Island",
  2: "Hawai'i Island",
  3: "Hawai'i Island",
  4: "Maui",
  5: "Kauai",
  6: "Unknown",
};

export const STAGES = ["Harvested", "Processed", "Roasted", "Distributed"] as const;
export type Stage = (typeof STAGES)[number];

export type StageFilter = "All" | Stage | "Verified";
export type SortOrder = "newest" | "oldest";
export type BatchFilterState = {
  stage: StageFilter;
  region: string;
  sort: SortOrder;
};

export const getStage = (batch: CoffeeBatch): Stage => {
  if (batch.distributor !== zeroAddress) return "Distributed";
  if (batch.roastingAfterWeight > 0n) return "Roasted";
  if (batch.processingAfterWeight > 0n) return "Processed";
  return "Harvested";
};

export const STAGE_STYLES: Record<Stage, string> = {
  Harvested: "bg-stage-harvest text-cream",
  Processed: "bg-stage-process text-cream",
  Roasted: "bg-stage-roast text-cream",
  Distributed: "bg-stage-distribute text-cream",
};
