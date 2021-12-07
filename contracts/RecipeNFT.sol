// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RecipeNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddr;
    address owner;

    uint256 lastRefresh;

    address[] blackListAddresses;

    event RecipeCreated(uint256);

    constructor(address _addr) ERC721("Recipe", "RCP") {
        owner = msg.sender;
        lastRefresh = block.timestamp;
        contractAddr = _addr;
    }

    function createUserRecipe(string memory _tokenURI) public {
        bool allow = true;
        for (uint256 i = 0; i < blackListAddresses.length; i++) {
            if (blackListAddresses[i] == msg.sender) {
                allow = false;
            }
        }
        require(allow);

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        setApprovalForAll(contractAddr, true);

        blackListAddresses.push(msg.sender);
    }

    function refreshBlackList() public {
        require(
            owner == msg.sender &&
                block.timestamp > (lastRefresh + 1 weeks) &&
                block.timestamp < (lastRefresh + 1 weeks)
        );
        delete blackListAddresses;
        lastRefresh = block.timestamp;
    }
}
