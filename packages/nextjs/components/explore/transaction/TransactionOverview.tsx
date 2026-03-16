"use client";

import { DataRow } from "./DataRow";
import { zeroAddress } from "viem";
import { BlockieAddressLink } from "~~/components/explore/BlockieAddressLink";

const TransactionOverview = ({ batch }: { batch: any }) => {
  return (
    <>
      <div>
        <div className="text-label text-base! mb-2 mt-2">Chain Participants</div>
        <div className="flex flex-col">
          {[
            { role: "Farmer", address: batch.farmer && batch.farmer !== zeroAddress ? batch.farmer : "Pending" },
            {
              role: "Processor",
              address: batch.processor && batch.processor !== zeroAddress ? batch.processor : "Pending",
            },
            {
              role: "Roaster",
              address: batch.roaster && batch.roaster !== zeroAddress ? batch.roaster : "Pending",
            },
            {
              role: "Distributor",
              address: batch.distributor && batch.distributor !== zeroAddress ? batch.distributor : "Pending",
            },
          ].map((p: any) => (
            <DataRow key={p.role} title={p.role}>
              {p.address === "Pending" ? (
                <span className="font-mono text-xs md:text-sm text-base-content/50">Pending</span>
              ) : (
                <BlockieAddressLink address={p.address} disableTruncation={true} />
              )}
            </DataRow>
          ))}
        </div>
      </div>

      <div>
        <div className="flex gap-8">
          {[
            {
              label: "Harvested",
              value: batch.harvestDate ? new Date(Number(batch.harvestDate) * 1000).toLocaleDateString() : "—",
            },
            {
              label: "Minted",
              value: batch.mintTimestamp ? new Date(Number(batch.mintTimestamp) * 1000).toLocaleDateString() : "—",
            },
            { label: "Batch ID", value: `#${batch.batchId?.toString?.() ?? "?"}` },
          ].map((item: any) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-xs font-bold tracking-wide uppercase text-base-content">{item.label}</span>
              <span className="text-sm font-medium text-base-content/60">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TransactionOverview;
