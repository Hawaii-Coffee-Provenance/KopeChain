"use client";

import { motion } from "framer-motion";
import Skeleton from "~~/components/Skeleton";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";
import { REGIONS } from "~~/utils/coffee";

const HomeLiveScroller = () => {
  const { stats, isLoading } = useCoffeeTracker();

  const verifiedBatches = stats?.recentBatches.filter(b => b.verified).slice(0, 10) ?? [];
  const tickerItems = [...verifiedBatches, ...verifiedBatches];

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-b border-base-300 py-4 overflow-hidden">
      <div className="flex items-center px-10 gap-4">
        {/* Live Verified Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-grid *:[grid-area:1/1]">
            <span className="status status-success animate-ping" />
            <span className="status status-success" />
          </span>

          <span className="text-label">Verified Batches</span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-base-300 shrink-0" aria-hidden="true" />

        {/* Ticker */}
        <div className="flex-1 overflow-hidden relative min-h-4 flex items-center" aria-busy={isLoading}>
          {isLoading || verifiedBatches.length === 0 ? (
            <div className="flex w-full text-sm leading-none items-center">
              <Skeleton className="h-3 w-full" />
            </div>
          ) : (
            <motion.div
              className="flex w-max text-sm leading-none items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 100, ease: "linear", repeat: Infinity }}
            >
              {tickerItems.map((batch, i) => (
                <span key={`${batch.batchName}-${i}`} className="flex items-center whitespace-nowrap">
                  <span className="text-muted text-xs font-mono mr-3">{batch.batchName}</span>
                  <span className="text-base-content font-medium">
                    {batch.farmName} · {REGIONS[batch.region] ?? "Unknown"}
                  </span>
                  <span className="text-base-content/50 mx-6">—</span>
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeLiveScroller;
