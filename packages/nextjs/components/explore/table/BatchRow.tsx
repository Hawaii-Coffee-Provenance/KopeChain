"use client";

import { memo } from "react";
import BlockieAddressLink from "../BlockieAddressLink";
import TxHashLink from "../TxHashLink";
import { CoffeeBatch } from "~~/types/coffee";
import { REGIONS, STAGE_STYLES, formatTimestamp, getStage } from "~~/utils/coffee";

type BatchRowProps = {
  batch: CoffeeBatch;
  txHash: `0x${string}` | undefined;
};

const BatchRow = memo(({ batch, txHash }: BatchRowProps) => {
  const stage = getStage(batch);
  return (
    <tr>
      <td className="px-4 py-2">
        <TxHashLink txHash={txHash} href={`/explore/batch/${batch.batchNumber}`} />
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

      <td className="px-4 py-2">
        <BlockieAddressLink address={batch.farmer} />
      </td>

      <td className="px-4 py-2">
        <span className="text-muted">{formatTimestamp(batch.mintTimestamp)}</span>
      </td>
    </tr>
  );
});
BatchRow.displayName = "BatchRow";

export default BatchRow;
