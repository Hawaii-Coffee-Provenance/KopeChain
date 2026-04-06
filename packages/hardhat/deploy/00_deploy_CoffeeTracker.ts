import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CoffeeTracker } from "../typechain-types";

const deployCoffeeTracker: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(`Deploying CoffeeTracker with deployer: ${deployer}`);

  const deployment = await deploy("CoffeeTracker", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  });

  const adminWallet = process.env.ADMIN_WALLET;
  if (adminWallet) {
    console.log(`Granting roles to admin wallet: ${adminWallet}`);
    const [signer] = await hre.ethers.getSigners();
    const coffeeTracker = (await hre.ethers.getContractAt(
      "CoffeeTracker",
      deployment.address,
      signer,
    )) as CoffeeTracker;
    const defaultAdminRole = await coffeeTracker.DEFAULT_ADMIN_ROLE();
    await (await coffeeTracker.grantRole(defaultAdminRole, adminWallet, { gasLimit: 500000 })).wait();
  } else {
    console.warn("No ADMIN_WALLET in environment - deployer is the only admin!");
  }
};

export default deployCoffeeTracker;
deployCoffeeTracker.tags = ["CoffeeTracker"];
