async function main() {
  const Market = await hre.ethers.getContractFactory("RecipeNFTMarket");
  market = await Market.deploy();
  await market.deployed();
  console.log("RecipeMarket deployed to:", market.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
