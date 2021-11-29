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
        Up,
        Down
    }

    constructor() {
        owner = payable(msg.sender);
    }

    struct Recipe {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable chef;
        uint256 upCount;
        uint256 downCount;
    }

    mapping(address => mapping(uint256 => VoteStates)) voteStates;

    event RecipeCreated(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        address payable chef,
        uint256 upCount,
        uint256 downCount
    );
    event VoteCast(uint256, address indexed);

    mapping(uint256 => Recipe) private idToRecipe;

    function createRecipe(address nftContract, uint256 tokenId)
        public
        payable
        nonReentrant
    {
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToRecipe[itemId] = Recipe(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            1,
            0
        );

        voteStates[msg.sender][itemId] = VoteStates.Up;

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit RecipeCreated(
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

    function getAllRecipes() public view returns (Recipe[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 curr = 0;

        Recipe[] memory recipes = new Recipe[](totalItemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            Recipe storage currentItem = idToRecipe[currentId];
            recipes[curr] = currentItem;
            curr++;
        }
        return recipes;
    }

    function getRecipesByChef() public view returns (Recipe[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToRecipe[i + 1].chef == msg.sender) {
                itemCount++;
            }
        }

        Recipe[] memory recipes = new Recipe[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToRecipe[i + 1].chef == msg.sender) {
                Recipe storage currentItem = idToRecipe[i + 1];
                recipes[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return recipes;
    }

    function castVote(uint256 _recipeId, bool _supports) external {
        // require(members[msg.sender]);
        Recipe storage recipe = idToRecipe[_recipeId];

        // clear out previous vote
        if (voteStates[msg.sender][_recipeId] == VoteStates.Up) {
            recipe.upCount--;
        }
        if (voteStates[msg.sender][_recipeId] == VoteStates.Down) {
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
        voteStates[msg.sender][_recipeId] = _supports
            ? VoteStates.Up
            : VoteStates.Down;

        emit VoteCast(_recipeId, msg.sender);
    }
}
