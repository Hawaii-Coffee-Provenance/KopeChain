"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { BatchFilterBar } from "~~/components/explore/BatchFilterBar";
import { BatchLookup } from "~~/components/explore/BatchLookup";
import { BatchTable } from "~~/components/explore/BatchTable";
import { useBatchPagination } from "~~/hooks/useBatchPagination";
import { useCoffeeBatchTxHashes, useCoffeeTrackerBatches } from "~~/hooks/useCoffeeTracker";
import { BatchFilterState, CoffeeBatch, getStage } from "~~/types/coffee";

const DEFAULT_FILTERS: BatchFilterState = { stage: "All", region: "all", sort: "newest" };

const BlockExplorer: NextPage = () => {
  const searchParams = useSearchParams();
  const { allBatches, isLoading } = useCoffeeTrackerBatches();
  const { txHashMap } = useCoffeeBatchTxHashes();
  const [filters, setFilters] = useState<BatchFilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  const batches = useMemo(() => {
    let list = [...((allBatches as unknown as CoffeeBatch[]) ?? [])];

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
        const txHash = txHashMap[b.batchId.toString()]?.toLowerCase() ?? "";
        return (
          b.batchId.toString().includes(q) ||
          b.batchNumber.toLowerCase().includes(q) ||
          b.farmName.toLowerCase().includes(q) ||
          txHash.includes(q)
        );
      });
    }

    return filters.sort === "oldest" ? list : list.reverse();
  }, [allBatches, filters, searchQuery, txHashMap]);

  const { paginatedItems, currentPage, totalPages, pageSize, goToPage, setPageSize } = useBatchPagination(batches);

  return (
    <div className="container mx-auto my-10">
      <BatchLookup onSearch={setSearchQuery} />
      <BatchFilterBar
        {...filters}
        onChange={setFilters}
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
        txHashMap={txHashMap}
        pagination={
          !isLoading ? { currentPage, totalPages, totalItems: batches.length, pageSize, goToPage } : undefined
        }
      />
    </div>
  );
};

export default BlockExplorer;
