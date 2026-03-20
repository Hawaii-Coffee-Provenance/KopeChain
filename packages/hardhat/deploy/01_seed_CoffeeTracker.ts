import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import defaultData from "../data/default-data.json";
import { CoffeeTracker } from "../typechain-types";
import { pinJSON, findExistingPin, appendAndRepin, getOrCreateGroup } from "../utils/pinata";
import { PROCESSING_METHODS, ROASTING_METHODS, ROAST_LEVELS, buildMetadata } from "../utils/buildMetadata";

const DATA = defaultData.slice(0, 50);
const TOTAL = DATA.length;

const PROCESSED_COUNT = Math.floor(TOTAL * 0.8);
const ROASTED_COUNT = Math.floor(TOTAL * 0.7);
const DISTRIBUTED_COUNT = Math.floor(TOTAL * 0.6);
const VERIFIED_COUNT = Math.floor(TOTAL * 0.45);

const PINATA_DELAY = 500;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function pickRandom(pool: number[], num: number): number[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(num, pool.length));
}

const seedCoffeeTracker: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const [deployer, farmer, processor, roaster, distributor] = await ethers.getSigners();

  const coffeeTracker = await ethers.getContract<CoffeeTracker>("CoffeeTracker", deployer);

  console.log("Granting roles...");
  await coffeeTracker.grantRole(await coffeeTracker.FARMER_ROLE(), farmer.address, { gasLimit: 500000 });
  await coffeeTracker.grantRole(await coffeeTracker.PROCESSOR_ROLE(), processor.address, { gasLimit: 500000 });
  await coffeeTracker.grantRole(await coffeeTracker.ROASTER_ROLE(), roaster.address, { gasLimit: 500000 });
  await coffeeTracker.grantRole(await coffeeTracker.DISTRIBUTOR_ROLE(), distributor.address, { gasLimit: 500000 });

  const groupId = await getOrCreateGroup("CoffeeTracker-local");

  const allIndices = Array.from({ length: TOTAL }, (_, i) => i);
  const processedIndices = pickRandom(allIndices, PROCESSED_COUNT);
  const roastedIndices = pickRandom(processedIndices, ROASTED_COUNT);
  const distributedIndices = pickRandom(roastedIndices, DISTRIBUTED_COUNT);
  const verifiedIndices = pickRandom(allIndices, VERIFIED_COUNT);

  const processedSet = new Set(processedIndices);
  const roastedSet = new Set(roastedIndices);
  const distributedSet = new Set(distributedIndices);
  const verifiedSet = new Set(verifiedIndices);

  console.log(`Pinning ${TOTAL} metadata files...`);

  const harvestCIDs: string[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const data = DATA[i];
    await sleep(PINATA_DELAY);

    const existing = await findExistingPin(data.batchNumber);
    if (existing) {
      console.log(`[${i + 1}/${TOTAL}] ${data.batchNumber} - REUSING CID`);
      harvestCIDs.push(existing);
      continue;
    }

    const cid = await pinJSON(buildMetadata(data), `batch-${data.batchNumber}`, data.batchNumber, groupId);
    console.log(`[${i + 1}/${TOTAL}] ${data.batchNumber} - NEW CID`);
    harvestCIDs.push(cid);
  }

  console.log(`Seeding ${TOTAL} batches on-chain...`);

  let batchId = 1;

  for (let i = 0; i < TOTAL; i++) {
    const data = DATA[i];
    const { batchNumber } = data;
    const p = data.processingData;
    const r = data.roastingData;
    const d = data.distributionData;

    let cid = harvestCIDs[i];

    console.log(`[${i + 1}/${TOTAL}] ${batchNumber}`);

    await coffeeTracker
      .connect(farmer)
      .harvestBatch(batchNumber, data.harvestData.region, data.harvestData.variety, cid, { gasLimit: 500000 });

    if (processedSet.has(i)) {
      cid = await appendAndRepin(
        cid,
        {
          processing: {
            processingMethod: PROCESSING_METHODS[p.processingMethod],
            moistureContent: p.moistureContent,
            scaScore: p.scaScore,
            humidity: p.humidity,
            dryTemperature: p.dryTemperature,
            processingDate: p.processingDate,
            beforeWeight: p.beforeWeight,
            afterWeight: p.afterWeight,
            location: { latitude: p.location.latitude / 1e6, longitude: p.location.longitude / 1e6 },
          },
        },
        batchNumber,
        groupId,
      );
      await coffeeTracker.connect(processor).processBatch(batchId, p.processingMethod, cid, { gasLimit: 500000 });
    }

    if (roastedSet.has(i)) {
      cid = await appendAndRepin(
        cid,
        {
          roasting: {
            roastingMethod: ROASTING_METHODS[r.roastingMethod],
            roastLevel: ROAST_LEVELS[r.roastLevel],
            cuppingNotes: r.cuppingNotes,
            roastingDate: r.roastingDate,
            transportTime: r.transportTime,
            beforeWeight: r.beforeWeight,
            afterWeight: r.afterWeight,
            location: { latitude: r.location.latitude / 1e6, longitude: r.location.longitude / 1e6 },
          },
        },
        batchNumber,
        groupId,
      );
      await coffeeTracker
        .connect(roaster)
        .roastBatch(batchId, r.roastingMethod, r.roastLevel, cid, { gasLimit: 500000 });
    }

    if (distributedSet.has(i)) {
      cid = await appendAndRepin(
        cid,
        {
          distribution: {
            distributionDate: d.distributionDate,
            bagCount: d.bagCount,
            distributionWeight: d.distributionWeight,
            destination: d.destination,
            location: { latitude: d.location.latitude / 1e6, longitude: d.location.longitude / 1e6 },
          },
        },
        batchNumber,
        groupId,
      );
      await coffeeTracker.connect(distributor).distributeBatch(batchId, cid, { gasLimit: 500000 });
    }

    if (verifiedSet.has(i)) {
      await coffeeTracker.connect(deployer).verifyBatch(batchId, { gasLimit: 500000 });
    }

    batchId++;
  }

  console.log("Seeding complete.");
};

export default seedCoffeeTracker;
seedCoffeeTracker.tags = ["SeedCoffeeTracker"];
seedCoffeeTracker.dependencies = ["CoffeeTracker"];
