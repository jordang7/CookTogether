// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract RecipeNFTMarket is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    address[] blackListAddresses;

    uint256 lastRefresh;

    address payable owner;
    enum VoteStates {
        Absent,
        Up,
        Down
    }

    constructor() ERC721("Recipe", "RCP") {
        owner = payable(msg.sender);
        lastRefresh = block.timestamp;
    }

    struct MarketItem {
        uint256 tokenId;
        address payable chef;
        int256 upCount;
        int256 downCount;
        bool active;
        bool previousWinner;
        bool isReward;
    }

    mapping(uint256 => mapping(address => VoteStates)) voteStates;

    event MarketItemCreated(
        uint256 tokenId,
        address payable chef,
        int256 upCount,
        int256 downCount,
        bool active,
        bool previousWinner,
        bool isReward
    );

    event VoteCast(uint256, address indexed);

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(address => uint256) private userToUnClaimedRewards;

    function createMarketItem(string memory _tokenURI) external {
        bool allow = true;
        for (uint256 i = 0; i < blackListAddresses.length; i++) {
            if (blackListAddresses[i] == msg.sender) {
                allow = false;
            }
        }
        require(allow, "Already created your NFT for this week!");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        idToMarketItem[newItemId] = MarketItem(
            newItemId,
            payable(msg.sender),
            1,
            0,
            true,
            false,
            false
        );

        voteStates[newItemId][msg.sender] = VoteStates.Up;

        emit MarketItemCreated(
            newItemId,
            payable(msg.sender),
            1,
            0,
            true,
            false,
            false
        );

        blackListAddresses.push(msg.sender);
    }

    // function getNextId() public view returns (uint256) {
    //     return _tokenIds.current() + 1;
    // }

    function getAllMarketItems(bool _active)
        external
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 curr = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            if (
                idToMarketItem[currentId].active == _active &&
                !idToMarketItem[currentId].isReward
            ) {
                itemCount++;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            if (
                idToMarketItem[currentId].active == _active &&
                !idToMarketItem[currentId].isReward
            ) {
                MarketItem storage currentItem = idToMarketItem[currentId];
                marketItems[curr] = currentItem;
                curr++;
            }
        }

        return marketItems;
    }

    function getRecipesByUser()
        external
        view
        returns (MarketItem[] memory, int256)
    {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 curr = 0;
        int256 karma = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                idToMarketItem[i + 1].chef == msg.sender &&
                !idToMarketItem[i + 1].isReward
            ) {
                itemCount++;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                idToMarketItem[i + 1].chef == msg.sender &&
                !idToMarketItem[i + 1].isReward
            ) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                marketItems[curr] = currentItem;
                karma += (currentItem.upCount - currentItem.downCount);
                curr++;
            }
        }
        return (marketItems, karma);
    }

    function castVote(uint256 _MarketItemId, bool _supports) external {
        MarketItem storage recipe = idToMarketItem[_MarketItemId];
        require(recipe.active, "Recipe is no longer active for voting");

        // clear out previous vote
        if (voteStates[_MarketItemId][msg.sender] == VoteStates.Up) {
            recipe.upCount--;
        }
        if (voteStates[_MarketItemId][msg.sender] == VoteStates.Down) {
            recipe.downCount--;
        }

        // add new vote
        if (_supports) {
            recipe.upCount++;
        } else {
            recipe.downCount++;
        }

        // we're tracking whether or not someone has already voted
        // and we're keeping track as well of what they voted
        voteStates[_MarketItemId][msg.sender] = _supports
            ? VoteStates.Up
            : VoteStates.Down;

        emit VoteCast(_MarketItemId, msg.sender);
    }

    function claimRewardNFT(string memory _tokenURI) external payable {
        require(userToUnClaimedRewards[msg.sender] > 0, "Cannot claim reward");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        idToMarketItem[newItemId] = MarketItem(
            newItemId,
            payable(msg.sender),
            0,
            0,
            false,
            false,
            true
        );
        userToUnClaimedRewards[msg.sender]--;
    }

    function getAllRewardNFTs() external view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 curr = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].isReward) {
                itemCount++;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            if (currentItem.isReward) {
                marketItems[curr] = currentItem;
                curr++;
            }
        }

        return marketItems;
    }

    function awardUsersAndRefreshBlackList() external {
        require(
            owner == msg.sender
            //  &&
            //     block.timestamp > (lastRefresh + 1 weeks) &&
            //     block.timestamp < (lastRefresh + 1 weeks)
        );
        uint256 totalItemCount = _tokenIds.current();
        uint256 curr = 0;
        uint256 highestIndex = 0;
        delete blackListAddresses;
        MarketItem memory highest = idToMarketItem[0];
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            if (idToMarketItem[currentId].active) {
                int256 currKarma = (idToMarketItem[currentId].upCount -
                    idToMarketItem[currentId].downCount);
                int256 highestKarma = (highest.upCount - highest.downCount);
                if (currKarma > highestKarma) {
                    highest = idToMarketItem[currentId];
                    highestIndex = currentId;
                }
                idToMarketItem[currentId].active = false;
            }
            curr++;
        }
        idToMarketItem[highestIndex].previousWinner = true;
        //TODO reward the User with the highest rated recipe with something
        userToUnClaimedRewards[highest.chef]++;

        lastRefresh = block.timestamp;
    }
}
