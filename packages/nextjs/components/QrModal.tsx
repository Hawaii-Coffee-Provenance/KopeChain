"use client";

import { QrCodeIcon } from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const QrModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box flex flex-col items-center gap-6 py-10" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-2">
          <QrCodeIcon className="w-8 h-8 text-primary" />
        </div>

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
