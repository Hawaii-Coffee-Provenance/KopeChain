"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { MediaPreviewProps } from "~~/types/forms";

const MediaPreview = ({ mediaFiles, onUpdateDescription, onRemoveFile, isDisabled = false }: MediaPreviewProps) => {
  if (mediaFiles.length === 0) return null;

  return (
    <div className="md:flex-1 md:min-h-0 overflow-x-auto">
      <div className="flex gap-3 h-32 md:h-full">
        {mediaFiles.map((item, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 h-full aspect-square rounded-xl border border-base-300 bg-base-200 overflow-hidden group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.mediapreview} alt={item.file.name} className="w-full h-full object-cover" />

            <div className="absolute bottom-0 left-0 right-0 px-2 pt-8 pb-2 bg-gradient-to-t from-black/75 via-black/25 to-transparent">
              <p className="text-base text-white font-medium truncate m-0" title={item.file.name}>
                {item.file.name}
              </p>

              <input
                type="text"
                className="w-full text-sm bg-transparent border-none outline-none text-white/80 placeholder:text-white/50 p-0 leading-tight"
                placeholder="Add caption…"
                value={item.description}
                onChange={e => onUpdateDescription(index, e.target.value)}
                disabled={isDisabled}
                onClick={e => e.stopPropagation()}
              />
            </div>

            <button
              type="button"
              className="btn btn-xs btn-square btn-ghost border border-base-300 absolute top-1.5 right-1.5 h-6 w-6 min-h-0 p-0 opacity-0 hover:bg-base-300 group-hover:opacity-100 cursor-pointer hover:scale-110"
              onClick={() => onRemoveFile(index)}
              disabled={isDisabled}
            >
              <XMarkIcon className="w-3 h-3 text-base-content" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;
