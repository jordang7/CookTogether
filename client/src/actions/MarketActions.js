const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const RecipeContractAddr = "0xa7db3ECF5b87033A202e25Ee25B7e08f435625eD";
const MarketContractAddr = "0x62e120F8Bce765C63327761c428e1F63170eFaF9";
const { ethers } = require("ethers");
const abi = require(".././secrets/abi.json");
const provider = new ethers.providers.Web3Provider(window.ethereum);

export const getRecipesByChef = async (account) => {
  try {
    const signer = await provider.getSigner(account);
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );
    const nft = new ethers.Contract(RecipeContractAddr, abi.recipeAbi, signer);

    let recipes = await market.connect(signer).getRecipesByChef();

    recipes = await Promise.all(
      recipes.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          tokenId: i.tokenId.toString(),
          chef: i.chef,
          tokenUri,
          upCount: i.upCount.toString(),
          downCount: i.downCount.toString(),
        };
        return item;
      })
    );
    console.log(recipes);
    return recipes;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const getAllRecipes = async (account) => {
  try {
    const signer = await provider.getSigner(account);
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );
    const nft = new ethers.Contract(RecipeContractAddr, abi.recipeAbi, signer);

    let recipes = await market.connect(signer).getRecipesByChef();

    recipes = await Promise.all(
      recipes.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          tokenId: i.tokenId.toString(),
          chef: i.chef,
          tokenUri,
          upCount: i.upCount.toString(),
          downCount: i.downCount.toString(),
        };
        return item;
      })
    );
    console.log(recipes);
    return recipes;
  } catch (e) {
    console.log(e);
    return e;
  }
};
