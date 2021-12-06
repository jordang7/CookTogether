const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const RecipeContractAddr = "0xEA7be4F5Bf17B1DF19D33c90c9Cb11d0a2a14c3f";
const MarketContractAddr = "0x55bB709a1D2aB9976616eC1279a6dDB299d727df";
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

    let [recipes, karma] = await market.connect(signer).getRecipesByUser();
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

    return [recipes, karma];
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

    let recipes = await market.connect(signer).getAllUserRecipes();

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
    return recipes;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const castVote = async (account, recipeId, support) => {
  const signer = await provider.getSigner(account);
  const market = new ethers.Contract(MarketContractAddr, abi.marketAbi, signer);

  await market.connect(signer).castVote(recipeId, support);

  return true;
};
