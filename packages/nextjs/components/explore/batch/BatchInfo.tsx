"use client";

import { useEffect, useRef, useState } from "react";
import BatchData from "./BatchData";
import BatchJourney from "./BatchJourney";
import BatchOverview from "./BatchOverview";
import BatchTabs from "./BatchTabs";
import { BatchTxHashes } from "~~/types/batch";
import { REGION_TO_ISLAND, STAGE_STYLES, getStage } from "~~/utils/coffee";

const BatchInfo = ({ batch, txHashes }: { batch: any; txHashes: BatchTxHashes }) => {
  const stage = getStage(batch);
  const [activeTab, setActiveTab] = useState<"Overview" | "Journey" | "On Chain">("Overview");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hasOnChainData = Boolean(
    txHashes?.harvested || txHashes?.processed || txHashes?.roasted || txHashes?.distributed || txHashes?.verified,
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-8 pb-0 shrink-0">
        {/* Batch Name, Farm Name, Region + Status */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-hero text-base-content">{batch.batchName}</h1>
            <span className="text-base-content font-medium">
              {batch.farmName} · {REGION_TO_ISLAND[batch.region] ?? "Unknown"}
            </span>
          </div>

          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            <span className={`text-sm font-medium ${batch.verified ? "text-primary" : "text-accent"}`}>
              {batch.verified ? "Verified" : "Unverified"}
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${STAGE_STYLES[stage]}`}
            >
              {stage}
            </span>
          </div>
        </div>

        {/* Cupping Notes */}
        <div>
          <div className="text-label mb-2">Cupping Notes</div>
          <p className="font-serif text-2xl font-light italic text-base-content leading-snug">
            {batch.cuppingNotes && batch.cuppingNotes.length > 0
              ? `“${batch.cuppingNotes}”`
              : `"To Be Processed & Roasted..."`}
          </p>
        </div>

        <BatchTabs tabs={["Overview", "Journey", "On Chain"]} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Responsive Tabs */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full relative overflow-y-auto pt-0"
        style={{ scrollbarWidth: "none" }}
      >
        <div className={`flex flex-col gap-8 animate-fadeIn mt-4 ${activeTab === "Overview" ? "block" : "hidden"}`}>
          <BatchOverview batch={batch} />
        </div>

        <div className={`animate-fadeIn mt-4 ${activeTab === "Journey" ? "block" : "hidden"}`}>
          <BatchJourney batch={batch} />
        </div>

        <div className={`animate-fadeIn mt-4 ${activeTab === "On Chain" ? "block" : "hidden"}`}>
          {hasOnChainData ? (
            <>
              {txHashes?.harvested && (
                <BatchData txHash={txHashes.harvested} title="Harvested Transaction" batchName={batch.batchName} />
              )}
              {txHashes?.processed && (
                <BatchData txHash={txHashes.processed} title="Processed Transaction" batchName={batch.batchName} />
              )}
              {txHashes?.roasted && (
                <BatchData txHash={txHashes.roasted} title="Roasted Transaction" batchName={batch.batchName} />
              )}
              {txHashes?.distributed && (
                <BatchData txHash={txHashes.distributed} title="Distributed Transaction" batchName={batch.batchName} />
              )}
              {txHashes?.verified && (
                <BatchData txHash={txHashes.verified} title="Verified Transaction" batchName={batch.batchName} />
              )}
            </>
          ) : (
            <div className="min-h-[50vh] w-full flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchInfo;
