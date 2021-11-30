const { assert } = require("chai");
const { ethers } = require("ethers");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("RecipeNFTMarket", function () {
  let nft, market, signer, nftContractAddr, marketAddr;
  beforeEach(async () => {
    const Market = await hre.ethers.getContractFactory("RecipeNFTMarket");
    market = await Market.deploy();
    await market.deployed();
    marketAddr = market.address;
    const NFT = await hre.ethers.getContractFactory("RecipeNFT");
    nft = await NFT.deploy(marketAddr);
    await nft.deployed;
    nftContractAddr = nft.address;
    signer = await hre.ethers.getSigner(0);
    console.log(signer.address);
  });

  it("Should create 2 recipe and be able to retrieve it", async function () {
    await nft.createRecipe("https://www.TEsting.com");
    await nft.createRecipe("https://www.number2.com");
    const price = ethers.utils.parseUnits("1", "gwei");
    await market
      .connect(signer)
      .createRecipe(nftContractAddr, (await market.getNextId()).toString(), {
        value: price,
      });
    await market
      .connect(signer)
      .createRecipe(nftContractAddr, (await market.getNextId()).toString(), {
        value: price,
      });
    items = await market.getAllRecipes();
    items = await Promise.all(
      items.map(async (i) => {
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

    assert(items.length == 2, "There are not two recipes in list");
  });

  describe("Cast Vote testing", function () {
    beforeEach(async () => {
      await nft.createRecipe("https://www.TEsting.com");
      await nft.createRecipe("https://www.number2.com");
      const price = ethers.utils.parseUnits("1", "gwei");
      await market
        .connect(signer)
        .createRecipe(nftContractAddr, (await market.getNextId()).toString(), {
          value: price,
        });
      await market
        .connect(signer)
        .createRecipe(nftContractAddr, (await market.getNextId()).toString(), {
          value: price,
        });
    });
    it("Should change vote to down", async function () {
      await market.castVote(1, false);

      items = await market.getAllRecipes();
      items = await Promise.all(
        items.map(async (i) => {
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

      assert(
        (items[0].downCount == 1) & (items[0].upCount == 0),
        "vote not changed"
      );
    });
    it("Should make sure you cannot vote on same Recipe twice", async function () {
      await market.castVote(2, true);

      items = await market.getAllRecipes();
      items = await Promise.all(
        items.map(async (i) => {
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

      assert(
        (items[1].downCount == 0) & (items[1].upCount == 1),
        "Duplicate up"
      );
    });
  });
});
