const { assert } = require("chai");
const { ethers } = require("ethers");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("RecipeNFTMarket", function () {
  let nft, market, nftContractAddr, marketAddr;
  beforeEach(async () => {
    const Market = await hre.ethers.getContractFactory("RecipeNFTMarket");
    market = await Market.deploy();
    await market.deployed();
    marketAddr = market.address;
    const NFT = await hre.ethers.getContractFactory("RecipeNFT");
    nft = await NFT.deploy(marketAddr);
    await nft.deployed;
    nftContractAddr = nft.address;
    signer0 = await hre.ethers.getSigner(1);
    signer1 = await hre.ethers.getSigner(2);
  });

  it("Should create 2 recipes from different accounts and be able to retrieve them", async function () {
    await nft.connect(signer0).createUserRecipe("https://www.TEsting.com");
    await nft.connect(signer1).createUserRecipe("https://www.number2.com");
    const price = ethers.utils.parseUnits("1", "gwei");
    await market
      .connect(signer0)
      .createUserRecipe(
        nftContractAddr,
        (await market.getNextId()).toString(),
        {
          value: price,
        }
      );
    await market
      .connect(signer1)
      .createUserRecipe(
        nftContractAddr,
        (await market.getNextId()).toString(),
        {
          value: price,
        }
      );
    items = await market.getAllUserRecipes();
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

  describe("Karma System testing", function () {
    beforeEach(async () => {
      await nft.connect(signer0).createUserRecipe("https://www.TEsting.com");
      await nft.connect(signer1).createUserRecipe("https://www.number2.com");
      const price = ethers.utils.parseUnits("1", "gwei");
      await market
        .connect(signer0)
        .createUserRecipe(
          nftContractAddr,
          (await market.getNextId()).toString(),
          {
            value: price,
          }
        );
      await market
        .connect(signer1)
        .createUserRecipe(
          nftContractAddr,
          (await market.getNextId()).toString(),
          {
            value: price,
          }
        );
    });
    it("Should change vote to down", async function () {
      await market.connect(signer0).castVote(1, false);

      items = await market.getAllUserRecipes();
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
    it("Should make sure you cannot vote on same UserRecipe twice", async function () {
      let tokenId = 2;
      await market.connect(signer1).castVote(tokenId, true);

      items = await market.getAllUserRecipes();
      let specificRecipe;
      items = await Promise.all(
        items.map(async (i) => {
          const tokenUri = await nft.tokenURI(i.tokenId);
          if (i.tokenId.toString() == tokenId) {
            specificRecipe = {
              tokenId: i.tokenId.toString(),
              chef: i.chef,
              tokenUri,
              upCount: i.upCount.toString(),
              downCount: i.downCount.toString(),
            };
          }
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
        (specificRecipe.downCount == 0) & (specificRecipe.upCount == 1),
        "Duplicate up"
      );
    });
    it("Should be able to vote down on a nft you are not owner of", async function () {
      let tokenId = 1;

      await market.connect(signer1).castVote(tokenId, false);
      [items, karma] = await market.connect(signer0).getRecipesByUser();
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
        (items[0].downCount == 1) &
          (items[0].upCount == 1 && karma.toString() == 0),
        "NFT doesn't have 1 up and 1 down"
      );
    });

    it("Make sure total karma is returning correctly after NFT creation", async function () {
      [items, totalKarma] = await market.connect(signer0).getRecipesByUser();

      [items1, totalKarma1] = await market.connect(signer1).getRecipesByUser();

      assert(
        totalKarma.toString() == 1 && totalKarma1.toString() == 1,
        "karma for users not correct"
      );
    });

    it("Make sure total karma is returning correctly after voting", async function () {
      await market.connect(signer0).castVote(2, false); // downvotes signer1s recipe to 0
      await market.connect(signer1).castVote(1, true); // upvotes signer0s recipe to 2

      [items0, totalKarma0] = await market.connect(signer0).getRecipesByUser();

      [items1, totalKarma1] = await market.connect(signer1).getRecipesByUser();
      items0 = await Promise.all(
        items0.map(async (i) => {
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
        totalKarma0.toString() == 2 && totalKarma1.toString() == 0,
        "karma for users not correct"
      );
    });
  });
});
