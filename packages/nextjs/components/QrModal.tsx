"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const QrModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    setScanning(true);
    setError(null);
    setResult(null);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        decodedText => {
          setResult(decodedText);
          scanner.stop();
          setScanning(false);

          if (decodedText.includes("/explore/batch/")) {
            setTimeout(() => {
              onClose();
              router.push(new URL(decodedText).pathname);
            }, 1000);
          }
        },
        undefined,
      )
      .catch(() => {
        setError("Camera Access Denied. Please Allow Camera Permissions.");
        setScanning(false);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box flex flex-col items-center gap-6 py-10" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-label">Batch Scanner</h3>
          <p className="text-hint">Point your camera at a KopeChain QR Code</p>
        </div>

        <div className="w-full rounded-2xl overflow-hidden bg-base-200">
          <div id="qr-reader" className="w-full" />
        </div>

        {scanning && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-xs" />
          </div>
        )}

        {error && (
          <div className="alert alert-error py-2">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="alert alert-success text-sm py-2 flex flex-col items-start gap-1">
            <span className="font-semibold">Batch found!</span>
            <span className="text-xs break-all opacity-70">{result}</span>
          </div>
        )}

        <div className="modal-action mt-0">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default QrModal;
