"use client";

import React, { useEffect, useMemo, useState } from "react";
import ChartDashboard from "~~/components/explore/dashboard/ChartDashboard";
import DataDashboard from "~~/components/explore/dashboard/DataDashboard";
import BatchFilterBar from "~~/components/explore/table/BatchFilterBar";
import BatchTable from "~~/components/explore/table/BatchTable";
import { useBatchPagination } from "~~/hooks/useBatchPagination";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";
import { BatchTxHashes } from "~~/types/batch";
import { BatchFilterState, CoffeeBatch } from "~~/types/coffee";
import { getStage } from "~~/utils/coffee";

const DEFAULT_FILTERS: BatchFilterState = { stage: "All", region: "all", sort: "newest" };

type ExploreClientProps = {
  initialSearchQuery?: string;
};

const ExploreClient: React.FC<ExploreClientProps> = ({ initialSearchQuery = "" }) => {
  const { stats, txHashMap, isLoading } = useCoffeeTracker({ includeTxHashes: true });
  const allBatches = useMemo(() => (stats?.allBatches ?? []) as CoffeeBatch[], [stats?.allBatches]);
  const [filters, setFilters] = useState<BatchFilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const batches = useMemo(() => {
    let list = [...allBatches];

    if (filters.stage === "Verified") {
      list = list.filter(b => b.verified);
    } else if (filters.stage !== "All") {
      list = list.filter(b => getStage(b) === filters.stage);
    }

    if (filters.region !== "all") {
      list = list.filter(b => b.region === Number(filters.region));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      list = list.filter(b => {
        const hashes = txHashMap[b.batchId.toString()];

        const isInHashes = hashes
          ? Object.values(hashes).some(h => typeof h === "string" && h.toLowerCase().includes(q))
          : false;

        return (
          b.batchId.toString().includes(q) ||
          b.batchNumber.toLowerCase().includes(q) ||
          b.farmName.toLowerCase().includes(q) ||
          isInHashes
        );
      });
    }

    return filters.sort === "oldest" ? list : list.reverse();
  }, [allBatches, filters, searchQuery, txHashMap]);

  const tableTxHashMap = useMemo<Record<string, `0x${string}` | undefined>>(() => {
    return Object.fromEntries(
      Object.entries(txHashMap).map(([batchId, hashes]) => {
        const typedHashes = hashes as BatchTxHashes | undefined;
        return [
          batchId,
          typedHashes?.verified ??
            typedHashes?.distributed ??
            typedHashes?.roasted ??
            typedHashes?.processed ??
            typedHashes?.harvested,
        ];
      }),
    );
  }, [txHashMap]);

  const { paginatedItems, currentPage, totalPages, pageSize, goToPage, setPageSize } = useBatchPagination(batches);

  return (
    <div className="w-full flex flex-col section-padding">
      <DataDashboard />
      <ChartDashboard />
      <BatchFilterBar
        {...filters}
        onChange={setFilters}
        onSearch={setSearchQuery}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onClear={() => {
          setFilters(DEFAULT_FILTERS);
          setSearchQuery("");
        }}
      />

      <BatchTable
        batches={isLoading ? undefined : paginatedItems}
        isLoading={isLoading}
        txHashMap={tableTxHashMap}
        pagination={
          !isLoading ? { currentPage, totalPages, totalItems: batches.length, pageSize, goToPage } : undefined
        }
      />
    </div>
  );
};

export default ExploreClient;
