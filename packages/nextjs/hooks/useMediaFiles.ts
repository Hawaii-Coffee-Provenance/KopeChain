"use client";

import { useState } from "react";
import { MediaFile } from "~~/types/forms";
import { notification } from "~~/utils/scaffold-eth";

export const useMediaFiles = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    const accepted = Array.from(files).filter(f => f.type.startsWith("image/"));

    if (accepted.length !== files.length) notification.error("Only image files are accepted.");

    setMediaFiles(prev => [
      ...prev,
      ...accepted.map(file => ({ file, description: "", mediapreview: URL.createObjectURL(file) })),
    ]);
  };

  const updateDescription = (index: number, description: string) =>
    setMediaFiles(prev => prev.map((item, i) => (i === index ? { ...item, description } : item)));

  const removeFile = (index: number) =>
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].mediapreview);
      return prev.filter((_, i) => i !== index);
    });

  const resetFiles = () => setMediaFiles([]);

  return { mediaFiles, addFiles, updateDescription, removeFile, resetFiles };
};
