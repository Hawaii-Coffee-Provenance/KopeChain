"use client";

import { memo } from "react";
import Link from "next/link";
import BlockieAddressLink from "../BlockieAddressLink";
import { useAccount } from "wagmi";
import CustomTooltip from "~~/components/CustomTooltip";
import { useContractFunctions } from "~~/hooks/useAdminPanel";
import { useUserRole } from "~~/hooks/useCoffeeTracker";
import { CoffeeBatch } from "~~/types/coffee";
import { REGIONS, STAGE_STYLES, formatTimestamp, getStage } from "~~/utils/coffee";

type BatchRowProps = {
  batch: CoffeeBatch;
};

const BatchRow = memo(({ batch }: BatchRowProps) => {
  const { address } = useAccount();
  const { userRole } = useUserRole(address);
  const isAdmin = userRole === "Admin";

  const { handleWrite, isMining } = useContractFunctions("CoffeeTracker");

  const handleVerify = async () => {
    await handleWrite("verifyBatch", "verifyBatch", [batch.batchId], `Batch "${batch.batchName}" verified!`, () =>
      window.location.reload(),
    );
  };

  const stage = getStage(batch);
  return (
    <tr>
      <td className="px-4 py-8">
        <Link
          href={`/explore/batch/${batch.batchName}`}
          className="font-semibold text-sm text-base-content border-b border-transparent hover:text-primary hover:border-primary pb-0.5 transition-colors inline-block"
        >
          {batch.batchName}
        </Link>
      </td>

      <td className="px-4 py-8">
        <span className="text-sm font-mono text-base-content">{batch.batchId?.toString()}</span>
      </td>

      <td className="px-4 py-8">
        <span className="text-sm text-base-content">{batch.farmName}</span>
      </td>

      <td className="px-4 py-8">
        <span className="text-sm text-muted">{REGIONS[batch.region] ?? "Unknown"}</span>
      </td>

      <td className="px-4 py-8">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${STAGE_STYLES[stage]}`}
        >
          {stage}
        </span>
      </td>

      <td className="px-4 py-8">
        <BlockieAddressLink address={batch.farmer} />
      </td>

      <td className="px-4 py-8">
        {!batch.verified && isAdmin ? (
          <CustomTooltip
            message={isMining ? "Verifying..." : "Click To Verify Batch"}
            open={isMining}
            onClick={handleVerify}
          >
            <span className="text-sm font-medium text-accent">Unverified</span>
          </CustomTooltip>
        ) : (
          <span className={`text-sm font-medium ${batch.verified ? "text-primary" : "text-accent"}`}>
            {batch.verified ? "Verified" : "Unverified"}
          </span>
        )}
      </td>

      <td className="px-4 py-8">
        <span className="text-muted">{formatTimestamp(batch.mintTimestamp)}</span>
      </td>
    </tr>
  );
});
BatchRow.displayName = "BatchRow";

export default BatchRow;
