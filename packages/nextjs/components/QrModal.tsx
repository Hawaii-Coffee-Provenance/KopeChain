"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { XMarkIcon } from "@heroicons/react/24/solid";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const QrModal = ({ isOpen, onClose }: Props) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    setError(null);
    setResult(null);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        decodedText => {
          const isValid = decodedText.includes("/explore/batch/");

          if (!isValid) {
            setError("Unable to parse QR code! Please scan a valid KopeChain batch.");
            scanner.stop().catch(() => {});
            return;
          }

          setResult(decodedText);
          scanner.stop().catch(() => {});

          setTimeout(() => {
            onClose();
            window.location.href = new URL(decodedText).pathname;
          }, 1000);
        },
        undefined,
      )
      .catch(() => {
        setError("Unable to access camera! Please allow camera permissions.");
      });

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box flex flex-col items-center py-10" onClick={e => e.stopPropagation()}>
        <div className="relative flex flex-col items-center text-center w-full mb-6">
          <span className="font-label font-semibold !text-lg mb-1">Batch Scanner</span>
          <span className="text-hint !text-base">Point your camera at a KopeChain QR Code</span>

          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-base-content/50 hover:text-base-content transition-colors cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="w-full rounded-2xl overflow-hidden bg-base-200">
          <div id="qr-reader" className="w-full" />
        </div>

        {error && (
          <div className="text-error text-base text-center">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="text-primary text-base text-center">
            <span className="font-semibold">Batch found! Redirecting...</span>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default QrModal;
