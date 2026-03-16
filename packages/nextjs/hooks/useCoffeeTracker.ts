import { useEffect, useMemo, useState } from "react";
import { zeroAddress } from "viem";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { CoffeeBatch, PipelineData } from "~~/types/coffee";
import {
  PROCESSING_METHODS,
  REGIONS,
  REGION_TO_ISLAND,
  ROASTING_METHODS,
  STAGES,
  VARIETIES,
  getScaTier,
  getStage,
} from "~~/utils/coffee";
import { mapNestedToBatch } from "~~/utils/coffee";

export type BatchTxHashes = {
  harvested?: `0x${string}`;
  processed?: `0x${string}`;
  roasted?: `0x${string}`;
  distributed?: `0x${string}`;
  verified?: `0x${string}`;
};

export const useCoffeeTracker = () => {
  const { data: deployedContract } = useDeployedContractInfo({ contractName: "CoffeeTracker" });
  const publicClient = usePublicClient();

  const [rawBatches, setRawBatches] = useState<any[]>([]);
  const [rawBatchesLoading, setRawBatchesLoading] = useState(true);

  const { data: batchCount } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchCount",
  });

  // Fetch in chunks to avoid gas limits
  useEffect(() => {
    const fetchAllBatches = async () => {
      if (batchCount === undefined || !deployedContract || !publicClient) return;

      try {
        setRawBatchesLoading(true);
        const count = Number(batchCount);
        if (count === 0) {
          setRawBatches([]);
          return;
        }

        const CHUNK_SIZE = 100;
        let all: any[] = [];

        for (let i = 0; i < count; i += CHUNK_SIZE) {
          const chunk = (await publicClient.readContract({
            address: deployedContract.address,
            abi: deployedContract.abi,
            functionName: "getBatches",
            args: [BigInt(i), BigInt(CHUNK_SIZE)],
          })) as any[];
          all = [...all, ...chunk];
        }

        setRawBatches(all);
      } catch (e) {
        console.error("Error fetching batches in chunks:", e);
      } finally {
        setRawBatchesLoading(false);
      }
    };

    fetchAllBatches();
  }, [batchCount, deployedContract?.address, deployedContract?.abi, publicClient]);

  const { data: transactionCount, isLoading: transactionCountLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getTransactionCount",
  });

  const { data: farmCount, isLoading: farmCountLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getFarmCount",
  });

  const { data: harvestedEvents, isLoading: harvestedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Harvested",
    fromBlock: 0n,
  });

  const { data: processedEvents, isLoading: processedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Processed",
    fromBlock: 0n,
  });

  const { data: roastedEvents, isLoading: roastedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Roasted",
    fromBlock: 0n,
  });

  const { data: distributedEvents, isLoading: distributedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Distributed",
    fromBlock: 0n,
  });

  const { data: verifiedEvents, isLoading: verifiedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Verified",
    fromBlock: 0n,
  });

  // Transaction Hash Mapping
  const txHashMap = useMemo((): Record<string, BatchTxHashes> => {
    const map: Record<string, BatchTxHashes> = {};

    const assign = (events: any[] | undefined, stageKey: keyof BatchTxHashes) => {
      if (!events) return;
      events.forEach(e => {
        const id = e.args?.batchId?.toString();
        if (!id || !e.transactionHash) return;

        if (!map[id]) map[id] = {};

        if (!map[id][stageKey]) {
          map[id][stageKey] = e.transactionHash as `0x${string}`;
        }
      });
    };

    assign(harvestedEvents, "harvested");
    assign(processedEvents, "processed");
    assign(roastedEvents, "roasted");
    assign(distributedEvents, "distributed");
    assign(verifiedEvents, "verified");

    return map;
  }, [harvestedEvents, processedEvents, roastedEvents, distributedEvents, verifiedEvents]);

  const stats = useMemo(() => {
    const rawData = (rawBatches as any[] | undefined) ?? [];
    const batches: CoffeeBatch[] = rawData.map(mapNestedToBatch);

    if (batches.length === 0) return null;

    // Dashboard Calculations
    const now = BigInt(Math.floor(Date.now() / 1000));
    const weekAgo = now - 7n * 24n * 60n * 60n;
    const dayStart = now - (now % (24n * 60n * 60n));

    const totalBatches = batches.length;
    const batchesThisWeek = batches.filter(b => b.mintTimestamp >= weekAgo).length;
    const batchesToday = batches.filter(b => b.mintTimestamp >= dayStart).length;

    const verifiedCount = batches.filter(b => b.verified).length;
    const verifiedPercent = Math.round((verifiedCount / totalBatches) * 100);

    const scoredBatches = batches.filter(b => b.scaScore > 0);
    const averageScaScore =
      scoredBatches.length > 0
        ? (scoredBatches.reduce((sum, b) => sum + b.scaScore, 0) / scoredBatches.length).toFixed(1)
        : 0;
    const scaTier = getScaTier(Number(averageScaScore));
    const scaLabel = !averageScaScore ? "No Scores Yet" : `${scaTier.label} Quality`;
    const highestSca = scoredBatches.length > 0 ? Math.max(...scoredBatches.map(b => b.scaScore)) : 0;
    const lowestSca = scoredBatches.length > 0 ? Math.min(...scoredBatches.map(b => b.scaScore)) : 0;

    const totalWeightKg = batches.reduce((sum, b) => sum + Number(b.harvestWeight), 0);
    const totalWeightDisplay = totalWeightKg >= 1000 ? `${(totalWeightKg / 1000).toFixed(2)}k` : `${totalWeightKg}`;

    const islands = new Set(batches.map(b => REGION_TO_ISLAND[b.region]));
    const islandCount = islands.size;

    // Analytics
    const pipeline = STAGES.reduce(
      (acc: PipelineData, stage) => {
        const key = stage.toLowerCase() as keyof PipelineData;
        acc[key] = batches.filter(b => getStage(b) === stage).length;
        return acc;
      },
      { harvested: 0, processed: 0, roasted: 0, distributed: 0 },
    );

    const regionCounters = Object.entries(REGIONS)
      .map(([key, name]) => ({
        name,
        count: batches.filter(b => b.region === Number(key)).length,
      }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);

    const scaBuckets = [80, 82, 84, 86, 88, 90, 92, 94, 96].map(floor => ({
      score: `${floor}`,
      count: scoredBatches.filter(b => b.scaScore >= floor && b.scaScore < floor + 2).length,
    }));

    const recentBatches = [...batches].sort((a, b) => Number(b.mintTimestamp) - Number(a.mintTimestamp));

    // Timeline
    const averageElevation = Math.round(batches.reduce((sum, b) => sum + b.elevation, 0) / totalBatches);
    const averageYield = Math.round(batches.reduce((sum, b) => sum + Number(b.harvestWeight), 0) / totalBatches);
    const varietyCount = Object.keys(VARIETIES).length - 1;

    const processedBatches = batches.filter(b => b.moistureContent > 0);
    const averageMoisture =
      processedBatches.length > 0
        ? Math.round((processedBatches.reduce((sum, b) => sum + b.moistureContent, 0) / processedBatches.length) * 10) /
          10
        : 0;
    const processMethodCount = Object.keys(PROCESSING_METHODS).length - 1;

    const roastedBatches = batches.filter(b => b.roastingAfterWeight > 0n && b.roastingBeforeWeight > 0n);
    const roastMethodCount = Object.keys(ROASTING_METHODS).length - 1;
    const averageRoastWeightLoss =
      roastedBatches.length > 0
        ? Math.round(
            (roastedBatches.reduce((sum, b) => {
              const before = Number(b.roastingBeforeWeight);
              const after = Number(b.roastingAfterWeight);
              return sum + ((before - after) / before) * 100;
            }, 0) /
              roastedBatches.length) *
              10,
          ) / 10
        : 0;

    const distributedBatches = batches.filter(b => b.transportTime > 0);
    const averageTransportTime =
      distributedBatches.length > 0
        ? Math.round(distributedBatches.reduce((sum, b) => sum + b.transportTime, 0) / distributedBatches.length)
        : 0;

    return {
      totalBatches,
      batchesThisWeek,
      batchesToday,
      verifiedCount,
      verifiedPercent,
      averageScaScore,
      scaLabel,
      highestSca,
      lowestSca,
      totalWeightDisplay,
      islandCount,

      pipeline,
      regionCounters,
      scaBuckets,

      recentBatches,
      allBatches: batches,

      averageElevation,
      averageYield,
      varietyCount,
      averageMoisture,
      processMethodCount,
      roastMethodCount,
      averageRoastWeightLoss,
      averageTransportTime,
    };
  }, [rawBatches]);

  return {
    stats,
    transactionCount,
    farmCount,
    txHashMap,
    isLoading:
      rawBatchesLoading ||
      transactionCountLoading ||
      farmCountLoading ||
      harvestedEventsLoading ||
      processedEventsLoading ||
      roastedEventsLoading ||
      distributedEventsLoading ||
      verifiedEventsLoading,
  };
};

export const useCoffeeBatch = (batchNumber: string) => {
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchByNumber",
    args: [batchNumber],
  });

  const batch = useMemo(() => {
    if (!data) return undefined;
    return mapNestedToBatch(data as any);
  }, [data]);

  return { batch, isLoading };
};

export const useUserBatches = (address: string | undefined) => {
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getUserBatches",
    args: [address ?? zeroAddress],
  });

  const userBatches = useMemo(() => {
    if (!data?.[1]) return undefined;
    return (data[1] as any[]).map(mapNestedToBatch);
  }, [data]);

  return {
    userRole: data?.[0] as string | undefined,
    userBatches,
    isLoading,
  };
};

export const useUserRole = (address: string | undefined) => {
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getRole",
    args: [address ?? zeroAddress],
  });

  return { userRole: data as string | undefined, isLoading };
};
