"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import MapMarker from "./MapMarker";
import { LngLatBounds } from "maplibre-gl";
import MapGL, { MapRef, NavigationControl as NavControl } from "react-map-gl/maplibre";
import Skeleton from "~~/components/Skeleton";
import { CoffeeBatch, Coordinates } from "~~/types/batch";
import { STAGES, STAGE_COLORS } from "~~/utils/coffee";

const Map = MapGL as any;
const NavigationControl = NavControl as any;

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

const HAWAII_BOUNDS: [[number, number], [number, number]] = [
  [-162.0, 17.5], // - SW
  [-153.0, 23.7], // + NE
];

const INITIAL_VIEW_STATE = {
  longitude: -157.5,
  latitude: 20.5,
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
};

type Map3DProps = {
  className?: string;
  batches?: CoffeeBatch[];
  onBatchClick?: (batch: CoffeeBatch) => void;
  showJourney?: boolean;
  showLegend?: boolean;
  autoFitMarkers?: boolean;
};

const isWithinBounds = (loc: Coordinates): boolean =>
  loc.longitude >= HAWAII_BOUNDS[0][0] &&
  loc.longitude <= HAWAII_BOUNDS[1][0] &&
  loc.latitude >= HAWAII_BOUNDS[0][1] &&
  loc.latitude <= HAWAII_BOUNDS[1][1];

const getMarkerCoordinates = (batch: CoffeeBatch, showJourney: boolean): Coordinates[] => {
  const isValid = (loc: Coordinates) => loc.latitude !== 0 && loc.longitude !== 0 && isWithinBounds(loc);

  if (showJourney) {
    return [batch.harvestLocation, batch.processingLocation, batch.roastingLocation, batch.distributionLocation].filter(
      isValid,
    );
  }

  if (isValid(batch.harvestLocation)) {
    return [batch.harvestLocation];
  }
  return [];
};

const MapLegend = () => {
  const labels: Record<string, string> = {
    Harvested: "Coffee Farm",
    Processed: "Processing Station",
    Roasted: "Roasting Facility",
    Distributed: "Distribution Hub",
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-base-100 border border-base-300 rounded-lg px-4 py-2 flex flex-col gap-2 shadow-sm pointer-events-none">
      {STAGES.map(stage => (
        <div key={stage} className="flex items-center gap-2 text-xs text-muted">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[stage] }} />
          {labels[stage]}
        </div>
      ))}
    </div>
  );
};

const Map3D = ({
  className,
  batches,
  onBatchClick,
  showJourney,
  showLegend = true,
  autoFitMarkers = false,
}: Map3DProps) => {
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const hasFittedMap = useRef(false);

  // Lazy load
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto Fit Markers Logic
  const fitMapToMarkers = useCallback(() => {
    const map = mapRef.current?.getMap();

    if (!map || !batches?.length || hasFittedMap.current) return;

    const allCoords = batches.flatMap(b => getMarkerCoordinates(b, !!showJourney));

    if (allCoords.length === 0) return;

    const bounds = new LngLatBounds();

    allCoords.forEach(c => bounds.extend([c.longitude, c.latitude]));

    setTimeout(() => {
      map.fitBounds(bounds.toArray() as [[number, number], [number, number]], {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 15,
        duration: 1000,
      });
      hasFittedMap.current = true;
    }, 300);
  }, [batches, showJourney]);

  // Load Map Tiles
  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.addSource("terrain", {
      type: "raster-dem",
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
      tileSize: 256,
    });

    map.setTerrain({ source: "terrain", exaggeration: 1.8 });

    if (autoFitMarkers) {
      fitMapToMarkers();
    }
  }, [autoFitMarkers, fitMapToMarkers]);

  // Check To Auto Fit Markers
  useEffect(() => {
    if (autoFitMarkers && batches?.length && mapRef.current?.getMap()) {
      fitMapToMarkers();
    }
  }, [autoFitMarkers, batches, fitMapToMarkers]);

  const validBatches =
    batches?.filter(b => b.harvestLocation.latitude !== 0 && b.harvestLocation.longitude !== 0) ?? [];

  return (
    <div ref={containerRef} className={`${className} relative`}>
      {isVisible ? (
        <>
          {showLegend && <MapLegend />}
          <Map
            ref={mapRef}
            mapStyle={`https://api.maptiler.com/maps/topo-v4/style.json?key=${MAPTILER_KEY}`}
            initialViewState={INITIAL_VIEW_STATE}
            maxBounds={HAWAII_BOUNDS}
            minZoom={5.0}
            maxZoom={20.0}
            maxPitch={85}
            onLoad={onLoad}
            style={{ width: "100%", height: "100%" }}
            attributionControl={false}
          >
            <NavigationControl position="bottom-right" />

            {validBatches.flatMap(batch => {
              if (showJourney) {
                return [
                  { loc: batch.harvestLocation, stage: "Harvested" as const },
                  { loc: batch.processingLocation, stage: "Processed" as const },
                  { loc: batch.roastingLocation, stage: "Roasted" as const },
                  { loc: batch.distributionLocation, stage: "Distributed" as const },
                ]
                  .filter(s => s.loc.latitude !== 0)
                  .map(s => (
                    <MapMarker
                      key={`${batch.batchId}:${s.stage}`}
                      batch={batch}
                      displayLocation={s.loc}
                      displayStage={s.stage}
                      isOpen={activeBatchId === `${batch.batchId}:${s.stage}`}
                      onOpen={id => setActiveBatchId(id)}
                      onClose={() => setActiveBatchId(null)}
                      onClick={onBatchClick}
                    />
                  ));
              }

              const batchId = batch.batchId.toString();
              return (
                <MapMarker
                  key={batchId}
                  batch={batch}
                  isOpen={activeBatchId === batchId}
                  onOpen={id => setActiveBatchId(id)}
                  onClose={() => setActiveBatchId(null)}
                  onClick={onBatchClick}
                />
              );
            })}
          </Map>
        </>
      ) : (
        <Skeleton className="w-full h-full rounded-xl" />
      )}
    </div>
  );
};

export default Map3D;
