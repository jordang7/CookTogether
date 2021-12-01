// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RecipeNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddr;
    address[] private certifiedChefs;

    event RecipeCreated(uint256);

    constructor(address _addr) ERC721("Recipe", "RCP") {
        contractAddr = _addr;
        certifiedChefs.push(0x6F234Fa20558743970ccEBD6AF259fCB49eeA73c);
    }

    function createUserRecipe(string memory _tokenURI) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        setApprovalForAll(contractAddr, true);
    }
}
