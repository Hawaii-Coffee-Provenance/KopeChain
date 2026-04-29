"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { Address as AddressType, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useUserBatches } from "~~/hooks/useCoffeeTracker";
import { CoffeeBatch } from "~~/types/batch";
import { REGIONS, STAGE_STYLES, formatDate, formatTimestamp, formatWeight, getStage } from "~~/utils/coffee";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

const ROLE_COPY: Record<string, { title: string; message: string }> = {
  Admin: {
    title: "System Administrator",
    message: "You can oversee the workflow, inspect contract activity, and use debug tools across the coffee pipeline.",
  },
  Farmer: {
    title: "Origin Producer",
    message: "You can create new batch records and anchor the first on-chain step for each harvest.",
  },
  Processor: {
    title: "Processing Operator",
    message: "You can update harvested batches with processing data and move them to the next supply-chain stage.",
  },
  Roaster: {
    title: "Roasting Operator",
    message: "You can record roast details, cupping notes, and roast-level updates for processed batches.",
  },
  Distributor: {
    title: "Distribution Operator",
    message: "You can finalize shipment details and record where roasted coffee was sent.",
  },
  User: {
    title: "Connected Wallet",
    message:
      "Your wallet is connected, but no supply-chain role has been assigned yet. Contact an admin if you need access.",
  },
};

const QUICK_ACTIONS = [
  { href: "/submit", label: "Open Submit", roles: ["Admin", "Farmer", "Processor", "Roaster", "Distributor"] },
  { href: "/admin", label: "Open Admin", roles: ["Admin"] },
  {
    href: "/explore",
    label: "Explore Batches",
    roles: ["Admin", "Farmer", "Processor", "Roaster", "Distributor", "User"],
  },
] as const;

const getDisplayRole = (userRole: string | undefined) => {
  if (!userRole || userRole === "None") return "User";
  return userRole;
};

const getRoleCounts = (address: AddressType | undefined, batches: CoffeeBatch[]) => {
  if (!address) {
    return {
      harvested: 0,
      processed: 0,
      roasted: 0,
      distributed: 0,
      verified: 0,
    };
  }

  return batches.reduce(
    (acc, batch) => {
      if (batch.farmer?.toLowerCase() === address.toLowerCase()) acc.harvested++;
      if (batch.processor?.toLowerCase() === address.toLowerCase()) acc.processed++;
      if (batch.roaster?.toLowerCase() === address.toLowerCase()) acc.roasted++;
      if (batch.distributor?.toLowerCase() === address.toLowerCase()) acc.distributed++;
      if (batch.verified) acc.verified++;
      return acc;
    },
    { harvested: 0, processed: 0, roasted: 0, distributed: 0, verified: 0 },
  );
};

const getRoleHighlight = (role: string, counts: ReturnType<typeof getRoleCounts>) => {
  switch (role) {
    case "Admin":
      return { label: "Verified Batches", value: counts.verified.toString() };
    case "Farmer":
      return { label: "Harvested Batches", value: counts.harvested.toString() };
    case "Processor":
      return { label: "Processed Batches", value: counts.processed.toString() };
    case "Roaster":
      return { label: "Roasted Batches", value: counts.roasted.toString() };
    case "Distributor":
      return { label: "Distributed Batches", value: counts.distributed.toString() };
    default:
      return { label: "Supply Chain Access", value: "Not Assigned" };
  }
};

const getPrimaryLocation = (batch: CoffeeBatch) => {
  const stage = getStage(batch);

  switch (stage) {
    case "Distributed":
      return batch.destination || "Destination pending";
    case "Roasted":
      return batch.cuppingNotes || "Roast notes pending";
    case "Processed":
      return `${batch.moistureContent || 0}% moisture`;
    case "Harvested":
    default:
      return batch.farmName || "Farm details pending";
  }
};

const SummaryCard = ({ label, value, tone = "text-base-content" }: { label: string; value: string; tone?: string }) => (
  <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
    <div className="text-label">{label}</div>
    <div className={`mt-3 text-xl font-medium break-words ${tone}`}>{value}</div>
  </div>
);

const ProfilePage: NextPage = () => {
  const { address, chain, isConnected } = useAccount();
  const targetNetwork = useSelectedNetwork();
  const { userRole, userBatches, isLoading } = useUserBatches(address);

  const displayRole = getDisplayRole(userRole);
  const roleCopy = ROLE_COPY[displayRole] ?? ROLE_COPY.User;
  const isCorrectNetwork = chain?.id === targetNetwork.id;

  const sortedBatches = useMemo(
    () => [...userBatches].sort((a, b) => Number(b.mintTimestamp) - Number(a.mintTimestamp)),
    [userBatches],
  );

  const roleCounts = useMemo(
    () => getRoleCounts(address as AddressType | undefined, userBatches),
    [address, userBatches],
  );
  const roleHighlight = getRoleHighlight(displayRole, roleCounts);
  const verifiedCount = useMemo(() => userBatches.filter(batch => batch.verified).length, [userBatches]);
  const latestBatch = sortedBatches[0];
  const availableActions = QUICK_ACTIONS.filter(action => action.roles.includes(displayRole as never));

  if (!isConnected || !address) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] bg-base-200">
        <section className="max-w-6xl mx-auto section-padding">
          <div className="rounded-[2rem] border border-base-300 bg-base-100 p-10 shadow-sm text-center">
            <h1 className="heading-card text-4xl">Profile</h1>
            <p className="mt-4 text-muted max-w-2xl mx-auto">
              Connect your wallet to view your role, activity history, and coffee batches tied to this account.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-base-200">
      <section className="max-w-6xl mx-auto section-padding pb-16">
        <div className="rounded-[2rem] border border-base-300 bg-base-100 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-label">Profile</div>
              <h1 className="heading-card text-4xl mt-3">{roleCopy.title}</h1>
              <p className="mt-3 text-muted leading-relaxed">{roleCopy.message}</p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200/70 p-4 min-w-full lg:min-w-[320px]">
              <div className="text-label">Connected Wallet</div>
              <div className="mt-3 break-all text-sm text-base-content">
                <Address address={address} onlyEnsOrAddress size="base" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn btn-sm btn-primary" href={`/explore/address/${address}`}>
                  View Address
                </Link>
                <a
                  className="btn btn-sm btn-ghost border"
                  href={getBlockExplorerAddressLink(targetNetwork, address)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Explorer
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Role"
            value={displayRole}
            tone={displayRole === "User" ? "text-accent" : "text-primary"}
          />
          <SummaryCard
            label="Network"
            value={chain?.name ?? "Disconnected"}
            tone={isCorrectNetwork ? "text-primary" : "text-accent"}
          />
          <SummaryCard label="Tracked Batches" value={userBatches.length.toString()} />
          <SummaryCard label={roleHighlight.label} value={roleHighlight.value} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-label">Activity Snapshot</div>
                <h2 className="mt-2 text-2xl font-medium">What this wallet has done</h2>
              </div>
              <div className="text-sm text-muted">
                {latestBatch
                  ? `Latest batch ${latestBatch.batchName} added ${formatTimestamp(latestBatch.mintTimestamp)}`
                  : "No batch history yet"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard label="Harvested" value={roleCounts.harvested.toString()} />
              <SummaryCard label="Processed" value={roleCounts.processed.toString()} />
              <SummaryCard label="Roasted" value={roleCounts.roasted.toString()} />
              <SummaryCard label="Distributed" value={roleCounts.distributed.toString()} />
              <SummaryCard label="Verified" value={verifiedCount.toString()} />
              <SummaryCard label="Target Chain" value={targetNetwork.name} tone="text-primary" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="text-label">Quick Actions</div>
            <h2 className="mt-2 text-2xl font-medium">Next Steps</h2>
            <div className="mt-5 flex flex-col gap-3">
              {availableActions.map(action => (
                <Link key={action.href} href={action.href} className="btn btn-outline justify-start">
                  {action.label}
                </Link>
              ))}
              {displayRole === "User" ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-4 text-sm text-muted leading-relaxed">
                  This wallet can browse the app, but it cannot submit supply-chain updates until an admin assigns a
                  role.
                </div>
              ) : null}
              {!isCorrectNetwork ? (
                <div className="rounded-2xl border border-dashed border-warning/40 bg-warning/10 p-4 text-sm leading-relaxed text-base-content">
                  You are connected to <strong>{chain?.name ?? "an unknown network"}</strong>. Switch to{" "}
                  <strong>{targetNetwork.name}</strong> for contract reads and writes to match the app&apos;s target
                  chain.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label">Batch History</div>
              <h2 className="mt-2 text-2xl font-medium">Batches tied to this wallet</h2>
            </div>
            <div className="text-sm text-muted">
              {isLoading
                ? "Loading history..."
                : `${sortedBatches.length} batch${sortedBatches.length === 1 ? "" : "es"}`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : sortedBatches.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-base-300 bg-base-200/60 p-8 text-center">
              <h3 className="text-xl font-medium">No activity yet</h3>
              <p className="mt-3 text-muted max-w-2xl mx-auto">
                Once this wallet harvests, processes, roasts, distributes, or verifies a batch, that history will show
                up here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {sortedBatches.map(batch => {
                const stage = getStage(batch);
                const hasAddressPage = batch.farmer && batch.farmer !== zeroAddress;

                return (
                  <Link
                    key={`${batch.batchId.toString()}-${batch.batchName}`}
                    href={`/explore/batch/${batch.batchName}`}
                    className="rounded-3xl border border-base-300 bg-base-200/50 p-5 transition-transform hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-[0.12em] text-muted">
                          Batch #{batch.batchId.toString()}
                        </div>
                        <div className="mt-2 text-lg font-semibold break-words">{batch.batchName}</div>
                        <div className="mt-1 text-sm text-muted">{getPrimaryLocation(batch)}</div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm font-medium ${STAGE_STYLES[stage]}`}
                      >
                        {stage}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-label">Region</div>
                        <div className="mt-1">{REGIONS[batch.region] ?? "Unknown"}</div>
                      </div>
                      <div>
                        <div className="text-label">Verified</div>
                        <div className={`mt-1 ${batch.verified ? "text-primary" : "text-accent"}`}>
                          {batch.verified ? "Verified" : "Pending"}
                        </div>
                      </div>
                      <div>
                        <div className="text-label">Created</div>
                        <div className="mt-1">{formatDate(batch.mintTimestamp)}</div>
                      </div>
                      <div>
                        <div className="text-label">Weight</div>
                        <div className="mt-1">{formatWeight(batch.harvestWeight)} kg</div>
                      </div>
                    </div>

                    {hasAddressPage ? (
                      <div className="mt-5 flex items-center justify-between text-sm text-muted">
                        <span>{formatTimestamp(batch.mintTimestamp)}</span>
                        <span>Open batch</span>
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
