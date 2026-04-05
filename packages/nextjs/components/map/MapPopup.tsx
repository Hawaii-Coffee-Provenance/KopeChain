"use client";

import Link from "next/link";
import { Popup as PopupGL } from "react-map-gl/maplibre";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { CoffeeBatch } from "~~/types/batch";
import { Coordinates } from "~~/types/batch";
import { Stage } from "~~/types/coffee";
import { REGIONS, STAGE_STYLES, VARIETIES } from "~~/utils/coffee";

const Popup = PopupGL as any;

type MapPopupProps = {
  batch: CoffeeBatch;
  location: Coordinates;
  stage: Stage;
  onClose: () => void;
};

const MapPopup = ({ batch, location, stage, onClose }: MapPopupProps) => {
  const href = `/explore/batch/${batch.batchNumber}`;

  return (
    <Popup
      longitude={location.longitude}
      latitude={location.latitude}
      anchor="bottom"
      offset={30}
      closeButton={false}
      closeOnClick={false}
      onClose={onClose}
      className="bare-popup z-50"
    >
      <div className="modal-surface min-w-[200px]">
        <div className="px-3 py-2 flex flex-col">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <Link href={href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                <p className="font-serif text-xl font-semibold leading-none text-base-content hover:underline cursor-pointer">
                  {batch.batchNumber}
                </p>
              </Link>
              <button
                onClick={onClose}
                className="text-base-content/50 hover:text-base-content transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-hint leading-none mt-1">
              {batch.farmName} · {REGIONS[batch.region]}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-hint leading-none">Variety</span>
              <span className="text-xs font-medium text-base-content leading-none">{VARIETIES[batch.variety]}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-hint leading-none">Elevation</span>
              <span className="text-xs font-medium text-base-content leading-none">
                {batch.elevation > 0 ? `${batch.elevation} ft` : "—"}
              </span>
            </div>
            {batch.scaScore > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-hint leading-none">SCA Score</span>
                <span className="text-xs font-medium text-primary leading-none">{batch.scaScore}</span>
              </div>
            )}
          </div>

          <div className="border-t border-base-300 mt-2 mb-2" />

          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${batch.verified ? "text-primary" : "text-accent"}`}>
              {batch.verified ? "Verified" : "Pending"}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${STAGE_STYLES[stage]}`}
            >
              {stage}
            </span>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default MapPopup;
