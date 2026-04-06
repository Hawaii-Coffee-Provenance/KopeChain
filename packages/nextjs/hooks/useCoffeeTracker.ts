import { useMemo } from "react";
import { useDeployedContractInfo, useScaffoldEventHistory, useScaffoldReadContract } from "./scaffold-eth";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Abi, zeroAddress } from "viem";
import { usePublicClient, useReadContracts } from "wagmi";
import { BatchMetadata, BatchTxHashes, CoffeeBatch, RawBatch } from "~~/types/batch";
import { CoffeeTrackerStats, PipelineData } from "~~/types/coffee";
import {
  PROCESSING_METHODS,
  REGIONS,
  REGION_TO_ISLAND,
  ROASTING_METHODS,
  STAGES,
  VARIETIES,
  formatWeight,
  getScaTier,
  getStage,
  mapBatch,
} from "~~/utils/coffee";
import { fetchMetadata } from "~~/utils/pinata";

async function fetchAllBatches(
  publicClient: ReturnType<typeof usePublicClient>,
  contract: { address: `0x${string}`; abi: any },
  count: number,
): Promise<RawBatch[]> {
  if (count === 0) return [];

  const CHUNK_SIZE = 100;

  const results = await Promise.all(
    Array.from(
      { length: Math.ceil(count / CHUNK_SIZE) },
      (_, i) =>
        publicClient!.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getBatches",
          args: [BigInt(i * CHUNK_SIZE), BigInt(CHUNK_SIZE)],
        }) as Promise<RawBatch[]>,
    ),
  );

  return results.flat();
}

export const useCoffeeTracker = ({ includeTxHashes = false }: { includeTxHashes?: boolean } = {}) => {
  const { data: deployedContract } = useDeployedContractInfo({ contractName: "CoffeeTracker" });
  const publicClient = usePublicClient();

  const commonQueryConfig = {
    enabled: !!deployedContract,
    staleTime: 30_000,
  };

  const { data: combinedData, isLoading: combinedDataLoading } = useReadContracts({
    contracts: [
      {
        address: deployedContract?.address,
        abi: deployedContract?.abi as Abi,
        functionName: "getBatchCount",
      },
      {
        address: deployedContract?.address,
        abi: deployedContract?.abi as Abi,
        functionName: "getTransactionCount",
      },
      {
        address: deployedContract?.address,
        abi: deployedContract?.abi as Abi,
        functionName: "getFarmCount",
      },
    ],
    query: commonQueryConfig,
  });

  const [batchCountRes, transactionCountRes, farmCountRes] = combinedData || [];
  const batchCount = batchCountRes?.result as bigint | undefined;
  const transactionCount = transactionCountRes?.result as bigint | undefined;
  const farmCount = farmCountRes?.result as bigint | undefined;

  const { data: rawBatches = [], isLoading: rawBatchesLoading } = useQuery({
    queryKey: ["batches", deployedContract?.address, Number(batchCount)],
    queryFn: () => fetchAllBatches(publicClient, deployedContract!, Number(batchCount)),
    enabled: !!publicClient && !!deployedContract && batchCount !== undefined,
    staleTime: 30_000,
  });

  const uniqueCIDs = useMemo(() => [...new Set(rawBatches.map(b => b.metadataCID).filter(Boolean))], [rawBatches]);

  const metadataQueries = useQueries({
    queries: uniqueCIDs.map(cid => ({
      queryKey: ["ipfs", cid],
      queryFn: () => fetchMetadata(cid),
      staleTime: 5 * 60_000,
      gcTime: 60 * 60_000,
      retry: 2,
    })),
  });

  const metadataMap = useMemo(() => {
    const map = new Map<string, BatchMetadata>();
    uniqueCIDs.forEach((cid, i) => {
      const d = metadataQueries[i]?.data;
      if (d) map.set(cid, d);
    });
    return map;
  }, [uniqueCIDs, metadataQueries]);
  const metadataLoading = metadataQueries.some(q => q.isLoading);

  const eventQueryConfig = {
    enabled: includeTxHashes,
    blocksBatchSize: 5000,
  } as const;

  const { data: harvestedEvents, isLoading: harvestedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Harvested",
    ...eventQueryConfig,
  });

  const { data: processedEvents, isLoading: processedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Processed",
    ...eventQueryConfig,
  });

  const { data: roastedEvents, isLoading: roastedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Roasted",
    ...eventQueryConfig,
  });

  const { data: distributedEvents, isLoading: distributedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Distributed",
    ...eventQueryConfig,
  });

  const { data: verifiedEvents, isLoading: verifiedEventsLoading } = useScaffoldEventHistory({
    contractName: "CoffeeTracker",
    eventName: "Verified",
    ...eventQueryConfig,
  });

  const txHashMap = useMemo((): Record<string, BatchTxHashes> => {
    const map: Record<string, BatchTxHashes> = {};

    const assign = (
      events: { args?: { batchId?: bigint } | unknown[]; transactionHash?: `0x${string}` }[] | undefined,
      key: keyof BatchTxHashes,
    ) => {
      if (!events) return;
      events.forEach(e => {
        const args = e.args as { batchId?: bigint } | unknown[] | undefined;
        const batchId = (Array.isArray(args) ? args[0] : args?.batchId) as bigint | undefined;
        const id = batchId?.toString();
        if (!id || !e.transactionHash) return;
        if (!map[id]) map[id] = {};
        if (!map[id][key]) map[id][key] = e.transactionHash;
      });
    };

    assign(harvestedEvents, "harvested");
    assign(processedEvents, "processed");
    assign(roastedEvents, "roasted");
    assign(distributedEvents, "distributed");
    assign(verifiedEvents, "verified");

    return map;
  }, [harvestedEvents, processedEvents, roastedEvents, distributedEvents, verifiedEvents]);

  const stats = useMemo((): CoffeeTrackerStats | null => {
    if (!rawBatches.length) return null;

    const batches: CoffeeBatch[] = rawBatches.map(raw => mapBatch(raw, metadataMap.get(raw.metadataCID)));

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
    const totalWeightDisplay = formatWeight(totalWeightKg);
    const islandCount = new Set(batches.map(b => REGION_TO_ISLAND[b.region])).size;

    const pipeline = STAGES.reduce(
      (acc: PipelineData, stage) => {
        acc[stage.toLowerCase() as keyof PipelineData] = batches.filter(b => getStage(b) === stage).length;
        return acc;
      },
      { harvested: 0, processed: 0, roasted: 0, distributed: 0 },
    );

    const regionCounters = Object.entries(REGIONS)
      .map(([key, name]) => ({ name, count: batches.filter(b => b.region === Number(key)).length }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);

    const scaBuckets = [80, 82, 84, 86, 88, 90, 92, 94, 96].map(floor => ({
      score: `${floor}`,
      count: scoredBatches.filter(b => b.scaScore >= floor && b.scaScore < floor + 2).length,
    }));

    const recentBatches = [...batches].sort((a, b) => Number(b.mintTimestamp) - Number(a.mintTimestamp));
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
  }, [rawBatches, metadataMap]);

  return {
    stats,
    transactionCount,
    farmCount,
    txHashMap,
    isLoading:
      rawBatchesLoading ||
      combinedDataLoading ||
      metadataLoading ||
      (includeTxHashes &&
        (harvestedEventsLoading ||
          processedEventsLoading ||
          roastedEventsLoading ||
          distributedEventsLoading ||
          verifiedEventsLoading)),
  };
};

export const useCoffeeBatch = (batchNumber: string) => {
  const { data: rawBatch, isLoading: batchLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchByNumber",
    args: [batchNumber],
  });

  const cid = (rawBatch as RawBatch | undefined)?.metadataCID ?? "";

  const { data: metadata, isLoading: metadataLoading } = useQuery({
    queryKey: ["ipfs", cid],
    queryFn: () => fetchMetadata(cid),
    enabled: !!cid,
    staleTime: Infinity,
    gcTime: 60 * 60_000,
    retry: 2,
  });

  const batch = useMemo(() => {
    if (!rawBatch) return undefined;
    return mapBatch(rawBatch as RawBatch, metadata);
  }, [rawBatch, metadata]);

  return { batch, isLoading: batchLoading || metadataLoading };
};

export const useUserBatches = (address: string | undefined) => {
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getUserBatches",
    args: [address ?? zeroAddress],
  });

  const rawHistory = useMemo((): RawBatch[] => {
    if (!data) return [];
    return ((data as any).history || (data as any)[1] || []) as RawBatch[];
  }, [data]);

  const uniqueCIDs = useMemo(() => [...new Set(rawHistory.map(b => b.metadataCID).filter(Boolean))], [rawHistory]);

  const metadataQueries = useQueries({
    queries: uniqueCIDs.map(cid => ({
      queryKey: ["ipfs", cid],
      queryFn: () => fetchMetadata(cid),
      staleTime: 5 * 60_000,
      gcTime: 60 * 60_000,
      retry: 2,
    })),
  });

  const metadataMap = useMemo(() => {
    const map = new Map<string, BatchMetadata>();
    uniqueCIDs.forEach((cid, i) => {
      const d = metadataQueries[i]?.data;
      if (d) map.set(cid, d);
    });
    return map;
  }, [uniqueCIDs, metadataQueries]);
  const userRole = useMemo(() => ((data as any)?.userRole || (data as any)?.[0]) as string | undefined, [data]);
  const userBatches = useMemo(
    () => rawHistory.map(raw => mapBatch(raw, metadataMap.get(raw.metadataCID))),
    [rawHistory, metadataMap],
  );

  return { userRole, userBatches, isLoading };
};

export const useUserRole = (address: string | undefined) => {
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getRole",
    args: [address ?? zeroAddress],
  });
  return { userRole: data as string | undefined, isLoading };
};
