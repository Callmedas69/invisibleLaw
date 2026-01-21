// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "erc721a/ERC721A.sol";
import "erc721a/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import {
    MerkleProof
} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {InvisibleLawRenderer} from "./InvisibleLawRenderer.sol";

/**
 * @title Invisible Law
 * @notice Generative Bauhaus Mosaic x Golden Ratio NFT Collection
 * @dev Fully on-chain SVG generation with weighted rarity
 *
 * Rarity Tiers:
 * - Chaos (2%): Highest density, maximum elements
 * - Turbulence (8%): High density, dynamic generation
 * - Emergence (15%): Enhanced density, elements emerging
 * - Clarity (25%): Clear structured generation
 * - Harmony (50%): Balanced generation
 *
 * Layers:
 * 1. Phi Grid Lines (9x9 at golden ratio positions)
 * 2. Large Circle boundary
 * 3. Mosaic Rectangles (12x12 grid, denser inside circle)
 * 4. Dots at Phi intersections
 * 5. Concentric Circles
 * 6. Extended Lines with endpoints
 *
 * All positions governed by Phi (Golden Ratio)
 * All sizes governed by the Golden Ratio (phi)
 */
contract InvisibleLaw is ERC721A, ERC721AQueryable, ERC2981, Ownable, Pausable {
    using Strings for uint256;

    // =========================================================================
    // CONSTANTS
    // =========================================================================

    uint256 public constant MAX_SUPPLY = 1272;
    uint256 public constant MAX_PER_WALLET = 5;

    // Rarity thresholds (out of 100)
    uint8 private constant CHAOS_THRESHOLD = 2; // 0-1 = 2%
    uint8 private constant TURBULENCE_THRESHOLD = 10; // 2-9 = 8%
    uint8 private constant EMERGENCE_THRESHOLD = 25; // 10-24 = 15%
    uint8 private constant CLARITY_THRESHOLD = 50; // 25-49 = 25%
    // 50-99 = Harmony (50%)

    // =========================================================================
    // ERRORS
    // =========================================================================

    error MintNotActive();
    error InvalidQuantity();
    error ExceedsSupply();
    error ExceedsMaxPerWallet();
    error InsufficientPayment();
    error WithdrawFailed();
    error ZeroAddress();
    error RoyaltyTooHigh();
    error TreasuryNotSet();
    error SeedNotGenerated();

    // =========================================================================
    // EVENTS
    // =========================================================================

    event MintActiveChanged(bool active);
    event MintPriceChanged(uint256 oldPrice, uint256 newPrice);
    event ContractURIUpdated(string uri);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    event AllowlistFreeMintUpdated(uint256 oldValue, uint256 newValue);
    event SeedGenerated(uint256 indexed tokenId, uint256 seed);
    event RendererUpdated(address oldRenderer, address newRenderer);

    // =========================================================================
    // STATE (optimized packing)
    // =========================================================================

    // SLOT 0
    uint256 public mintPrice = 0.00618 ether;
    // SLOT 1
    uint256 public allowlistFreeMint = 1;
    // SLOT 2
    bytes32 public merkleRoot;
    // SLOT 3 (packed: 20 + 1 = 21 bytes)
    address public treasury;
    bool public mintActive;
    // SLOT 4
    InvisibleLawRenderer public renderer;
    // Dynamic/mapping slots
    string private _contractURI;
    /// @dev Stores unpredictable seed per token (generated at mint)
    mapping(uint256 => uint256) private _mintSeed;
    /// @dev Tracks whether an address has claimed their allowlist free mint
    mapping(address => bool) public allowlistClaimed;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor(
        address _treasury,
        address _renderer
    ) ERC721A("Invisible Law", "PHI") Ownable(msg.sender) {
        if (_treasury == address(0)) revert ZeroAddress();
        if (_renderer == address(0)) revert ZeroAddress();
        treasury = _treasury;
        renderer = InvisibleLawRenderer(_renderer);
        _setDefaultRoyalty(_treasury, 618); // 6.18% royalty
    }

    // =========================================================================
    // MINTING
    // =========================================================================

    function mint(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable whenNotPaused {
        if (!mintActive) revert MintNotActive();
        if (quantity == 0) revert InvalidQuantity();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        if (_numberMinted(msg.sender) + quantity > MAX_PER_WALLET)
            revert ExceedsMaxPerWallet();

        uint256 price = _calculatePrice(quantity, merkleProof);
        if (msg.value < price) revert InsufficientPayment();

        _mint(msg.sender, quantity);

        if (msg.value > price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
            if (!refunded) revert WithdrawFailed();
        }
    }

    function _calculatePrice(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) internal returns (uint256) {
        if (merkleRoot == bytes32(0)) {
            return mintPrice * quantity;
        }

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        bool validProof = MerkleProof.verify(merkleProof, merkleRoot, leaf);

        if (!validProof || allowlistClaimed[msg.sender]) {
            return mintPrice * quantity;
        }

        allowlistClaimed[msg.sender] = true;

        if (allowlistFreeMint == 0) {
            return mintPrice * quantity;
        }

        if (allowlistFreeMint >= quantity) {
            return 0;
        }

        return mintPrice * (quantity - allowlistFreeMint);
    }

    function hasClaimedAllowlist(address account) external view returns (bool) {
        return allowlistClaimed[account];
    }

    function ownerMint(uint256 quantity) external onlyOwner {
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        _mint(msg.sender, quantity);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    // =========================================================================
    // ADMIN
    // =========================================================================

    function setMintActive(bool active) external onlyOwner {
        mintActive = active;
        emit MintActiveChanged(active);
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        emit MintPriceChanged(mintPrice, _price);
        mintPrice = _price;
    }

    function setContractURI(string calldata uri) external onlyOwner {
        _contractURI = uri;
        emit ContractURIUpdated(uri);
    }

    function setRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        if (receiver == address(0)) revert ZeroAddress();
        if (feeNumerator > 1000) revert RoyaltyTooHigh();
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        emit MerkleRootUpdated(merkleRoot, _merkleRoot);
        merkleRoot = _merkleRoot;
    }

    function setAllowlistFreeMint(uint256 _amount) external onlyOwner {
        if (_amount > MAX_PER_WALLET) revert ExceedsMaxPerWallet();
        emit AllowlistFreeMintUpdated(allowlistFreeMint, _amount);
        allowlistFreeMint = _amount;
    }

    function setRenderer(address _renderer) external onlyOwner {
        if (_renderer == address(0)) revert ZeroAddress();
        emit RendererUpdated(address(renderer), _renderer);
        renderer = InvisibleLawRenderer(_renderer);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        if (treasury == address(0)) revert TreasuryNotSet();
        (bool success, ) = treasury.call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    // =========================================================================
    // METADATA
    // =========================================================================

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A, IERC721A) returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        (InvisibleLawRenderer.Rarity rarity, uint256 seed) = _getRarity(
            tokenId
        );
        string memory rarityName = _getRarityName(rarity);

        string memory staticSvg = renderer.generateStaticSVG(rarity, seed);
        string memory animatedSvg = renderer.generateSVG(rarity, seed);

        string memory json = string(
            abi.encodePacked(
                '{"name": "Invisible Law #',
                tokenId.toString(),
                '", "description": "The Golden Ratio made visible. Generative Bauhaus Mosaic governed by Phi.", ',
                '"attributes": [{"trait_type": "Rarity", "value": "',
                rarityName,
                '"}], ',
                '"image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(staticSvg)),
                '", "animation_url": "data:text/html;base64,',
                Base64.encode(bytes(renderer.wrapInHTML(animatedSvg))),
                '"}'
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    function getTokenRarity(
        uint256 tokenId
    ) external view returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        (InvisibleLawRenderer.Rarity rarity, ) = _getRarity(tokenId);
        return _getRarityName(rarity);
    }

    function _getRarity(
        uint256 tokenId
    ) internal view returns (InvisibleLawRenderer.Rarity, uint256) {
        uint256 seed = _mintSeed[tokenId];
        if (seed == 0) revert SeedNotGenerated();

        uint256 rand = seed % 100;

        InvisibleLawRenderer.Rarity rarity;
        if (rand < CHAOS_THRESHOLD) {
            rarity = InvisibleLawRenderer.Rarity.Chaos;
        } else if (rand < TURBULENCE_THRESHOLD) {
            rarity = InvisibleLawRenderer.Rarity.Turbulence;
        } else if (rand < EMERGENCE_THRESHOLD) {
            rarity = InvisibleLawRenderer.Rarity.Emergence;
        } else if (rand < CLARITY_THRESHOLD) {
            rarity = InvisibleLawRenderer.Rarity.Clarity;
        } else {
            rarity = InvisibleLawRenderer.Rarity.Harmony;
        }

        return (rarity, seed);
    }

    function _getRarityName(
        InvisibleLawRenderer.Rarity rarity
    ) internal pure returns (string memory) {
        if (rarity == InvisibleLawRenderer.Rarity.Chaos) return "Chaos";
        if (rarity == InvisibleLawRenderer.Rarity.Turbulence)
            return "Turbulence";
        if (rarity == InvisibleLawRenderer.Rarity.Emergence) return "Emergence";
        if (rarity == InvisibleLawRenderer.Rarity.Clarity) return "Clarity";
        return "Harmony";
    }

    // =========================================================================
    // SVG GENERATION - PUBLIC WRAPPERS
    // =========================================================================

    /// @notice Generate animated SVG for a token (public wrapper)
    function generateSVG(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        (InvisibleLawRenderer.Rarity rarity, uint256 seed) = _getRarity(
            tokenId
        );
        return renderer.generateSVG(rarity, seed);
    }

    /// @notice Generate static SVG without animations (for image metadata)
    function generateStaticSVG(
        uint256 tokenId
    ) public view returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        (InvisibleLawRenderer.Rarity rarity, uint256 seed) = _getRarity(
            tokenId
        );
        return renderer.generateStaticSVG(rarity, seed);
    }

    // =========================================================================
    // OVERRIDES
    // =========================================================================

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @dev Generate and store unpredictable seed at mint time
    function _afterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal override {
        if (from == address(0)) {
            for (uint256 i = 0; i < quantity; i++) {
                uint256 tokenId = startTokenId + i;

                // Generate unpredictable seed using multiple entropy sources
                uint256 seed = uint256(
                    keccak256(
                        abi.encodePacked(
                            blockhash(block.number - 1), // Previous block hash (unpredictable)
                            block.timestamp, // Current timestamp
                            block.prevrandao, // Beacon chain randomness (post-merge)
                            msg.sender, // Minter address
                            tokenId // Token ID
                        )
                    )
                );
                _mintSeed[tokenId] = seed;
                emit SeedGenerated(tokenId, seed);
            }
        }

        super._afterTokenTransfers(from, to, startTokenId, quantity);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721A, IERC721A, ERC2981) returns (bool) {
        return
            ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }
}
