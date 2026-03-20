"use client";

import { useMemo } from "react";
import Map3D from "../map/Map3D";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";

const HomeMap = () => {
  const { stats } = useCoffeeTracker();

  const verifiedBatches = useMemo(() => stats?.allBatches.filter(b => b.verified) ?? [], [stats?.allBatches]);

  return (
    <>
      <div className="relative w-full rounded-xl overflow-hidden border border-base-300 shadow-sm">
        <Map3D className="w-full h-[500px] bg-base-100" batches={verifiedBatches} />
      </div>
    </>
  );
};

export default HomeMap;
