import defaultData from "../data/default-data.json";
import { BatchMetadata } from "./pinata";

const REGIONS = ["Kona", "Kau", "Puna", "Hamakua", "Maui", "Kauai", "Molokai", "Oahu", "Other"];
const VARIETIES = [
  "Typica",
  "Geisha",
  "Caturra",
  "Catuai",
  "MauiMokka",
  "Bourbon",
  "Peaberry",
  "Maragogype",
  "MundoNovo",
  "Other",
];
export const PROCESSING_METHODS = ["Natural", "Washed", "Honey", "Anaerobic", "Other"];
export const ROASTING_METHODS = ["Drum", "HotAir", "FluidBed", "Infrared", "Other"];
export const ROAST_LEVELS = ["Light", "Medium", "Dark", "Other"];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const PLACEHOLDER_IMAGE_CID = "bafybeidw72h3yqxdx2rzd2sxolcexquoqgovpj6lnwhbvit75bouznbkd4";

export type SeedStages = {
  processed: boolean;
  roasted: boolean;
  distributed: boolean;
  qrCID: string;
};

export function buildFullMetadata(data: (typeof defaultData)[0], stages: SeedStages): BatchMetadata {
  const h = data.harvestData;
  const p = data.processingData;
  const r = data.roastingData;
  const d = data.distributionData;
  const regionName = REGIONS[h.region] ?? "Other";
  const varietyName = VARIETIES[h.variety] ?? "Other";

  return {
    name: `${regionName} ${varietyName} — ${data.batchNumber}`,
    description: `Single origin ${varietyName} harvested at ${h.elevation}m. Farm: ${h.farmName}.`,
    image: `ipfs://${PLACEHOLDER_IMAGE_CID}`,
    external_url: `${APP_URL}/explore/batch/${data.batchNumber}`,

    attributes: [
      { trait_type: "Region", value: regionName },
      { trait_type: "Variety", value: varietyName },
      { trait_type: "Elevation (m)", value: h.elevation, display_type: "number" },
      { trait_type: "Harvest Weight (kg)", value: h.harvestWeight, display_type: "number" },
      { trait_type: "SCA Score", value: p.scaScore, display_type: "number" },
      { trait_type: "Verified", value: data.verified ? "Yes" : "No" },
    ],

    properties: {
      batchNumber: data.batchNumber,
      harvest: {
        farmName: h.farmName,
        region: regionName,
        variety: varietyName,
        elevation: h.elevation,
        harvestDate: h.harvestDate,
        harvestWeight: h.harvestWeight,
        location: {
          latitude: h.location.latitude / 1e6,
          longitude: h.location.longitude / 1e6,
        },
      },
      ...(stages.processed && {
        processing: {
          processingMethod: PROCESSING_METHODS[p.processingMethod],
          moistureContent: p.moistureContent,
          scaScore: p.scaScore,
          humidity: p.humidity,
          dryTemperature: p.dryTemperature,
          processingDate: p.processingDate,
          beforeWeight: p.beforeWeight,
          afterWeight: p.afterWeight,
          location: { latitude: p.location.latitude / 1e6, longitude: p.location.longitude / 1e6 },
        },
      }),
      ...(stages.roasted && {
        roasting: {
          roastingMethod: ROASTING_METHODS[r.roastingMethod],
          roastLevel: ROAST_LEVELS[r.roastLevel],
          cuppingNotes: r.cuppingNotes,
          roastingDate: r.roastingDate,
          transportTime: r.transportTime,
          beforeWeight: r.beforeWeight,
          afterWeight: r.afterWeight,
          location: { latitude: r.location.latitude / 1e6, longitude: r.location.longitude / 1e6 },
        },
      }),
      ...(stages.distributed && {
        distribution: {
          distributionDate: d.distributionDate,
          bagCount: d.bagCount,
          distributionWeight: d.distributionWeight,
          destination: d.destination,
          location: { latitude: d.location.latitude / 1e6, longitude: d.location.longitude / 1e6 },
        },
      }),
      images: {
        nft: { cid: `ipfs://${PLACEHOLDER_IMAGE_CID}`, description: "Batch NFT Certificate" },
        qrCode: { cid: `ipfs://${stages.qrCID}`, description: `Scan to view batch ${data.batchNumber}` },
        gallery: [
          { cid: `ipfs://${PLACEHOLDER_IMAGE_CID}`, description: "Image 1" },
          { cid: `ipfs://${PLACEHOLDER_IMAGE_CID}`, description: "Image 2" },
          { cid: `ipfs://${PLACEHOLDER_IMAGE_CID}`, description: "Image 3" },
        ],
      },
    },
  };
}
