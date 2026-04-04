"use client";

import { useMemo } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useDeployedContractInfo, useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { truncateAddress } from "~~/utils/coffee";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";

const ContractStatusDashboard = () => {
  const contractsData = useAllContracts();
  const contractNames = Object.keys(contractsData) as ContractName[];
  const primaryContractName = contractNames[0];

  const targetNetwork = useSelectedNetwork();
  const { chain } = useAccount();
  const isCorrectNetwork = chain?.id === targetNetwork.id;
  const { data: deployedContractInfo } = useDeployedContractInfo({ contractName: primaryContractName });

  const { data: balanceData } = useBalance({
    address: deployedContractInfo?.address,
    query: {
      enabled: !!deployedContractInfo?.address,
    },
  });

  const contractAddress = deployedContractInfo?.address ?? "Not Deployed";
  const formattedBalance = balanceData ? `${formatEther(balanceData.value)} ${balanceData.symbol}` : "0 ETH";

  const stats = useMemo(
    () => [
      {
        label: primaryContractName || "Contract Name",
        value: contractAddress !== "Not Deployed" ? truncateAddress(contractAddress) : "Not Found",
        tone: deployedContractInfo ? "text-success" : "text-accent",
      },
      {
        label: "Balance",
        value: formattedBalance,
        tone: "text-primary",
      },
      {
        label: "Network",
        value: chain?.name ?? "Disconnected",
        tone: isCorrectNetwork ? "text-primary" : "text-accent",
      },
    ],
    [deployedContractInfo, contractAddress, formattedBalance, chain?.name, isCorrectNetwork, primaryContractName],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3 mb-4">
      {stats.map(item => (
        <div key={item.label} className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm min-w-0">
          <div className="text-label">{item.label}</div>
          <div className={`mt-2 text-xl font-medium ${item.tone}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ContractStatusDashboard;
