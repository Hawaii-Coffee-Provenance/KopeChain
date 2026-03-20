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

// TODO: REPLACE
const PLACEHOLDER_IMAGE_CID = "bafybeidw72h3yqxdx2rzd2sxolcexquoqgovpj6lnwhbvit75bouznbkd4";

export function buildMetadata(data: (typeof defaultData)[0]): BatchMetadata {
  const h = data.harvestData;
  const p = data.processingData;
  const regionName = REGIONS[h.region] ?? "Other";
  const varietyName = VARIETIES[h.variety] ?? "Other";

  return {
    name: `${regionName} ${varietyName} — ${data.batchNumber}`,
    description: `Single origin ${varietyName} harvested at ${h.elevation}m. Farm: ${h.farmName}.`,
    image: `ipfs://${PLACEHOLDER_IMAGE_CID}`,
    external_url: `${APP_URL}/batch/${data.batchNumber}`,

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
      images: {
        nft: `ipfs://${PLACEHOLDER_IMAGE_CID}`,
      },
    },
  };
}
