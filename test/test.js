const { assert, expect } = require("chai");
const { ethers } = require("ethers");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
describe("RecipeNFTMarket", function () {
  let nft, market, nftContractAddr, marketAddr;
  beforeEach(async () => {
    signer0 = await hre.ethers.getSigner(1);
    signer1 = await hre.ethers.getSigner(2);
    const Market = await hre.ethers.getContractFactory("RecipeNFTMarket");
    market = await Market.connect(signer0).deploy();
    await market.deployed();
    marketAddr = market.address;
    const NFT = await hre.ethers.getContractFactory("RecipeNFT");
    nft = await NFT.deploy(marketAddr);
    await nft.deployed;
    nftContractAddr = nft.address;
  });

  it("Should mint an nft", async function () {
    await market.connect(signer0).createMarketItem("https://www.TEsting.com");
    items = await market.getAllMarketItems(true);
    items = await Promise.all(
      items.map(async (i) => {
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
    assert(items.length == 1, "There is no recipe in list");
  });

  it("Should only let you mint one nft for the week", async function () {
    await market.connect(signer0).createMarketItem("https://www.TEsting.com");
    await expect(
      market.connect(signer0).createMarketItem("https://www.shouldntWork.com")
    ).to.be.reverted;
  });

  it("Should let you refresh black list and create a new recipe if you are owner of contract", async function () {
    await market.connect(signer0).createMarketItem("https://www.TEsting.com");

    await market.connect(signer0).awardUsersAndRefreshBlackList();

    await market.connect(signer0).createMarketItem("https://www.newTest.com");
    activeRecipes = await market.getAllMarketItems(true);
    activeRecipes = await Promise.all(
      activeRecipes.map(async (i) => {
        const tokenUri = await market.tokenURI(i.tokenId);
        let item = {
          tokenId: i.tokenId.toString(),
          chef: i.chef,
          tokenUri,
          upCount: i.upCount.toString(),
          downCount: i.downCount.toString(),
          active: i.active,
        };
        return item;
      })
    );

    assert(activeRecipes.length == 1 && activeRecipes[0].active == true);
  });

  describe("Award recipes testing", async function () {
    beforeEach(async () => {
      await market.connect(signer0).createMarketItem("https://www.TEsting.com");
      await market
        .connect(signer1)
        .createMarketItem("https://www.ShouldBeTheWinner.com");
      await market.connect(signer0).castVote(2, true);

      await market.connect(signer0).awardUsersAndRefreshBlackList();
    });

    it("Should allow the user with the recipe w the highest karma to claim a reward NFT", async function () {
      await market.connect(signer1).claimRewardNFT("foodreward.com");
      items = await market.getAllRewardNFTs();
      items = await Promise.all(
        items.map(async (i) => {
          const tokenUri = await market.tokenURI(i.tokenId);
          let item = {
            tokenId: i.tokenId.toString(),
            chef: i.chef,
            tokenUri,
          };
          return item;
        })
      );

      assert(items.length == 1 && items[0].tokenUri == "foodreward.com");
    });
    it("Shouldn't allow a user to claim the reward twice", async function () {
      await market.connect(signer1).claimRewardNFT("foodreward.com");

      await expect(market.connect(signer1).claimRewardNFT("foodreward.com")).to
        .be.reverted;
    });
    it("Should still return correct recipe list", async function () {
      await market.connect(signer1).claimRewardNFT("foodreward.com");

      deactivatedRecipes = await market.getAllMarketItems(false);
      deactivatedRecipes = await Promise.all(
        deactivatedRecipes.map(async (i) => {
          const tokenUri = await market.tokenURI(i.tokenId);
          let item = {
            tokenId: i.tokenId.toString(),
            chef: i.chef,
            tokenUri,
            upCount: i.upCount.toString(),
            downCount: i.downCount.toString(),
            active: i.active,
            isReward: i.isReward,
          };
          return item;
        })
      );
      activeRecipes = await market.getAllMarketItems(true);
      activeRecipes = await Promise.all(
        activeRecipes.map(async (i) => {
          const tokenUri = await market.tokenURI(i.tokenId);
          let item = {
            tokenId: i.tokenId.toString(),
            chef: i.chef,
            tokenUri,
            upCount: i.upCount.toString(),
            downCount: i.downCount.toString(),
            active: i.active,
            isReward: i.isReward,
          };
          return item;
        })
      );
      assert(deactivatedRecipes.length == 2 && !activeRecipes.length);
    });
  });

  describe("Karma System", function () {
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
      await market.connect(signer0).createMarketItem("https://www.TEsting.com");
      await market
        .connect(signer1)
        .createMarketItem("https://www.secondtest.com");
    });
    it("Should change Signer0 vote on own Recipe to down", async function () {
      await market.connect(signer0).castVote(1, false);

      items = await market.getAllMarketItems(true);
      items = await Promise.all(
        items.map(async (i) => {
          const tokenUri = await market.tokenURI(i.tokenId);
          let item = {
            tokenId: i.tokenId.toString(),
            chef: i.chef,
            tokenUri,
            upCount: i.upCount.toString(),
            downCount: i.downCount.toString(),
            active: i.active,
          };
          return item;
        })
      );
      assert(
        (items[0].downCount == 1) & (items[0].upCount == 0),
        "vote not changed"
      );
    });

    it("Should not let signer 1 Upvote on his own Recipe twice ", async function () {
      await market.connect(signer1).castVote(2, true);

      items = await market.getAllMarketItems(true);
      items = await Promise.all(
        items.map(async (i) => {
          const tokenUri = await market.tokenURI(i.tokenId);
          let item = {
            tokenId: i.tokenId.toString(),
            chef: i.chef,
            tokenUri,
            upCount: i.upCount.toString(),
            downCount: i.downCount.toString(),
            active: i.active,
          };
          return item;
        })
      );

      assert(
        (items[1].downCount == 0) & (items[1].upCount == 1),
        "vote changed"
      );
    });
    it("Should let Signer1 Upvote on Signer0s Recipe ", async function () {
      await market.connect(signer1).castVote(1, true);

      items = await market.getAllMarketItems(true);
      items = await Promise.all(
        items.map(async (i) => {
          const tokenUri = await market.tokenURI(i.tokenId);
          let item = {
            tokenId: i.tokenId.toString(),
            chef: i.chef,
            tokenUri,
            upCount: i.upCount.toString(),
            downCount: i.downCount.toString(),
            active: i.active,
          };
          return item;
        })
      );

      assert(
        (items[0].downCount == 0) & (items[0].upCount == 2),
        "count not correct"
      );
    });
  });
});
