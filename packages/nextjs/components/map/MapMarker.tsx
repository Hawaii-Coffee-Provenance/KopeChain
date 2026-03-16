"use client";

import { MapPin } from "./MapPin";
import { MapPopup } from "./MapPopup";
import { Marker as MarkerGL } from "react-map-gl/maplibre";
import { CoffeeBatch, Coordinates, Stage } from "~~/types/coffee";
import { STAGE_COLORS, getStage } from "~~/utils/coffee";

const Marker = MarkerGL as any;

type MapMarkerProps = {
  batch: CoffeeBatch;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onClick?: (batch: CoffeeBatch) => void;
  displayLocation?: Coordinates;
  displayStage?: Stage;
};

export const MapMarker = ({
  batch,
  isOpen,
  onOpen,
  onClose,
  onClick,
  displayLocation,
  displayStage,
}: MapMarkerProps) => {
  const stage = displayStage || getStage(batch);
  const color = STAGE_COLORS[stage];
  const location = displayLocation || batch.harvestLocation;
  const markerId = displayStage ? `${batch.batchId}:${displayStage}` : batch.batchId.toString();

  const handleMarkerClick = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen(markerId);
      onClick?.(batch);
    }
  };

  return (
    <>
      <Marker
        longitude={location.longitude}
        latitude={location.latitude}
        anchor="bottom"
        pitchAlignment="viewport"
        onClick={handleMarkerClick}
      >
        <div className="cursor-pointer" title={batch.batchNumber}>
          <MapPin color={color} />
        </div>
      </Marker>

      {isOpen && <MapPopup batch={batch} location={location} stage={stage} onClose={onClose} />}
    </>
  );
};
