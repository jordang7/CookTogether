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

    struct UserRecipe {
        uint256 tokenId;
        address payable chef;
        int256 upCount;
        int256 downCount;
        bool active;
        bool previousWinner;
        bool isReward;
    }

    mapping(uint256 => mapping(address => VoteStates)) voteStates;

    event UserRecipeCreated(
        uint256 tokenId,
        address payable chef,
        int256 upCount,
        int256 downCount,
        bool active,
        bool previousWinner,
        bool isReward
    );

    event VoteCast(uint256, address indexed);

    mapping(uint256 => UserRecipe) private idToUserRecipe;
    mapping(address => uint256) private userToUnClaimedRewards;

    function createUserRecipe(string memory _tokenURI) external {
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

        idToUserRecipe[newItemId] = UserRecipe(
            newItemId,
            payable(msg.sender),
            1,
            0,
            true,
            false,
            false
        );

        voteStates[newItemId][msg.sender] = VoteStates.Up;

        emit UserRecipeCreated(
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

    function getAllUserRecipes(bool _active)
        external
        view
        returns (UserRecipe[] memory)
    {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 curr = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            if (
                idToUserRecipe[currentId].active == _active &&
                !idToUserRecipe[currentId].isReward
            ) {
                itemCount++;
            }
        }

        UserRecipe[] memory userRecipes = new UserRecipe[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            if (
                idToUserRecipe[currentId].active == _active &&
                !idToUserRecipe[currentId].isReward
            ) {
                UserRecipe storage currentItem = idToUserRecipe[currentId];
                userRecipes[curr] = currentItem;
                curr++;
            }
        }

        return userRecipes;
    }

    function getRecipesByUser()
        external
        view
        returns (UserRecipe[] memory, int256)
    {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        int256 karma = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToUserRecipe[i + 1].chef == msg.sender) {
                itemCount++;
            }
        }

        UserRecipe[] memory userRecipes = new UserRecipe[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToUserRecipe[i + 1].chef == msg.sender) {
                UserRecipe storage currentItem = idToUserRecipe[i + 1];
                userRecipes[currentIndex] = currentItem;
                karma += (currentItem.upCount - currentItem.downCount);
                currentIndex++;
            }
        }
        return (userRecipes, karma);
    }

    function castVote(uint256 _UserRecipeId, bool _supports) external {
        UserRecipe storage recipe = idToUserRecipe[_UserRecipeId];
        require(recipe.active, "Recipe is no longer active for voting");

        // clear out previous vote
        if (voteStates[_UserRecipeId][msg.sender] == VoteStates.Up) {
            recipe.upCount--;
        }
        if (voteStates[_UserRecipeId][msg.sender] == VoteStates.Down) {
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
        voteStates[_UserRecipeId][msg.sender] = _supports
            ? VoteStates.Up
            : VoteStates.Down;

        emit VoteCast(_UserRecipeId, msg.sender);
    }

    function claimRewardNFT(string memory _tokenURI) external payable {
        require(userToUnClaimedRewards[msg.sender] > 0, "Cannot claim reward");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        idToUserRecipe[newItemId] = UserRecipe(
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

    function getAllRewardNFTs() external view returns (UserRecipe[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 curr = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToUserRecipe[i + 1].isReward) {
                itemCount++;
            }
        }

        UserRecipe[] memory userRecipes = new UserRecipe[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            UserRecipe storage currentItem = idToUserRecipe[currentId];
            if (currentItem.isReward) {
                userRecipes[curr] = currentItem;
                curr++;
            }
        }

        return userRecipes;
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
        UserRecipe memory highest = idToUserRecipe[0];
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            if (idToUserRecipe[currentId].active) {
                int256 currKarma = (idToUserRecipe[currentId].upCount -
                    idToUserRecipe[currentId].downCount);
                int256 highestKarma = (highest.upCount - highest.downCount);
                if (currKarma > highestKarma) {
                    highest = idToUserRecipe[currentId];
                    highestIndex = currentId;
                }
                idToUserRecipe[currentId].active = false;
            }
            curr++;
        }
        idToUserRecipe[highestIndex].previousWinner = true;
        //TODO reward the User with the highest rated recipe with something
        userToUnClaimedRewards[highest.chef]++;

        lastRefresh = block.timestamp;
    }
}
