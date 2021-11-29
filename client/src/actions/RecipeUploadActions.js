const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");
const RecipeContractAddr = "0xa7db3ECF5b87033A202e25Ee25B7e08f435625eD";
const MarketContractAddr = "0x62e120F8Bce765C63327761c428e1F63170eFaF9";
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

    await nft.createRecipe(tokenURI, {
      nonce: nonce + 1,
    });

    await market
      .connect(signer)
      .createRecipe(RecipeContractAddr, (await market.getNextId()).toString());
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
