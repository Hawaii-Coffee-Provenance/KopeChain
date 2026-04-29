"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import { MediaFile } from "~~/types/forms";
import { notification } from "~~/utils/scaffold-eth";

const MAX_BYTES = 0.8 * 1024 * 1024;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  initialQuality: 0.8,
};

const isHeicFile = (file: File) => file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic");

const isImageFile = (file: File) => file.type.startsWith("image/") || isHeicFile(file);

const toJpegExtension = (name: string) => (name.includes(".") ? name.replace(/\.[^/.]+$/, ".jpg") : `${name}.jpg`);

const decodeHeicToJpeg = async (file: File): Promise<File> => {
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const single = Array.isArray(blob) ? blob[0] : blob;
  return new File([single], toJpegExtension(file.name), { type: "image/jpeg" });
};

const prepareImageForUpload = async (file: File): Promise<File> => {
  const readable = isHeicFile(file) ? await decodeHeicToJpeg(file) : file;

  if (readable.size <= MAX_BYTES) return readable;

  const compressed = await imageCompression(readable, {
    ...COMPRESSION_OPTIONS,
    fileType: "image/jpeg",
  });

  return new File([compressed], toJpegExtension(file.name), { type: "image/jpeg" });
};

export const useMediaFiles = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [compressing, setCompressing] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(isImageFile);

    if (imageFiles.length !== files.length) notification.error("Only image files are accepted.");

    setCompressing(true);
    try {
      const preparedFiles = await Promise.all(
        imageFiles.map(async file => {
          try {
            return await prepareImageForUpload(file);
          } catch (error) {
            console.error(`Failed to prepare ${file.name}:`, error);
            notification.error(`Failed to process ${file.name}`);
            return file;
          }
        }),
      );

      setMediaFiles(prev => [
        ...prev,
        ...preparedFiles.map(file => ({ file, description: "", mediapreview: URL.createObjectURL(file) })),
      ]);
    } finally {
      setCompressing(false);
    }
  };

  const updateDescription = (index: number, description: string) =>
    setMediaFiles(prev => prev.map((item, i) => (i === index ? { ...item, description } : item)));

  const removeFile = (index: number) =>
    setMediaFiles(prev => {
      if (index < 0 || index >= prev.length) return prev;
      URL.revokeObjectURL(prev[index].mediapreview);
      return prev.filter((_, i) => i !== index);
    });

  const resetFiles = () => {
    setMediaFiles(prev => {
      prev.forEach(f => URL.revokeObjectURL(f.mediapreview));
      return [];
    });
  };

  return { mediaFiles, addFiles, updateDescription, removeFile, resetFiles, compressing };
};
