"use client";

import { ipfsToHTTP } from "~~/utils/pinata";

type MediaItem = {
  url: string;
  label: string;
};

const TransactionAlbum = ({ batch }: { batch: any }) => {
  const items: MediaItem[] = [
    batch?.images?.nft && { url: ipfsToHTTP(batch.images.nft), label: "NFT Certificate" },
    batch?.images?.qrCode && { url: ipfsToHTTP(batch.images.qrCode), label: "Batch QR Code" },
  ].filter(Boolean) as MediaItem[];

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-base-content/30">
        <span className="text-sm">No media available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center gap-3">
      <span className="text-hint text-xs">Image Metadata Here</span>

      <div className="carousel w-full flex-1 rounded-2xl overflow-hidden bg-base-200">
        {items.map((item, i) => (
          <div key={i} id={`media-${i}`} className="carousel-item w-full justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 shrink-0">
        {items.map((_, i) => (
          <a key={i} className="btn btn-xs btn-ghost border border-base-300">
            {i + 1}
          </a>
        ))}
      </div>
    </div>
  );
};

export default TransactionAlbum;
