import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import defaultData from "../data/default-data.json";
import { CoffeeTracker } from "../typechain-types";
import { pinJSON, pinFile, findExistingPin, getOrCreateGroup } from "../utils/pinata";
import { buildFullMetadata } from "../utils/buildMetadata";
import { generateQRBuffer } from "../utils/qrcode";

const DATA = defaultData.slice(0, 50);
const TOTAL = DATA.length;

const PROCESSED_COUNT = Math.floor(TOTAL * 0.8);
const ROASTED_COUNT = Math.floor(TOTAL * 0.7);
const DISTRIBUTED_COUNT = Math.floor(TOTAL * 0.6);
const VERIFIED_COUNT = TOTAL;

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function chooseSubset(pool: number[], num: number, seed: string): number[] {
  return [...pool].sort((a, b) => hashCode(seed + a) - hashCode(seed + b)).slice(0, Math.min(num, pool.length));
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

  const groupId = await getOrCreateGroup("CoffeeTracker-local-batch");
  const qrGroupId = await getOrCreateGroup("CoffeeTracker-local-qr");

  const allIndices = Array.from({ length: TOTAL }, (_, i) => i);
  const processedIndices = chooseSubset(allIndices, PROCESSED_COUNT, "processed");
  const roastedIndices = chooseSubset(processedIndices, ROASTED_COUNT, "roasted");
  const distributedIndices = chooseSubset(roastedIndices, DISTRIBUTED_COUNT, "distributed");
  const verifiedIndices = chooseSubset(allIndices, VERIFIED_COUNT, "verified");

  const processedSet = new Set(processedIndices);
  const roastedSet = new Set(roastedIndices);
  const distributedSet = new Set(distributedIndices);
  const verifiedSet = new Set(verifiedIndices);

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

    const qrBuffer = await generateQRBuffer(data.batchNumber);
    const qrCID = await pinFile(qrBuffer, `qr-${data.batchNumber}.png`, "image/png", qrGroupId);

    const fullMetadata = buildFullMetadata(data, {
      processed: processedSet.has(i),
      roasted: roastedSet.has(i),
      distributed: distributedSet.has(i),
      qrCID,
    });

    const cid = await pinJSON(fullMetadata, `batch-${data.batchNumber}`, data.batchNumber, groupId);

    console.log(`[${i + 1}/${TOTAL}] ${data.batchNumber} - NEW CID (QR: ${qrCID})`);

    batchCIDs.push(cid);
  }

  console.log(`Seeding ${TOTAL} batches on-chain...`);
  let batchId = 1;

  for (let i = 0; i < TOTAL; i++) {
    const data = DATA[i];
    const { batchNumber } = data;
    const p = data.processingData;
    const r = data.roastingData;
    const cid = batchCIDs[i];

    console.log(`[${i + 1}/${TOTAL}] ${batchNumber}`);

    await coffeeTracker
      .connect(farmer)
      .harvestBatch(batchNumber, data.harvestData.region, data.harvestData.variety, cid, { gasLimit: 500000 });

    if (processedSet.has(i)) {
      await coffeeTracker.connect(processor).processBatch(batchId, p.processingMethod, cid, { gasLimit: 500000 });
    }
    if (roastedSet.has(i)) {
      await coffeeTracker
        .connect(roaster)
        .roastBatch(batchId, r.roastingMethod, r.roastLevel, cid, { gasLimit: 500000 });
    }
    if (distributedSet.has(i)) {
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
