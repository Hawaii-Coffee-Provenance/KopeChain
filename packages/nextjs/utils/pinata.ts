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
    batchNumber: string;
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
      nft?: string;
      qrCode?: string;
    };
  };
};

export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud";

export const ipfsToHTTP = (uri: string) =>
  uri.startsWith("ipfs://") ? `${PINATA_GATEWAY}/ipfs/${uri.replace("ipfs://", "")}` : uri;

export async function fetchMetadata(cid: string): Promise<BatchMetadata> {
  const url = `${PINATA_GATEWAY}/ipfs/${cid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPFS fetch failed for CID ${cid}`);
  return res.json();
}
