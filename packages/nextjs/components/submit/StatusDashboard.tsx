"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { truncateAddress } from "~~/utils/coffee";

type StatusDashboardProps = {
  userRole: string | undefined;
};

const StatusDashboard = ({ userRole }: StatusDashboardProps) => {
  const { address, chain, isConnected } = useAccount();
  const targetNetwork = useSelectedNetwork();
  const isCorrectNetwork = chain?.id === targetNetwork.id;

  const statusItems = useMemo(
    () => [
      {
        label: "Wallet",
        value: isConnected && address ? truncateAddress(address) : "Not connected",
        tone: isConnected ? "text-primary" : "text-accent",
      },
      {
        label: "Role",
        value: userRole ?? "Unknown",
        tone: userRole !== "User" && userRole !== "Unknown" ? "text-primary" : "text-accent",
      },
      {
        label: "Network",
        value: chain?.name ?? "Disconnected",
        tone: isCorrectNetwork ? "text-primary" : "text-accent",
      },
    ],
    [address, chain?.name, isConnected, isCorrectNetwork, userRole],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {statusItems.map(item => (
        <div key={item.label} className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm min-w-0">
          <div className="text-label">{item.label}</div>
          <div className={`mt-2 text-xl font-medium ${item.tone}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatusDashboard;
