"use client";

import { useEffect, useMemo, useState } from "react";
import Map3D from "../map/Map3D";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";

const HomeMap = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    setIsTouchDevice(mediaQuery.matches || navigator.maxTouchPoints > 0);

    const handlePointerChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches || navigator.maxTouchPoints > 0);
    };

    mediaQuery.addEventListener("change", handlePointerChange);

    return () => mediaQuery.removeEventListener("change", handlePointerChange);
  }, []);

  const { stats } = useCoffeeTracker();

  const verifiedBatches = useMemo(() => stats?.allBatches.filter(b => b.verified) ?? [], [stats?.allBatches]);

  return (
    <>
      <div className="relative w-full rounded-xl overflow-hidden border border-base-300 shadow-sm">
        <Map3D className="w-full h-[500px] bg-base-100" batches={verifiedBatches} />
      </div>

      <p className="text-center text-hint mt-2">
        {isTouchDevice
          ? "Tap markers to explore · Pinch to zoom · Drag to zoom · Two-finger drag to tilt"
          : "Click markers to explore · Scroll to zoom · Left-click drag to pan · Right-click drag to tilt"}
      </p>
    </>
  );
};

export default HomeMap;
