const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const MarketContractAddr = "0x55911bD688118bE1e027c69f18c672b3aa66F129";
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
    let [recipes, votes, karma] = await market
      .connect(signer)
      .getRecipesByUser();
    recipes = await Promise.all(
      recipes.map(async (i) => {
        const tokenUri = await market.tokenURI(i.tokenId);
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

    return [recipes, karma];
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const getAllActiveRecipes = async (account) => {
  try {
    const signer = await provider.getSigner(account);
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );
    const nft = new ethers.Contract(RecipeContractAddr, abi.recipeAbi, signer);

    let recipes = await market.connect(signer).getAllUserRecipes(true);

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
