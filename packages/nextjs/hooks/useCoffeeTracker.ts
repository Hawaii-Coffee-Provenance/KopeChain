import { useMemo } from "react";
import { useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const useCoffeeTrackerMainPageStats = () => {
  const { data: batchCount, isLoading: batchCountLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchCount",
  });

  const { data: verifiedCount, isLoading: verifiedCountLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getVerifiedCount",
  });

  const { data: transactionCount, isLoading: transactionCountLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getTransactionCount",
  });

  const { data: farmCount, isLoading: farmCountLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getFarmCount",
  });

  return {
    batchCount,
    verifiedCount,
    transactionCount,
    farmCount,
    isLoading: batchCountLoading || verifiedCountLoading || transactionCountLoading || farmCountLoading,
  };
};

export const useCoffeeTrackerBatches = () => {
  const { data: allBatches, isLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getAllBatches",
  });

  return {
    allBatches,
    isLoading,
  };
};

export const useCoffeeBatchTxHashes = () => {
  const { data: harvestedEvents, isLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Harvested",
    fromBlock: 0n,
  });

  const txHashMap = useMemo((): Record<string, `0x${string}`> => {
    if (!harvestedEvents) return {};

    const batchIdToTxHash: Record<string, `0x${string}`> = {};

    for (const { args, transactionHash } of harvestedEvents) {
      if (args.batchId !== undefined && transactionHash) {
        batchIdToTxHash[args.batchId.toString()] = transactionHash;
      }
    }
    return batchIdToTxHash;
  }, [harvestedEvents]);

  return { txHashMap, isLoading };
};
