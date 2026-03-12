"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Map, { MapRef, NavigationControl } from "react-map-gl/maplibre";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

const HAWAII_BOUNDS: [[number, number], [number, number]] = [
  [-162.0, 17.5], // - SW
  [-153.0, 23.7], // + NE
];

type Map3DProps = {
  className?: string;
};

export const Map3D = ({ className }: Map3DProps) => {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

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

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.addSource("terrain", {
      type: "raster-dem",
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
      tileSize: 256,
    });

    map.setTerrain({ source: "terrain", exaggeration: 1.8 });
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <Map
          ref={mapRef}
          mapStyle={`https://api.maptiler.com/maps/topo-v4/style.json?key=${MAPTILER_KEY}`}
          initialViewState={{
            longitude: -157.5,
            latitude: 20.5,
            zoom: 5.0,
            pitch: 0,
            bearing: 0,
          }}
          maxBounds={HAWAII_BOUNDS}
          minZoom={5.0}
          maxZoom={20.0}
          maxPitch={85}
          onLoad={onLoad}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />
        </Map>
      ) : (
        <div className="w-full h-full bg-base-200 animate-pulse rounded-xl" />
      )}
    </div>
  );
};
