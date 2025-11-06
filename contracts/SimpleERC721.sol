// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleERC721 is ERC721, ERC721Burnable, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public maxSupply;
    uint256 public mintPrice;
    string public baseURI;

    event Minted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        baseURI = baseURI_;
        _tokenIdCounter = 0;
    }

    function mint(address to) public payable returns (uint256) {
        require(_tokenIdCounter < maxSupply, "Max supply reached");
        if (mintPrice > 0) {
            require(msg.value >= mintPrice, "Insufficient payment");
        }
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(to, tokenId);
        
        emit Minted(to, tokenId);
        return tokenId;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
