"use client";

import { memo } from "react";
import { BlockieAddressLink } from "../BlockieAddressLink";
import { TxHashLink } from "../TxHashLink";
import { CoffeeBatch } from "~~/types/coffee";
import { REGIONS, STAGE_STYLES, getStage } from "~~/utils/coffee";

type BatchRowProps = {
  batch: CoffeeBatch;
  txHash: `0x${string}` | undefined;
  onRowClick?: (batch: CoffeeBatch) => void;
};

const formatTimestamp = (timestamp: bigint): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(timestamp);

  if (diff <= 0) return "0s ago";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

export const BatchRow = memo(({ batch, txHash, onRowClick }: BatchRowProps) => {
  const stage = getStage(batch);
  return (
    <tr onClick={() => onRowClick?.(batch)} className={onRowClick ? "cursor-pointer hover:bg-base-200" : ""}>
      <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
        <TxHashLink txHash={txHash} />
      </td>

      <td className="px-4 py-2">
        <span className="text-sm font-mono text-base-content">{batch.batchId?.toString()}</span>
      </td>

      <td className="px-4 py-2">
        <p className="font-semibold text-sm text-base-content leading-none mb-1">{batch.batchNumber}</p>
        <p className="text-xs text-muted">{batch.farmName}</p>
      </td>

      <td className="px-4 py-2">
        <span className="text-sm text-muted">{REGIONS[batch.region] ?? "Unknown"}</span>
      </td>

      <td className="px-4 py-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${STAGE_STYLES[stage]}`}
        >
          {stage}
        </span>
      </td>

      <td className="px-4 py-2">
        <span className={`text-sm font-medium ${batch.verified ? "text-primary" : "text-accent"}`}>
          {batch.verified ? "Verified" : "Pending"}
        </span>
      </td>

      <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
        <BlockieAddressLink address={batch.farmer} />
      </td>

      <td className="px-4 py-2">
        <span className="text-muted">{formatTimestamp(batch.mintTimestamp)}</span>
      </td>
    </tr>
  );
});
BatchRow.displayName = "BatchRow";
