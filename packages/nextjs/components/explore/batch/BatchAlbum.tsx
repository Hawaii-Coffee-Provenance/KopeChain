"use client";

import { useState } from "react";
import { ipfsToHTTP } from "~~/utils/pinata";

type MediaItem = {
  url: string;
  label: string;
};

const BatchAlbum = ({ batch }: { batch: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items: MediaItem[] = [];

  if (batch?.images?.nft?.cid) {
    items.push({ url: ipfsToHTTP(batch.images.nft.cid), label: batch.images.nft.description || "NFT Certificate" });
  }

  if (batch?.images?.qrCode?.cid) {
    items.push({ url: ipfsToHTTP(batch.images.qrCode.cid), label: batch.images.qrCode.description || "Batch QR Code" });
  }

  if (Array.isArray(batch?.images?.gallery)) {
    batch.images.gallery.forEach((img: any, i: number) => {
      if (img?.cid) {
        items.push({ url: ipfsToHTTP(img.cid), label: img.description || `Gallery Image ${i + 1}` });
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-base-content/30">
        <span className="text-sm">No media available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center gap-3">
      <span className="text-hint text-xs text-center">{items[currentIndex]?.label || "Image Metadata"}</span>

      <div className="carousel w-full flex-1 rounded-2xl overflow-hidden bg-base-200">
        {items.map((item, i) => (
          <div key={i} id={`media-${i}`} className="carousel-item w-full justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 shrink-0 flex-wrap">
        {items.map((_, i) => (
          <a
            key={i}
            href={`#media-${i}`}
            onClick={() => setCurrentIndex(i)}
            className={`btn btn-xs ${currentIndex === i ? "btn-primary" : "btn-ghost border border-base-300"}`}
          >
            {i + 1}
          </a>
        ))}
      </div>
    </div>
  );
};

export default BatchAlbum;
