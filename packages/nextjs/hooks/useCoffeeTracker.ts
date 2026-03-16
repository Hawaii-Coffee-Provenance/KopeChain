import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import {
  CoffeeBatch,
  PROCESSING_METHODS,
  REGIONS,
  REGION_TO_ISLAND,
  ROASTING_METHODS,
  VARIETIES,
  getStage,
} from "~~/types/coffee";

export const useCoffeeTracker = () => {
  // Contract Reads
  const { data: batchCount } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchCount",
  });

  const { data: rawBatches, isLoading: rawBatchesLoading } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatches",
    args: [0n, batchCount ? BigInt(batchCount) : 100n],
  });

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
  const txHashMap = useMemo((): Record<string, `0x${string}`> => {
    const map: Record<string, `0x${string}`> = {};

    const processEvents = (events: any[] | undefined) => {
      if (!events) return;
      events.forEach(e => {
        if (e.args.batchId !== undefined && e.transactionHash) {
          map[e.args.batchId.toString()] = e.transactionHash as `0x${string}`;
        }
      });
    };

    processEvents(harvestedEvents);
    processEvents(processedEvents);
    processEvents(roastedEvents);
    processEvents(distributedEvents);
    processEvents(verifiedEvents);

    return map;
  }, [harvestedEvents, processedEvents, roastedEvents, distributedEvents, verifiedEvents]);

  const stats = useMemo(() => {
    const rawData = (rawBatches as any[] | undefined) ?? [];

    const batches: CoffeeBatch[] = rawData.map(nested => ({
      batchId: nested.batchId,
      batchNumber: nested.batchNumber,
      verified: nested.verified,
      mintTimestamp: nested.mintTimestamp,

      // HarvestData
      region: nested.harvestData.region,
      variety: nested.harvestData.variety,
      elevation: nested.harvestData.elevation,
      harvestDate: nested.harvestData.harvestDate,
      harvestWeight: nested.harvestData.harvestWeight,
      farmer: nested.harvestData.farmer,
      farmName: nested.harvestData.farmName,
      harvestLocation: {
        latitude: nested.harvestData.location.latitude,
        longitude: nested.harvestData.location.longitude,
      },

      // ProcessingData
      processingMethod: nested.processingData.processingMethod,
      moistureContent: nested.processingData.moistureContent,
      scaScore: nested.processingData.scaScore,
      humidity: nested.processingData.humidity,
      dryTemperature: nested.processingData.dryTemperature,
      processingDate: nested.processingData.processingDate,
      processingBeforeWeight: nested.processingData.beforeWeight,
      processingAfterWeight: nested.processingData.afterWeight,
      processor: nested.processingData.processor,
      processingLocation: {
        latitude: nested.processingData.location.latitude,
        longitude: nested.processingData.location.longitude,
      },

      // RoastingData
      roastingMethod: nested.roastingData.roastingMethod,
      roastLevel: nested.roastingData.roastLevel,
      transportTime: nested.roastingData.transportTime,
      roastingDate: nested.roastingData.roastingDate,
      roastingBeforeWeight: nested.roastingData.beforeWeight,
      roastingAfterWeight: nested.roastingData.afterWeight,
      roaster: nested.roastingData.roaster,
      cuppingNotes: nested.roastingData.cuppingNotes,
      roastingLocation: {
        latitude: nested.roastingData.location.latitude,
        longitude: nested.roastingData.location.longitude,
      },

      // DistributionData
      distributionDate: nested.distributionData.distributionDate,
      bagCount: nested.distributionData.bagCount,
      distributionWeight: nested.distributionData.distributionWeight,
      distributor: nested.distributionData.distributor,
      destination: nested.distributionData.destination,
      distributionLocation: {
        latitude: nested.distributionData.location.latitude,
        longitude: nested.distributionData.location.longitude,
      },
    }));

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
    const scaLabel = !averageScaScore
      ? "No Scores Yet"
      : Number(averageScaScore) >= 90
        ? "Excellent Quality"
        : Number(averageScaScore) >= 85
          ? "Very Good Quality"
          : "Specialty Grade";
    const highestSca = scoredBatches.length > 0 ? Math.max(...scoredBatches.map(b => b.scaScore)) : 0;
    const lowestSca = scoredBatches.length > 0 ? Math.min(...scoredBatches.map(b => b.scaScore)) : 0;

    const totalWeightKg = batches.reduce((sum, b) => sum + Number(b.harvestWeight), 0);
    const totalWeightDisplay = totalWeightKg >= 1000 ? `${(totalWeightKg / 1000).toFixed(2)}k` : `${totalWeightKg}`;

    const islands = new Set(batches.map(b => REGION_TO_ISLAND[b.region]));
    const islandCount = islands.size;

    // Analytics
    const pipeline = {
      harvested: batches.filter(b => getStage(b) === "Harvested").length,
      processed: batches.filter(b => getStage(b) === "Processed").length,
      roasted: batches.filter(b => getStage(b) === "Roasted").length,
      distributed: batches.filter(b => getStage(b) === "Distributed").length,
    };

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

    const nested = data as any;

    return {
      batchId: nested.batchId,
      batchNumber: nested.batchNumber,
      verified: nested.verified,
      mintTimestamp: nested.mintTimestamp,

      // HarvestData
      region: nested.harvestData.region,
      variety: nested.harvestData.variety,
      elevation: nested.harvestData.elevation,
      harvestDate: nested.harvestData.harvestDate,
      harvestWeight: nested.harvestData.harvestWeight,
      farmer: nested.harvestData.farmer,
      farmName: nested.harvestData.farmName,
      harvestLocation: {
        latitude: nested.harvestData.location.latitude,
        longitude: nested.harvestData.location.longitude,
      },

      // ProcessingData
      processingMethod: nested.processingData.processingMethod,
      moistureContent: nested.processingData.moistureContent,
      scaScore: nested.processingData.scaScore,
      humidity: nested.processingData.humidity,
      dryTemperature: nested.processingData.dryTemperature,
      processingDate: nested.processingData.processingDate,
      processingBeforeWeight: nested.processingData.beforeWeight,
      processingAfterWeight: nested.processingData.afterWeight,
      processor: nested.processingData.processor,
      processingLocation: {
        latitude: nested.processingData.location.latitude,
        longitude: nested.processingData.location.longitude,
      },

      // RoastingData
      roastingMethod: nested.roastingData.roastingMethod,
      roastLevel: nested.roastingData.roastLevel,
      transportTime: nested.roastingData.transportTime,
      roastingDate: nested.roastingData.roastingDate,
      roastingBeforeWeight: nested.roastingData.beforeWeight,
      roastingAfterWeight: nested.roastingData.afterWeight,
      roaster: nested.roastingData.roaster,
      cuppingNotes: nested.roastingData.cuppingNotes,
      roastingLocation: {
        latitude: nested.roastingData.location.latitude,
        longitude: nested.roastingData.location.longitude,
      },

      // DistributionData
      distributionDate: nested.distributionData.distributionDate,
      bagCount: nested.distributionData.bagCount,
      distributionWeight: nested.distributionData.distributionWeight,
      distributor: nested.distributionData.distributor,
      destination: nested.distributionData.destination,
      distributionLocation: {
        latitude: nested.distributionData.location.latitude,
        longitude: nested.distributionData.location.longitude,
      },
    } as CoffeeBatch;
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

    const rawData = data[1] as any[];

    return rawData.map(nested => ({
      batchId: nested.batchId,
      batchNumber: nested.batchNumber,
      verified: nested.verified,
      mintTimestamp: nested.mintTimestamp,

      // HarvestData
      region: nested.harvestData.region,
      variety: nested.harvestData.variety,
      elevation: nested.harvestData.elevation,
      harvestDate: nested.harvestData.harvestDate,
      harvestWeight: nested.harvestData.harvestWeight,
      farmer: nested.harvestData.farmer,
      farmName: nested.harvestData.farmName,
      harvestLocation: {
        latitude: nested.harvestData.location.latitude,
        longitude: nested.harvestData.location.longitude,
      },

      // ProcessingData
      processingMethod: nested.processingData.processingMethod,
      moistureContent: nested.processingData.moistureContent,
      scaScore: nested.processingData.scaScore,
      humidity: nested.processingData.humidity,
      dryTemperature: nested.processingData.dryTemperature,
      processingDate: nested.processingData.processingDate,
      processingBeforeWeight: nested.processingData.beforeWeight,
      processingAfterWeight: nested.processingData.afterWeight,
      processor: nested.processingData.processor,
      processingLocation: {
        latitude: nested.processingData.location.latitude,
        longitude: nested.processingData.location.longitude,
      },

      // RoastingData
      roastingMethod: nested.roastingData.roastingMethod,
      roastLevel: nested.roastingData.roastLevel,
      transportTime: nested.roastingData.transportTime,
      roastingDate: nested.roastingData.roastingDate,
      roastingBeforeWeight: nested.roastingData.beforeWeight,
      roastingAfterWeight: nested.roastingData.afterWeight,
      roaster: nested.roastingData.roaster,
      cuppingNotes: nested.roastingData.cuppingNotes,
      roastingLocation: {
        latitude: nested.roastingData.location.latitude,
        longitude: nested.roastingData.location.longitude,
      },

      // DistributionData
      distributionDate: nested.distributionData.distributionDate,
      bagCount: nested.distributionData.bagCount,
      distributionWeight: nested.distributionData.distributionWeight,
      distributor: nested.distributionData.distributor,
      destination: nested.distributionData.destination,
      distributionLocation: {
        latitude: nested.distributionData.location.latitude,
        longitude: nested.distributionData.location.longitude,
      },
    })) as CoffeeBatch[];
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
