// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RecipeNFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    enum VoteStates {
        Absent,
        Up,
        Down
    }

    constructor() {
        owner = payable(msg.sender);
    }

    struct UserRecipe {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable chef;
        int256 upCount;
        int256 downCount;
    }

    mapping(uint256 => mapping(address => VoteStates)) voteStates;

    event UserRecipeCreated(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        address payable chef,
        int256 upCount,
        int256 downCount
    );
    event VoteCast(uint256, address indexed);

    mapping(uint256 => UserRecipe) private idToUserRecipe;

    function createUserRecipe(address nftContract, uint256 tokenId)
        public
        payable
        nonReentrant
    {
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToUserRecipe[itemId] = UserRecipe(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            1,
            0
        );

        voteStates[itemId][msg.sender] = VoteStates.Up;

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit UserRecipeCreated(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            1,
            0
        );
    }

    function getNextId() public view returns (uint256) {
        return _itemIds.current() + 1;
    }

    function getAllUserRecipes() public view returns (UserRecipe[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 curr = 0;

        UserRecipe[] memory userRecipes = new UserRecipe[](totalItemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            UserRecipe storage currentItem = idToUserRecipe[currentId];
            userRecipes[curr] = currentItem;
            curr++;
        }
        return userRecipes;
    }

    function getRecipesByUser()
        public
        view
        returns (
            UserRecipe[] memory,
            bool[] memory,
            int256
        )
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        int256 karma = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToUserRecipe[i + 1].chef == msg.sender) {
                itemCount++;
            }
        }

        UserRecipe[] memory userRecipes = new UserRecipe[](itemCount);
        bool[] memory votes = new bool[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToUserRecipe[i + 1].chef == msg.sender) {
                UserRecipe storage currentItem = idToUserRecipe[i + 1];
                userRecipes[currentIndex] = currentItem;
                votes[currentIndex] =
                    voteStates[i + 1][msg.sender] == VoteStates.Up;
                karma += (currentItem.upCount - currentItem.downCount);
                currentIndex++;
            }
        }
        return (userRecipes, votes, karma);
    }

    function castVote(uint256 _UserRecipeId, bool _supports) external {
        UserRecipe storage recipe = idToUserRecipe[_UserRecipeId];

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
}
