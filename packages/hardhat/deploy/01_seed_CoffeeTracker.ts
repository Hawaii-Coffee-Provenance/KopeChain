import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import defaultData from "../data/default-data.json";
import { CoffeeTracker } from "../typechain-types";
import { pinJSON, pinFile, findExistingPin, getOrCreateGroup } from "../utils/pinata";
import { generateQRBuffer } from "../utils/qrcode";
import { REGIONS, ROAST_LEVELS, buildFullMetadata } from "../utils/buildMetadata";
import { BAND_TRAITS, MUG_TRAITS, STEAM_TRAITS, generateNftBuffer, getRandomTrait } from "../utils/nft";

const DATA = defaultData;
const TOTAL = DATA.length;

const HARVESTED_ONLY_COUNT = 2;
const PROCESSED_ONLY_COUNT = 3;
const ROASTED_ONLY_COUNT = 3;
const DISTRIBUTED_COUNT = 2;

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function chooseSubset(pool: number[], num: number, seed: string): number[] {
  return [...pool].sort((a, b) => hashCode(seed + a) - hashCode(seed + b)).slice(0, Math.min(num, pool.length));
}

const seedCoffeeTracker: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  console.log(`Network: ${network.name}`);
  console.log(`Seeding with deployer: ${deployer.address}`);

  const coffeeTracker = await ethers.getContract<CoffeeTracker>("CoffeeTracker", deployer);

  const groupId = await getOrCreateGroup(`CoffeeTracker-${network.name}-batch`);
  const qrGroupId = await getOrCreateGroup(`CoffeeTracker-${network.name}-qr`);
  const nftGroupId = await getOrCreateGroup(`CoffeeTracker-${network.name}-nft`);

  const allIndices = Array.from({ length: TOTAL }, (_, i) => i);
  if (TOTAL !== HARVESTED_ONLY_COUNT + PROCESSED_ONLY_COUNT + ROASTED_ONLY_COUNT + DISTRIBUTED_COUNT) {
    throw new Error("Seed counts must sum to the number of batches.");
  }

  const distributedIndices = chooseSubset(allIndices, DISTRIBUTED_COUNT, "distributed");
  const remainingAfterDistributed = allIndices.filter(i => !distributedIndices.includes(i));

  const roastedOnlyIndices = chooseSubset(remainingAfterDistributed, ROASTED_ONLY_COUNT, "roasted");
  const remainingAfterRoasted = remainingAfterDistributed.filter(i => !roastedOnlyIndices.includes(i));

  const processedOnlyIndices = chooseSubset(remainingAfterRoasted, PROCESSED_ONLY_COUNT, "processed");
  const processedSet = new Set([...processedOnlyIndices, ...roastedOnlyIndices, ...distributedIndices]);
  const roastedSet = new Set([...roastedOnlyIndices, ...distributedIndices]);
  const distributedSet = new Set(distributedIndices);
  const verifiedSet = new Set(allIndices);

  console.log(`Pinning ${TOTAL} metadata files...`);
  const batchCIDs: string[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const data = DATA[i];

    const existing = await findExistingPin(data.batchNumber);
    if (existing) {
      console.log(`[${i + 1}/${TOTAL}] ${data.batchNumber} - REUSING CID`);
      batchCIDs.push(existing);
      continue;
    }

    const stage = (
      distributedSet.has(i)
        ? "Distributed"
        : roastedSet.has(i)
          ? "Roasted"
          : processedSet.has(i)
            ? "Processed"
            : "Harvested"
    ) as "Harvested" | "Processed" | "Roasted" | "Distributed";

    const regionName = REGIONS[data.harvestData.region] ?? "Other";
    const roastLevelName = ROAST_LEVELS[data.roastingData.roastLevel] ?? ROAST_LEVELS[1];
    const mug = getRandomTrait(MUG_TRAITS).name;
    const band = getRandomTrait(BAND_TRAITS).name;
    const steam = getRandomTrait(STEAM_TRAITS).name;

    const [qrBuffer, nftBuffer] = await Promise.all([
      generateQRBuffer(data.batchNumber),
      generateNftBuffer({ region: regionName, stage, roastLevel: roastLevelName, mug, band, steam }),
    ]);

    const [qrCID, nftCID] = await Promise.all([
      pinFile(qrBuffer, `qr-${data.batchNumber}.png`, "image/png", qrGroupId),
      pinFile(nftBuffer, `nft-${data.batchNumber}-${stage.toLowerCase()}.png`, "image/png", nftGroupId),
    ]);

    const fullMetadata = buildFullMetadata(data, {
      processed: processedSet.has(i),
      roasted: roastedSet.has(i),
      distributed: distributedSet.has(i),
      qrCID,
      nftCID,
      verified: verifiedSet.has(i),
      stage,
      traits: { mug, band, steam },
      roastLevel: stage === "Roasted" || stage === "Distributed" ? roastLevelName : undefined,
    });

    const cid = await pinJSON(fullMetadata, `batch-${data.batchNumber}`, data.batchNumber, groupId);
    console.log(`[${i + 1}/${TOTAL}] ${data.batchNumber} - NEW CID`);
    batchCIDs.push(cid);
  }

  console.log(`Seeding ${TOTAL} batches on-chain...`);

  for (let i = 0; i < TOTAL; i++) {
    const data = DATA[i];
    const { batchNumber } = data;
    const p = data.processingData;
    const r = data.roastingData;
    const cid = batchCIDs[i];
    const batchId = i + 1;

    console.log(`[${i + 1}/${TOTAL}] ${batchNumber}`);

    await (
      await coffeeTracker.harvestBatch(batchNumber, data.harvestData.region, data.harvestData.variety, cid, {
        gasLimit: 500000,
      })
    ).wait();

    if (processedSet.has(i)) {
      await (await coffeeTracker.processBatch(batchId, p.processingMethod, cid, { gasLimit: 500000 })).wait();
    }
    if (roastedSet.has(i)) {
      await (await coffeeTracker.roastBatch(batchId, r.roastingMethod, r.roastLevel, cid, { gasLimit: 500000 })).wait();
    }
    if (distributedSet.has(i)) {
      await (await coffeeTracker.distributeBatch(batchId, cid, { gasLimit: 500000 })).wait();
    }
    if (verifiedSet.has(i)) {
      await (await coffeeTracker.verifyBatch(batchId, { gasLimit: 500000 })).wait();
    }
  }

  console.log("Seeding complete.");
};

export default seedCoffeeTracker;
seedCoffeeTracker.tags = ["SeedCoffeeTracker"];
seedCoffeeTracker.dependencies = ["CoffeeTracker"];
