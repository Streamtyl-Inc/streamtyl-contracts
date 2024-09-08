const {ethers} = require("hardhat");

async function main() {
  // Deploy the JskToken contract
  const JskToken = await ethers.getContractFactory("JskToken");
  const jskToken = await JskToken.deploy("Joystick Token", "JSK");
  await jskToken.waitForDeployment();
  console.log(`JskToken deployed to: ${jskToken.target}`);

  // Deploy the Joystick contract with the JskToken contract address
  const Joystick = await ethers.getContractFactory("Joystick");
  const joystick = await Joystick.deploy(jskToken.target);
  await joystick.waitForDeployment();
  console.log(`Joystick deployed to: ${joystick.target}`);
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
