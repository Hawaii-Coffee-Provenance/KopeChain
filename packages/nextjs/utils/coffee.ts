import { zeroAddress } from "viem";
import { CoffeeBatch, Coordinates, STAGES, Stage } from "~~/types/coffee";

export { STAGES };
export type { Stage, CoffeeBatch, Coordinates };

export const COORD_SCALE = 1_000_000;

export const formatCoordinates = (c?: Coordinates | null): string => {
  if (!c || c.latitude === undefined || c.longitude === undefined) return "—";
  return `${Number(c.latitude).toFixed(6)}, ${Number(c.longitude).toFixed(6)}`;
};

export const REGIONS: Record<number, string> = {
  0: "Kona",
  1: "Ka'ū",
  2: "Puna",
  3: "Hamakua",
  4: "Maui",
  5: "Kauai",
  6: "Molokai",
  7: "Oahu",
  8: "Other",
};

export const REGION_COLORS: Record<string, string> = {
  Kona: "#6F4E37", // Coffee Brown
  "Ka'ū": "#A84632", // Volcanic Red
  Puna: "#D46A2A", // Lava/Sunset Orange
  Hamakua: "#4A7856", // Tropical Emerald
  Maui: "#E2AA46", // Haleakalā Gold
  Kauai: "#37887E", // Na Pali Teal
  Molokai: "#9E5D4B", // Red Earth
  Oahu: "#395E8B", // Pacific Blue
  Other: "#A3A3A3", // Neutral Cool Gray
};

export const getRegionColor = (name: string) => REGION_COLORS[name] ?? REGION_COLORS["Other"];

export const VARIETIES: Record<number, string> = {
  0: "Typica",
  1: "Geisha",
  2: "Caturra",
  3: "Catuai",
  4: "Maui Mokka",
  5: "Bourbon",
  6: "Peaberry",
  7: "Maragogype",
  8: "Mundo Novo",
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

export const STAGE_COLORS = {
  Harvested: "var(--color-stage-harvest)",
  Processed: "var(--color-stage-process)",
  Roasted: "var(--color-stage-roast)",
  Distributed: "var(--color-stage-distribute)",
} as const;

export const STAGE_STYLES: Record<Stage, string> = {
  Harvested: "bg-stage-harvest text-cream",
  Processed: "bg-stage-process text-cream",
  Roasted: "bg-stage-roast text-cream",
  Distributed: "bg-stage-distribute text-cream",
};

export const PIPELINE_SEGMENTS = STAGES.map(stage => ({
  key: stage.toLowerCase() as Lowercase<Stage>,
  label: stage,
  color: STAGE_COLORS[stage],
}));

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
  6: "Molokai",
  7: "Oahu",
  8: "Unknown",
};

export const getStage = (batch: CoffeeBatch): Stage => {
  if (batch.distributor !== zeroAddress) return "Distributed";
  if (batch.roastingAfterWeight > 0n) return "Roasted";
  if (batch.processingAfterWeight > 0n) return "Processed";
  return "Harvested";
};

export const mapNestedToBatch = (nested: any): CoffeeBatch => ({
  batchId: nested.batchId,
  batchNumber: nested.batchNumber,
  verified: nested.verified,
  mintTimestamp: nested.mintTimestamp,

  region: nested.harvestData.region,
  variety: nested.harvestData.variety,
  elevation: nested.harvestData.elevation,
  harvestDate: nested.harvestData.harvestDate,
  harvestWeight: nested.harvestData.harvestWeight,
  farmer: nested.harvestData.farmer,
  farmName: nested.harvestData.farmName,
  harvestLocation: {
    latitude: nested.harvestData.location.latitude / COORD_SCALE,
    longitude: nested.harvestData.location.longitude / COORD_SCALE,
  },

  processingMethod: nested.processingData.processingMethod,
  moistureContent: nested.processingData.moistureContent,
  scaScore: nested.processingData.scaScore,
  humidity: nested.processingData.humidity,
  dryTemperature: nested.processingData.dryTemperature,
  processingDate: nested.processingData.processingDate,
  processingBeforeWeight: nested.processingData.beforeWeight,
  processingAfterWeight: nested.processingData.afterWeight,
  processor: nested.processingData.processor,
  processingLocation: {
    latitude: nested.processingData.location.latitude / COORD_SCALE,
    longitude: nested.processingData.location.longitude / COORD_SCALE,
  },

  roastingMethod: nested.roastingData.roastingMethod,
  roastLevel: nested.roastingData.roastLevel,
  transportTime: nested.roastingData.transportTime,
  roastingDate: nested.roastingData.roastingDate,
  roastingBeforeWeight: nested.roastingData.beforeWeight,
  roastingAfterWeight: nested.roastingData.afterWeight,
  roaster: nested.roastingData.roaster,
  cuppingNotes: nested.roastingData.cuppingNotes,
  roastingLocation: {
    latitude: nested.roastingData.location.latitude / COORD_SCALE,
    longitude: nested.roastingData.location.longitude / COORD_SCALE,
  },

  distributionDate: nested.distributionData.distributionDate,
  bagCount: nested.distributionData.bagCount,
  distributionWeight: nested.distributionData.distributionWeight,
  distributor: nested.distributionData.distributor,
  destination: nested.distributionData.destination,
  distributionLocation: {
    latitude: nested.distributionData.location.latitude / COORD_SCALE,
    longitude: nested.distributionData.location.longitude / COORD_SCALE,
  },
});
