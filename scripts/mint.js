import ipfsUpload from "../ipfs/upload.js";

const existingContractAddr = "0xF9582B7D00E5c8896ddf9D73565993DCf9EC934D";

export default async function main(name, recipe, image, cookAddr) {
  const gateway = await ipfsUpload(name, recipe, image);
  const nft = await hre.ethers.getContractAt("RecipeNFT", existingContractAddr);

  const signer0 = await ethers.provider.getSigner(0);
  const nonce = await signer0.getTransactionCount();

  const tokenURI = gateway;
  await nft.awardItem(cookAddr, tokenURI, {
    nonce: nonce + i,
  });

  console.log("Minting is complete!");
}

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
