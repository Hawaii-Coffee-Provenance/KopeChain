import { generateQRBlob } from "./qrcode";
import { HARDHAT_NETWORK_NAMES } from "./scaffold-eth";
import { BatchMetadata } from "~~/types/batch";
import { MediaFile } from "~~/types/forms";

export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud";

export const getCoffeeTrackerGroupName = (
  network: { id: number; name: string } | undefined,
  scope: "batch" | "qr" | "media" | "nft",
): string => {
  const networkName = network ? HARDHAT_NETWORK_NAMES[network.id] || network.name : "localhost";
  return `CoffeeTracker-${networkName}-${scope}`;
};

export async function fetchMetadata(cid: string): Promise<BatchMetadata> {
  const url = `${PINATA_GATEWAY}/ipfs/${cid}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error(`IPFS fetch failed for CID ${cid}`);

  return res.json();
}

export async function pinJSON(
  content: BatchMetadata,
  name: string,
  batchName: string,
  groupId?: string,
): Promise<string> {
  const res = await fetch("/api/pin/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, name, batchName, groupId }),
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
  batchName: string;
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
  const file = new File([blob], `nft-${params.batchName}-${params.stage}.png`, { type: "image/png" });

  const cid = await pinFile(file, file.name, params.groupId);
  return { IpfsHash: cid, traits };
}

export async function pinQR(batchName: string, groupId: string): Promise<string> {
  const blob = await generateQRBlob(batchName, process.env.NEXT_PUBLIC_APP_URL);

  const formData = new FormData();

  formData.append("file", blob, `qr-${batchName}.png`);
  formData.append("pinataMetadata", JSON.stringify({ name: `qr-${batchName}.png` }));
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
  batchName: string,
  network?: { id: number; name: string } | undefined,
): Promise<{ cid: string; description: string }[]> => {
  if (mediaFiles.length === 0) return [];

  const mediaGroupId = await getOrCreateGroup(getCoffeeTrackerGroupName(network, "media"));

  return Promise.all(
    mediaFiles.map(async ({ file, description }) => {
      const cid = await pinFile(file, `${batchName}-${file.name}`, mediaGroupId);
      return { cid, description };
    }),
  );
};

export const ensureQrCode = async (
  metadata: BatchMetadata,
  batchName: string,
  network?: { id: number; name: string } | undefined,
): Promise<void> => {
  if (metadata.properties.images?.qrCode) return;

  const qrGroupId = await getOrCreateGroup(getCoffeeTrackerGroupName(network, "qr"));
  const qrCID = await pinQR(batchName, qrGroupId);

  metadata.properties.images = metadata.properties.images || {};

  metadata.properties.images.qrCode = { cid: qrCID, description: "Batch QR Code" };

  metadata.image = `ipfs://${qrCID}`;
};

export const mergeGallery = (metadata: BatchMetadata, newCIDs: { cid: string; description: string }[]): void => {
  if (newCIDs.length === 0) return;

  metadata.properties.images = metadata.properties.images || {};

  metadata.properties.images.gallery = [...(metadata.properties.images.gallery || []), ...newCIDs];
};
