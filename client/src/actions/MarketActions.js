import { CartCheck } from "react-bootstrap-icons";

const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const MarketContractAddr = "0x039f34aaB71530E5F7AfAE2d2be48549AA0eaFC9";
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
    let [recipes, karma] = await market.connect(signer).getMarketItemsByUser();
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

    let recipes = await market.connect(signer).getAllMarketItems(true);

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
    console.log(recipes);
    return recipes;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const getAllRewardFruit = async (account) => {
  try {
    const signer = await provider.getSigner(account);
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );

    let recipes = await market.connect(signer).getRewardItemsByUser();

    recipes = await Promise.all(
      recipes.map(async (i) => {
        const tokenUri = await market.tokenURI(i.tokenId);
        let item = {
          tokenId: i.tokenId.toString(),
          chef: i.chef,
          tokenUri,
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

export const castVote = async (tokenId, support, account) => {
  const signer = await provider.getSigner(account);
  const market = new ethers.Contract(MarketContractAddr, abi.marketAbi, signer);
  try {
    let res = await market.connect(signer).castVote(tokenId, support);
    console.log(res);
    return true;
  } catch (e) {
    console.log(e);
  }
};

export const endCompetition = async (account) => {
  const signer = await provider.getSigner(account);
  const market = new ethers.Contract(MarketContractAddr, abi.marketAbi, signer);
  try {
    let res = await market.connect(signer).awardUsersAndRefreshBlackList();
    return true;
  } catch (e) {
    console.log(e);
  }
};

export const hasRewardAvailable = async (account) => {
  const signer = await provider.getSigner(account);
  const market = new ethers.Contract(MarketContractAddr, abi.marketAbi, signer);
  try {
    let res = await market.connect(signer).hasRewardAvailable();
    return res.toString();
  } catch (e) {
    console.log(e);
    return e;
  }
};
