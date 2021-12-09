import { FruitChoices } from "../fruitPhotos/fruitChoices";

const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const MarketContractAddr = "0x039f34aaB71530E5F7AfAE2d2be48549AA0eaFC9";
const { ethers } = require("ethers");
const abi = require(".././secrets/abi.json");
const provider = new ethers.providers.Web3Provider(window.ethereum);

export const mintRecipeNFT = async (
  recipeName,
  ingredients,
  description,
  photo,
  account
) => {
  try {
    const gateway = await ipfsUpload(
      recipeName,
      ingredients,
      description,
      photo
    );
    const signer = await provider.getSigner(account);
    const nonce = await signer.getTransactionCount();
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );
    const tokenURI = gateway;

    await market.createMarketItem(tokenURI, { nonce: nonce + 1 });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const randomizedFruitPicking = async () => {
  const i = Math.floor(Math.random() * 5);
  return [FruitChoices[i][0], FruitChoices[i][1]];
};

export const claimRewardNFT = async (account) => {
  try {
    const [fruitName, photo] = await randomizedFruitPicking();
    console.log(photo);
    const gateway = await ipfsUpload(fruitName, [], photo);
    const signer = await provider.getSigner(account);
    const nonce = await signer.getTransactionCount();
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );
    const tokenURI = gateway;

    await market.claimRewardNFT(tokenURI, { nonce: nonce + 1 });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const ipfsUpload = async (name, recipe, description, image) => {
  let imagePath = await ipfsImageUpload(image);
  console.log(recipe);
  const files = {
    path: "/",
    content: JSON.stringify({
      name: name,
      attributes: recipe.map((ingredient) => {
        return {
          trait_type: ingredient.name,
          value: ingredient.quantity,
        };
      }),

      image: imagePath,
      description: description,
    }),
  };
  console.log(files);
  const result = await ipfs.add(files);
  return result.path;
};

export const ipfsImageUpload = async (photo) => {
  const result = await ipfs.add(photo);
  let imagePath = `https://gateway.ipfs.io/ipfs/${result.path}`;
  return imagePath;
};
