"use client";

import { useMemo } from "react";
import { BatchPagination, PaginationConfig } from "./BatchPagination";
import { BatchRow } from "./BatchRow";
import { BatchSkeletonRows } from "./BatchSkeletonRows";
import { CoffeeBatch } from "~~/types/coffee";

type BatchTableProps = {
  batches: CoffeeBatch[] | undefined;
  isLoading?: boolean;
  onRowClick?: (batch: CoffeeBatch) => void;
  txHashMap: Record<string, `0x${string}`>;
  pagination?: PaginationConfig;
};

export const BatchTable = ({ batches, isLoading = false, onRowClick, txHashMap, pagination }: BatchTableProps) => {
  const rows = useMemo(() => batches ?? [], [batches]);

  return (
    <div className="w-full">
      <div className="bg-base-100 border border-base-300 rounded-xl overflow-x-auto">
        <table className="table text-left">
          <thead>
            <tr>
              {["TX", "ID", "Batch", "Region", "Stage", "Verified", "From", "Minted"].map(col => (
                <th key={col} className="px-5 py-3 text-left text-col-header text-sm whitespace-nowrap bg-primary">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <BatchSkeletonRows />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-muted">
                  No batches found
                </td>
              </tr>
            ) : (
              rows.map(batch => (
                <BatchRow
                  key={batch.batchId.toString()}
                  batch={batch}
                  txHash={txHashMap[batch.batchId.toString()]}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </tbody>

          {pagination && <BatchPagination {...pagination} />}
        </table>
      </div>
    </div>
  );
};
