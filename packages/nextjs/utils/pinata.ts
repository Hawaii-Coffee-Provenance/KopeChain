import { generateQRBlob } from "./qrcode";
import { BatchMetadata } from "~~/types/batch";
import { MediaFile } from "~~/types/forms";

export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud";

export async function fetchMetadata(cid: string): Promise<BatchMetadata> {
  const url = `${PINATA_GATEWAY}/ipfs/${cid}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error(`IPFS fetch failed for CID ${cid}`);

  return res.json();
}

export async function pinJSON(
  content: BatchMetadata,
  name: string,
  batchNumber: string,
  groupId?: string,
): Promise<string> {
  const res = await fetch("/api/pin/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, name, batchNumber, groupId }),
  });

  if (!res.ok) throw new Error(`Pinata pinJSON failed: ${await res.text()}`);

  return (await res.json()).IpfsHash;
}

export async function getOrCreateGroup(name: string): Promise<string> {
  const res = await fetch(`/api/pin/group?name=${encodeURIComponent(name)}`);

  if (!res.ok) throw new Error(`Failed to get/create group: ${await res.text()}`);

  const data = await res.json();

  return data.id;
}

export type PinNFTParams = {
  region: string;
  stage: string;
  isVerified?: boolean;
  batchNumber: string;
  groupId: string;
  roastLevel?: string;
  existingSteam?: string;
  existingMug?: string;
  existingBand?: string;
};

export async function pinNFT(
  params: PinNFTParams,
): Promise<{ IpfsHash: string; traits: { mug: string; steam: string; band: string } }> {
  const res = await fetch("/api/pin/nft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`NFT generation failed: ${await res.text()}`);
  }

  const { buffer, traits } = await res.json();

  // Convert base64 buffer back to Blob
  const byteCharacters = atob(buffer);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  // Generate a File to upload (mocking browser File object usage)
  const file = new File([blob], `nft-${params.batchNumber}-${params.stage}.png`, { type: "image/png" });

  const cid = await pinFile(file, file.name, params.groupId);
  return { IpfsHash: cid, traits };
}

export async function pinQR(batchNumber: string, groupId: string): Promise<string> {
  const blob = await generateQRBlob(batchNumber, process.env.NEXT_PUBLIC_APP_URL);

  const formData = new FormData();

  formData.append("file", blob, `qr-${batchNumber}.png`);
  formData.append("pinataMetadata", JSON.stringify({ name: `qr-${batchNumber}.png` }));
  formData.append("pinataOptions", JSON.stringify({ groupId }));

  const res = await fetch("/api/pin/qr", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`QR upload failed: ${await res.text()}`);
  }

  return (await res.json()).IpfsHash;
}

export async function pinFile(file: File, name: string, groupId: string): Promise<string> {
  const formData = new FormData();

  formData.append("file", file, name);
  formData.append("pinataMetadata", JSON.stringify({ name }));
  formData.append("pinataOptions", JSON.stringify({ groupId }));

  const res = await fetch("/api/pin", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`File upload failed: ${await res.text()}`);

  return (await res.json()).IpfsHash;
}

export const ipfsToHTTP = (uri: string) => {
  if (!uri) return "";

  if (uri.startsWith("ipfs://")) {
    return `${PINATA_GATEWAY}/ipfs/${uri.replace("ipfs://", "")}`;
  }

  if (uri.startsWith("Qm") || uri.startsWith("ba")) {
    return `${PINATA_GATEWAY}/ipfs/${uri}`;
  }
  return uri;
};

export const uploadGallery = async (
  mediaFiles: MediaFile[],
  batchNumber: string,
): Promise<{ cid: string; description: string }[]> => {
  if (mediaFiles.length === 0) return [];

  const mediaGroupId = await getOrCreateGroup("CoffeeTracker-local-media");

  return Promise.all(
    mediaFiles.map(async ({ file, description }) => {
      const cid = await pinFile(file, `${batchNumber}-${file.name}`, mediaGroupId);
      return { cid, description };
    }),
  );
};

export const ensureQrCode = async (metadata: BatchMetadata, batchNumber: string): Promise<void> => {
  if (metadata.properties.images?.qrCode) return;

  const qrGroupId = await getOrCreateGroup("CoffeeTracker-local-qr");
  const qrCID = await pinQR(batchNumber, qrGroupId);

  metadata.properties.images = metadata.properties.images || {};

  metadata.properties.images.qrCode = { cid: qrCID, description: "Batch QR Code" };

  metadata.image = `ipfs://${qrCID}`;
};

export const mergeGallery = (metadata: BatchMetadata, newCIDs: { cid: string; description: string }[]): void => {
  if (newCIDs.length === 0) return;

  metadata.properties.images = metadata.properties.images || {};

  metadata.properties.images.gallery = [...(metadata.properties.images.gallery || []), ...newCIDs];
};
