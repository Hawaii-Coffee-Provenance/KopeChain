import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import defaultData from "../data/default-data.json";
import { CoffeeTracker } from "../typechain-types";

const TOTAL = defaultData.length;
const PROCESSED_COUNT = Math.floor(TOTAL * 0.8);
const ROASTED_COUNT = Math.floor(TOTAL * 0.7);
const DISTRIBUTED_COUNT = Math.floor(TOTAL * 0.6);
const VERIFIED_COUNT = Math.floor(TOTAL * 0.45);

function pickRandom(pool: number[], num: number): number[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(num, shuffled.length));
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

  const allIndices = Array.from({ length: TOTAL }, (_, i) => i);
  const processedIndices = pickRandom(allIndices, PROCESSED_COUNT);
  const processedSet = new Set(processedIndices);
  const roastedSet = new Set(pickRandom(processedIndices, ROASTED_COUNT));
  const distributedSet = new Set(pickRandom([...roastedSet], DISTRIBUTED_COUNT));
  const verifiedSet = new Set(pickRandom(allIndices, VERIFIED_COUNT));

  console.log("Seeding batches...");

  let batchId = 1;

  for (let i = 0; i < defaultData.length; i++) {
    const data = defaultData[i];
    const h = data.harvestData;
    const p = data.processingData;
    const r = data.roastingData;
    const d = data.distributionData;

    console.log(`  [${String(i + 1).padStart(3, " ")}/${defaultData.length}] ${data.batchNumber} — ${h.farmName}`);

    await coffeeTracker
      .connect(farmer)
      .harvestBatch(
        data.batchNumber,
        h.region,
        h.variety,
        h.elevation,
        h.harvestDate,
        h.harvestWeight,
        h.farmName,
        { latitude: h.location.latitude, longitude: h.location.longitude },
        { gasLimit: 500000 },
      );

    if (processedSet.has(i)) {
      await coffeeTracker
        .connect(processor)
        .processBatch(
          batchId,
          p.processingMethod,
          p.moistureContent,
          p.scaScore,
          p.humidity,
          p.dryTemperature,
          p.processingDate,
          p.beforeWeight,
          p.afterWeight,
          { latitude: p.location.latitude, longitude: p.location.longitude },
          { gasLimit: 500000 },
        );
    }

    if (roastedSet.has(i)) {
      await coffeeTracker
        .connect(roaster)
        .roastBatch(
          batchId,
          r.roastingMethod,
          r.roastLevel,
          r.transportTime,
          r.roastingDate,
          r.beforeWeight,
          r.afterWeight,
          r.cuppingNotes,
          { latitude: r.location.latitude, longitude: r.location.longitude },
          { gasLimit: 500000 },
        );
    }

    if (distributedSet.has(i)) {
      await coffeeTracker
        .connect(distributor)
        .distributeBatch(
          batchId,
          d.distributionDate,
          d.bagCount,
          d.distributionWeight,
          d.destination,
          { latitude: d.location.latitude, longitude: d.location.longitude },
          { gasLimit: 500000 },
        );
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
