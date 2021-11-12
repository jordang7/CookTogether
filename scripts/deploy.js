async function main() {
  const RecipeNFT = await hre.ethers.getContractFactory("RecipeNFT");
  const nft = await RecipeNFT.deploy();

  await nft.deployed();

  console.log("RecipeNFT deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
