"use client";

import { useRef, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { MediaUploaderProps } from "~~/types/forms";

const MediaUploader = ({ onAddFiles, isDisabled = false }: MediaUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isDisabled) onAddFiles(e.dataTransfer.files);
  };

  return (
    <div className="md:flex-1 md:min-h-0 flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={e => onAddFiles(e.target.files)}
      />
      <div
        className={`
        h-full flex flex-col items-center justify-center rounded-xl border border-base-300 py-7 md:py-0 gap-1 cursor-pointer
        ${isDragging ? "bg-base-200" : "bg-base-100 hover:bg-base-200/50"}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        onDragOver={e => {
          if (isDisabled) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <ArrowUpTrayIcon className="w-7 h-7 text-base-content" />
        <div className="text-center">
          <p className="text-sm font-semibold text-base-content m-0">Drop images here</p>
          <p className="text-xs text-base-content/80 m-0 mt-0.5">or click to browse · PNG, JPG</p>
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;
