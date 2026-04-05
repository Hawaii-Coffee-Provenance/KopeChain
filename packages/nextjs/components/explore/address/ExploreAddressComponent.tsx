"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Address as AddressType } from "viem";
import { useBalance } from "wagmi";
import BlockieAddressLink from "~~/components/explore/BlockieAddressLink";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldEventHistory, useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useUserBatches } from "~~/hooks/useCoffeeTracker";
import { CoffeeBatch } from "~~/types/batch";
import { REGIONS, STAGE_STYLES, formatDate, getStage, truncateAddress } from "~~/utils/coffee";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

type ExploreAddressComponentProps = {
  address: AddressType;
  contractData: { bytecode: string; assembly: string } | null;
};

type ActivityItem = {
  txHash?: `0x${string}`;
  functionName: string;
  block: string;
  timeMined: string;
  from: string;
  to: string;
  value: string;
  batchNumber?: string;
};

type HistoryView = "activity" | "batches";

const FUNCTION_LABELS: Record<string, string> = {
  Harvested: "harvestBatch",
  Processed: "processBatch",
  Roasted: "roastBatch",
  Distributed: "distributeBatch",
  Verified: "verifyBatch",
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  Admin: "badge-primary",
  Farmer: "badge-success",
  Processor: "badge-info",
  Roaster: "badge-warning",
  Distributor: "badge-secondary",
  User: "badge-ghost",
};

const ROLE_COPY: Record<string, string> = {
  Admin: "Oversees roles, verification, and contract activity.",
  Farmer: "Creates new on-chain coffee batches at harvest.",
  Processor: "Adds processing data to harvested coffee batches.",
  Roaster: "Records roasting details and cupping information.",
  Distributor: "Finalizes shipment data and delivery history.",
  User: "Connected wallet with no supply-chain role assigned yet.",
};

const SummaryStat = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <div className="text-label">{label}</div>
    <div className="mt-2 break-words text-base font-medium text-base-content">{value}</div>
  </div>
);

const formatDateTime = (timestamp: bigint | number | undefined) => {
  if (!timestamp) return "-";
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString();
};

const getBatchAssociation = (batch: CoffeeBatch, address: string) => {
  const normalizedAddress = address.toLowerCase();

  if (batch.distributor?.toLowerCase() === normalizedAddress) return "Distributed by this wallet";
  if (batch.roaster?.toLowerCase() === normalizedAddress) return "Roasted by this wallet";
  if (batch.processor?.toLowerCase() === normalizedAddress) return "Processed by this wallet";
  if (batch.farmer?.toLowerCase() === normalizedAddress) return "Harvested by this wallet";

  return "Related to this wallet";
};

const BatchListItem = ({ batch, address }: { batch: CoffeeBatch; address: string }) => {
  const stage = getStage(batch);

  return (
    <Link
      href={`/explore/batch/${batch.batchNumber}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-200/40 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-base-200/70"
    >
      <div className="min-w-0">
        <div className="break-words text-sm font-semibold text-base-content">{batch.batchNumber}</div>
        <div className="mt-1 break-words text-xs text-muted">
          {batch.farmName || REGIONS[batch.region] || "Coffee batch"}
        </div>
        <div className="mt-1 text-xs text-primary">{getBatchAssociation(batch, address)}</div>
      </div>
      <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_STYLES[stage]}`}>
        {stage}
      </span>
    </Link>
  );
};

const ExploreAddressComponent = ({ address }: ExploreAddressComponentProps) => {
  const [historyView, setHistoryView] = useState<HistoryView>("activity");
  const targetNetwork = useSelectedNetwork();
  const { data: deployedContractInfo } = useDeployedContractInfo({ contractName: "CoffeeTracker" });
  const { data: balanceData } = useBalance({ address });
  const { userRole, userBatches, isLoading } = useUserBatches(address);

  const harvestedEvents = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Harvested",
    fromBlock: 0n,
    filters: { farmer: address },
    blockData: true,
    transactionData: true,
  });

  const processedEvents = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Processed",
    fromBlock: 0n,
    filters: { processor: address },
    blockData: true,
    transactionData: true,
  });

  const roastedEvents = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Roasted",
    fromBlock: 0n,
    filters: { roaster: address },
    blockData: true,
    transactionData: true,
  });

  const distributedEvents = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Distributed",
    fromBlock: 0n,
    filters: { distributor: address },
    blockData: true,
    transactionData: true,
  });

  const verifiedEvents = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Verified",
    fromBlock: 0n,
    filters: { verifier: address },
    blockData: true,
    transactionData: true,
  });

  const activity = useMemo(() => {
    const contractAddress = deployedContractInfo?.address ?? "Unknown";

    const mapEvents = (items: any[] | undefined, eventName: keyof typeof FUNCTION_LABELS): ActivityItem[] =>
      (items ?? [])
        .map(item => ({
          txHash: item.transactionHash,
          functionName: FUNCTION_LABELS[eventName],
          block: item.blockNumber?.toString?.() ?? "-",
          timeMined: item.blockData?.timestamp ? formatDateTime(item.blockData.timestamp) : "-",
          from: item.transactionData?.from ?? address,
          to: item.transactionData?.to ?? contractAddress,
          value: item.transactionData?.value ? Number(item.transactionData.value) / 1e18 : 0,
          batchNumber: item.args?.batchNumber,
        }))
        .map(item => ({
          ...item,
          value: typeof item.value === "number" ? item.value.toFixed(4) : "0.0000",
        }));

    const rows = [
      ...mapEvents(harvestedEvents.data as any[] | undefined, "Harvested"),
      ...mapEvents(processedEvents.data as any[] | undefined, "Processed"),
      ...mapEvents(roastedEvents.data as any[] | undefined, "Roasted"),
      ...mapEvents(distributedEvents.data as any[] | undefined, "Distributed"),
      ...mapEvents(verifiedEvents.data as any[] | undefined, "Verified"),
    ];

    return rows.sort((a, b) => Number(b.block) - Number(a.block));
  }, [
    address,
    deployedContractInfo?.address,
    distributedEvents.data,
    harvestedEvents.data,
    processedEvents.data,
    roastedEvents.data,
    verifiedEvents.data,
  ]);

  const firstSeen = useMemo(() => {
    if (!userBatches.length) return "-";
    const oldest = [...userBatches].sort((a, b) => Number(a.mintTimestamp) - Number(b.mintTimestamp))[0];
    return formatDate(oldest.mintTimestamp);
  }, [userBatches]);

  const displayedBatches = useMemo(
    () => [...userBatches].sort((a, b) => Number(b.mintTimestamp) - Number(a.mintTimestamp)).slice(0, 6),
    [userBatches],
  );

  const lastActive = useMemo(() => {
    if (activity[0]?.timeMined && activity[0].timeMined !== "-") return activity[0].timeMined;
    if (userBatches[0]) {
      const latest = [...userBatches].sort((a, b) => Number(b.mintTimestamp) - Number(a.mintTimestamp))[0];
      return formatDateTime(latest.mintTimestamp);
    }
    return "-";
  }, [activity, userBatches]);

  const balance = balanceData
    ? `${Number(balanceData.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${balanceData.symbol}`
    : "0 ETH";
  const role = userRole && userRole !== "None" ? userRole : "User";
  const isPending =
    isLoading ||
    harvestedEvents.isLoading ||
    processedEvents.isLoading ||
    roastedEvents.isLoading ||
    distributedEvents.isLoading ||
    verifiedEvents.isLoading;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-base-200/50">
      <div className="mx-auto max-w-7xl section-padding py-6 pb-20">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-base-200 p-1.5">
                <BlockieAvatar address={address} size={28} ensImage={null} />
              </div>
              <div className="min-w-0">
                <div className="break-words text-lg font-medium text-base-content">{truncateAddress(address)}</div>
                <div className="break-all text-sm text-muted">{address}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`badge ${ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.User}`}>{role}</span>
                  <span className="text-xs text-muted">{ROLE_COPY[role] ?? ROLE_COPY.User}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm">
              <div className="text-label">Last Active</div>
              <div className="mt-2 font-medium text-base-content">{lastActive}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 border-t border-base-300 pt-5 lg:grid-cols-5">
            <SummaryStat label="Role" value={role} />
            <SummaryStat label="Balance" value={balance} />
            <SummaryStat label="Transactions" value={activity.length.toString()} />
            <SummaryStat label="First Seen" value={firstSeen} />
            <SummaryStat label="Network" value={targetNetwork.name} />
          </div>
        </div>

        <div
          className={`mt-4 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm ${historyView === "activity" && (activity.length > 0 || isPending) ? "min-h-[500px]" : ""}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-label">History</div>
              <h2 className="mt-2 text-2xl font-medium">Wallet activity and batches</h2>
            </div>
            <div className="join">
              <button
                type="button"
                className={`join-item btn btn-sm ${historyView === "activity" ? "btn-primary" : "btn-ghost border"}`}
                onClick={() => setHistoryView("activity")}
              >
                Recent Activity
              </button>
              <button
                type="button"
                className={`join-item btn btn-sm ${historyView === "batches" ? "btn-primary" : "btn-ghost border"}`}
                onClick={() => setHistoryView("batches")}
              >
                User Batches
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted">
            {historyView === "activity"
              ? `${activity.length} recent contract event${activity.length === 1 ? "" : "s"}`
              : `${userBatches.length} batch${userBatches.length === 1 ? "" : "es"} tied to this wallet`}
          </div>

          {historyView === "activity" ? (
            isPending ? (
              <div className="flex items-center justify-center py-20">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : activity.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-6 text-sm text-muted">
                No recent contract activity was found for this address.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
                <div className="border-b border-base-300 bg-base-200/60 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted">
                  CoffeeTracker Activity Log
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-neutral text-neutral-content">
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">
                          Tx Hash
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">
                          Function
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">Batch</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">Block</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">
                          Time Mined
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">From</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]">To</th>
                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em]">
                          Value (ETH)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map(item => {
                        const txHref =
                          item.txHash && targetNetwork.id ? getBlockExplorerTxLink(targetNetwork.id, item.txHash) : "";
                        const batchHref = item.batchNumber
                          ? `/explore/batch/${item.batchNumber}`
                          : `/explore/address/${address}`;

                        return (
                          <tr
                            key={`${item.txHash}-${item.functionName}-${item.block}`}
                            className="bg-base-100 transition-colors hover:bg-base-200/40"
                          >
                            <td className="border-b border-base-300 px-4 py-4 align-top">
                              {txHref ? (
                                <a
                                  href={txHref}
                                  rel="noreferrer"
                                  target="_blank"
                                  className="border-b border-transparent pb-0.5 font-mono text-sm text-primary hover:border-primary"
                                >
                                  {item.txHash ? truncateAddress(item.txHash) : "-"}
                                </a>
                              ) : (
                                <span className="font-mono text-sm">
                                  {item.txHash ? truncateAddress(item.txHash) : "-"}
                                </span>
                              )}
                            </td>
                            <td className="border-b border-base-300 px-4 py-4 align-top">
                              <div className="font-medium">{item.functionName}</div>
                              <div className="badge badge-outline badge-sm mt-2 font-mono">CoffeeTracker</div>
                            </td>
                            <td className="border-b border-base-300 px-4 py-4 align-top">
                              <Link
                                href={batchHref}
                                className="border-b border-transparent text-sm text-primary hover:border-primary"
                              >
                                {item.batchNumber ?? "Open address"}
                              </Link>
                            </td>
                            <td className="border-b border-base-300 px-4 py-4 align-top font-mono text-sm">
                              {item.block}
                            </td>
                            <td className="border-b border-base-300 px-4 py-4 align-top whitespace-nowrap text-sm">
                              {item.timeMined}
                            </td>
                            <td className="min-w-[140px] border-b border-base-300 px-4 py-4 align-top">
                              <BlockieAddressLink address={item.from} />
                            </td>
                            <td className="min-w-[140px] border-b border-base-300 px-4 py-4 align-top">
                              <BlockieAddressLink address={item.to} />
                            </td>
                            <td className="border-b border-base-300 px-4 py-4 align-top text-right font-mono text-sm">
                              {item.value}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : isPending ? (
            <div className="flex items-center justify-center py-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : displayedBatches.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-5 text-sm text-muted">
              No batches are tied to this address yet.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {displayedBatches.map(batch => (
                <BatchListItem
                  key={`${batch.batchId.toString()}-${batch.batchNumber}`}
                  batch={batch}
                  address={address}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreAddressComponent;
