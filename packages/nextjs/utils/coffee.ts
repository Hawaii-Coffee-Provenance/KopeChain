import { zeroAddress } from "viem";
import { BatchMetadata, CoffeeBatch, Coordinates, RawBatch } from "~~/types/batch";
import { Stage } from "~~/types/coffee";

export type { CoffeeBatch, Coordinates };

export const STAGES = ["Harvested", "Processed", "Roasted", "Distributed"] as const;

export const COORD_SCALE = 1_000_000;

export const formatTimestamp = (timestamp: bigint | number): string => {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;

  if (diff <= 0) return "0s ago";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts * 1000).toLocaleDateString();
};

export const formatDate = (timestamp: bigint | number | undefined): string => {
  if (!timestamp) return "—";
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleDateString();
};

export const formatWeight = (weight: bigint | number): string => {
  const w = typeof weight === "bigint" ? Number(weight) : weight;
  return w >= 1000 ? `${(w / 1000).toFixed(2)}k` : `${w}`;
};

export const formatCoordinates = (c?: Coordinates | null): string => {
  if (!c || c.latitude === undefined || c.longitude === undefined) return "—";
  return `${Number(c.latitude).toFixed(6)}, ${Number(c.longitude).toFixed(6)}`;
};

export const toUnixSeconds = (value: string) => Math.floor(new Date(`${value}T00:00:00`).getTime() / 1000);

export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
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
  Kona: "var(--region-kona)",
  "Ka'ū": "var(--region-kau)",
  Puna: "var(--region-puna)",
  Hamakua: "var(--region-hamakua)",
  Maui: "var(--region-maui)",
  Kauai: "var(--region-kauai)",
  Molokai: "var(--region-molokai)",
  Oahu: "var(--region-oahu)",
  Other: "var(--region-other)",
};

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

export const getStage = (batch: CoffeeBatch): Stage => {
  if (batch.distributor !== zeroAddress) return "Distributed";
  if (batch.roaster !== zeroAddress) return "Roasted";
  if (batch.processor !== zeroAddress) return "Processed";
  return "Harvested";
};

export const PIPELINE_SEGMENTS = STAGES.map(stage => ({
  key: stage.toLowerCase() as Lowercase<Stage>,
  label: stage,
  color: STAGE_COLORS[stage],
}));

export const SCA_TIERS = [
  { min: 90, label: "Excellent", color: "var(--color-stage-process)", qualityClass: "text-primary" },
  {
    min: 86,
    label: "Very Good",
    color: "color-mix(in srgb, var(--color-stage-process), transparent 20%)",
    qualityClass: "text-primary",
  },
  {
    min: 82,
    label: "Good",
    color: "color-mix(in srgb, var(--color-stage-process), transparent 40%)",
    qualityClass: "text-primary",
  },
  {
    min: 0,
    label: "Below Specialty",
    color: "color-mix(in srgb, var(--color-stage-process), transparent 66%)",
    qualityClass: "text-error",
  },
] as const;

export const getScaTier = (score: number) => SCA_TIERS.find(t => score >= t.min) ?? SCA_TIERS[SCA_TIERS.length - 1];

export function mapBatch(raw: RawBatch, metadata?: BatchMetadata | null): CoffeeBatch {
  const h = metadata?.properties?.harvest;
  const p = metadata?.properties?.processing;
  const r = metadata?.properties?.roasting;
  const d = metadata?.properties?.distribution;

  const DEFAULT_COORDS: Coordinates = { latitude: 0, longitude: 0 };
  const mappedImages = { ...(metadata?.properties?.images ?? {}) };

  return {
    batchId: raw.batchId,
    mintTimestamp: BigInt(raw.mintTimestamp),
    verified: raw.verified,
    region: Number(raw.region),
    variety: Number(raw.variety),
    processingMethod: Number(raw.processingMethod),
    roastingMethod: Number(raw.roastingMethod),
    roastLevel: Number(raw.roastLevel),
    farmer: raw.farmer,
    processor: raw.processor,
    roaster: raw.roaster,
    distributor: raw.distributor,
    batchNumber: raw.batchNumber,
    metadataCID: raw.metadataCID,

    farmName: h?.farmName ?? "",
    elevation: h?.elevation ?? 0,
    harvestWeight: BigInt(h?.harvestWeight ?? 0),
    harvestDate: BigInt(h?.harvestDate ?? 0),
    harvestLocation: h?.location ?? DEFAULT_COORDS,

    moistureContent: p?.moistureContent ?? 0,
    scaScore: p?.scaScore ?? 0,
    humidity: p?.humidity ?? 0,
    dryTemperature: p?.dryTemperature ?? 0,
    processingDate: BigInt(p?.processingDate ?? 0),
    processingBeforeWeight: BigInt(p?.beforeWeight ?? 0),
    processingAfterWeight: BigInt(p?.afterWeight ?? 0),
    processingLocation: p?.location ?? DEFAULT_COORDS,

    cuppingNotes: r?.cuppingNotes ?? "",
    roastingDate: BigInt(r?.roastingDate ?? 0),
    transportTime: r?.transportTime ?? 0,
    roastingBeforeWeight: BigInt(r?.beforeWeight ?? 0),
    roastingAfterWeight: BigInt(r?.afterWeight ?? 0),
    roastingLocation: r?.location ?? DEFAULT_COORDS,

    distributionDate: BigInt(d?.distributionDate ?? 0),
    bagCount: d?.bagCount ?? 0,
    distributionWeight: BigInt(d?.distributionWeight ?? 0),
    destination: d?.destination ?? "",
    distributionLocation: d?.location ?? DEFAULT_COORDS,

    images: mappedImages,
  };
}
