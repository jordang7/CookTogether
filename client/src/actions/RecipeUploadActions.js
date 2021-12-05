const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const RecipeContractAddr = "0xEA7be4F5Bf17B1DF19D33c90c9Cb11d0a2a14c3f";
const MarketContractAddr = "0x55bB709a1D2aB9976616eC1279a6dDB299d727df";
const { ethers } = require("ethers");
const abi = require(".././secrets/abi.json");
const provider = new ethers.providers.Web3Provider(window.ethereum);

export const mintRecipeNFT = async (
  recipeName,
  ingredients,
  photo,
  account
) => {
  try {
    const gateway = await ipfsUpload(recipeName, ingredients, photo);
    const signer = await provider.getSigner(account);
    const nonce = await signer.getTransactionCount();
    const nft = new ethers.Contract(RecipeContractAddr, abi.recipeAbi, signer);
    const market = new ethers.Contract(
      MarketContractAddr,
      abi.marketAbi,
      signer
    );
    const tokenURI = gateway;
    console.log(nonce);
    await nft.createUserRecipe(tokenURI, { nonce: nonce + 1 });
    await market
      .connect(signer)
      .createUserRecipe(
        RecipeContractAddr,
        (await market.getNextId()).toString()
      );
    return true;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const ipfsUpload = async (name, recipe, image) => {
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
      description: `Recipe for ${name}`,
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
