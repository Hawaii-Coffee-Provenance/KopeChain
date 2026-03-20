import { Buffer } from "buffer";

const PINATA_JWT = process.env.PINATA_JWT;

export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";

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

export async function pinJSON(
  content: BatchMetadata,
  name: string,
  batchNumber: string,
  groupId?: string,
): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: content,
      pinataMetadata: {
        name,
        keyvalues: { batchNumber },
      },
      pinataOptions: {
        groupId: groupId ?? undefined,
      },
    }),
  });

  if (!res.ok) throw new Error(`Pinata pinJSON failed: ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

export async function pinFile(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const formData = new FormData();

  formData.append("file", new Blob([new Uint8Array(buffer)], { type: contentType }), filename);
  formData.append("pinataMetadata", JSON.stringify({ name: filename }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error(`Pinata pinFile failed: ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

export async function findExistingPin(batchNumber: string): Promise<string | null> {
  const res = await fetch(
    `https://api.pinata.cloud/data/pinList?metadata[keyvalues][batchNumber]=${encodeURIComponent(batchNumber)}&status=pinned`,
    { headers: { Authorization: `Bearer ${PINATA_JWT}` } },
  );

  if (!res.ok) return null;

  const data = await res.json();

  return data.rows?.length > 0 ? (data.rows[0].ipfs_pin_hash as string) : null;
}

export async function fetchByCID(cid: string): Promise<BatchMetadata> {
  const url = `${PINATA_GATEWAY}/ipfs/${cid}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error(`IPFS fetch failed for CID ${cid}: ${res.status} — URL: ${url}`);

  return res.json();
}

export async function appendAndRepin(
  currentCID: string,
  newFields: Partial<BatchMetadata["properties"]>,
  batchNumber: string,
  groupId?: string,
): Promise<string> {
  const current = await fetchByCID(currentCID);

  const merged: BatchMetadata = {
    ...current,
    properties: {
      ...current.properties,
      ...newFields,
      images: {
        ...current.properties.images,
        ...newFields.images,
      },
    },
  };

  const newCID = await pinJSON(merged, `batch-${batchNumber}-${Date.now()}`, batchNumber, groupId);

  await fetch(`https://api.pinata.cloud/pinning/unpin/${currentCID}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  });

  return newCID;
}

export const ipfsToHTTP = (uri: string) =>
  uri.startsWith("ipfs://") ? `${PINATA_GATEWAY}/ipfs/${uri.replace("ipfs://", "")}` : uri;

export async function getOrCreateGroup(name: string): Promise<string> {
  const listRes = await fetch("https://api.pinata.cloud/groups?name=" + encodeURIComponent(name), {
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  });

  const listData = await listRes.json();

  if (listData.groups?.length > 0) {
    console.log(`Reusing group ${listData.groups[0].id}`);
    return listData.groups[0].id;
  }

  const createRes = await fetch("https://api.pinata.cloud/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({ name }),
  });

  const group = await createRes.json();
  return group.id;
}

export async function addToGroup(groupId: string, cid: string): Promise<void> {
  await fetch(`https://api.pinata.cloud/groups/${groupId}/cids`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({ cids: [cid] }),
  });
}
