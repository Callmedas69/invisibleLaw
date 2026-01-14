// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "erc721a/ERC721A.sol";
import "erc721a/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Invisible Law
 * @notice Generative Bauhaus Mosaic × Golden Ratio NFT Collection
 * @dev Fully on-chain SVG generation with weighted rarity
 *
 * Rarity Tiers:
 * - Legendary (2%): Spiral, Unity, Zero
 * - Rare (8%): Sequence, Infinite, Ratio
 * - Uncommon (20%): Enhanced density and elements
 * - Standard (70%): Standard generation
 *
 * Layers:
 * 1. Φ Grid Lines (9×9 at golden ratio positions)
 * 2. Large Circle boundary
 * 3. Mosaic Rectangles (12×12 grid, denser inside circle)
 * 4. Dots at Φ intersections
 * 5. Concentric Circles
 * 6. Extended Lines with endpoints
 *
 * All positions governed by Φ (Golden Ratio)
 * All sizes from Fibonacci sequence
 */
contract InvisibleLaw is ERC721A, ERC721AQueryable, ERC2981, Ownable, Pausable {
    using Strings for uint256;

    // =========================================================================
    // CONSTANTS
    // =========================================================================

    uint256 public constant MAX_SUPPLY = 618;
    uint256 public constant MAX_PER_WALLET = 5;
    uint256 public constant MAX_PER_TX = 5;
    uint256 public constant OWNER_RESERVE = 50;

    // Canvas
    uint256 private constant CANVAS = 1000;
    uint256 private constant INNER_START = 75;
    uint256 private constant INNER_SIZE = 850;

    // Rarity thresholds (out of 100)
    uint8 private constant LEGENDARY_THRESHOLD = 2; // 0-1 = 2%
    uint8 private constant RARE_THRESHOLD = 10; // 2-9 = 8%
    uint8 private constant UNCOMMON_THRESHOLD = 30; // 10-29 = 20%
    // 30-99 = Standard (70%)

    // Rarity enum
    enum Rarity {
        Standard,
        Uncommon,
        Rare,
        Legendary
    }

    // Legendary subtypes
    enum LegendaryType {
        Spiral,
        Unity,
        Zero
    }

    // Rare subtypes
    enum RareType {
        Sequence,
        Infinite,
        Ratio
    }

    // =========================================================================
    // ERRORS
    // =========================================================================

    error MintNotActive();
    error InvalidQuantity();
    error ExceedsSupply();
    error ExceedsMaxPerTx();
    error ExceedsMaxPerWallet();
    error InsufficientPayment();
    error OwnerReserveAlreadyMinted();
    error WithdrawFailed();
    error ZeroAddress();
    error RoyaltyTooHigh();
    error TreasuryNotSet();

    // =========================================================================
    // EVENTS
    // =========================================================================

    event MintActiveChanged(bool active);
    event MintPriceChanged(uint256 oldPrice, uint256 newPrice);
    event ContractURIUpdated(string uri);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // =========================================================================
    // STATE
    // =========================================================================

    uint256 public mintPrice = 0.00786 ether;
    bool public mintActive;
    bool public ownerReserveMinted;
    string private _contractURI;
    address public treasury;

    /// @dev Stores unpredictable seed per token (generated at mint)
    mapping(uint256 => uint256) private _mintSeed;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor() ERC721A("Invisible Law", "PHI") Ownable(msg.sender) {
        _setDefaultRoyalty(msg.sender, 618); // 6.18%
    }

    // =========================================================================
    // MINTING
    // =========================================================================

    function mint(uint256 quantity) external payable whenNotPaused {
        if (!mintActive) revert MintNotActive();
        if (quantity == 0) revert InvalidQuantity();
        if (quantity > MAX_PER_TX) revert ExceedsMaxPerTx();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        if (_numberMinted(msg.sender) + quantity > MAX_PER_WALLET)
            revert ExceedsMaxPerWallet();
        if (msg.value < mintPrice * quantity) revert InsufficientPayment();

        _mint(msg.sender, quantity);
    }

    function mintOwnerReserve(address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (ownerReserveMinted) revert OwnerReserveAlreadyMinted();
        if (_totalMinted() + OWNER_RESERVE > MAX_SUPPLY) revert ExceedsSupply();

        ownerReserveMinted = true;
        _mint(to, OWNER_RESERVE);
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        _mint(to, quantity);
    }

    // =========================================================================
    // ADMIN
    // =========================================================================

    function setMintActive(bool active) external onlyOwner {
        mintActive = active;
        emit MintActiveChanged(active);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceChanged(oldPrice, newPrice);
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

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        if (treasury == address(0)) revert TreasuryNotSet();
        (bool success, ) = payable(treasury).call{value: address(this).balance}(
            ""
        );
        if (!success) revert WithdrawFailed();
    }

    // =========================================================================
    // VIEW FUNCTIONS
    // =========================================================================

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    function numberMinted(address owner_) external view returns (uint256) {
        return _numberMinted(owner_);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    /// @notice Get the stored seed for a token (for transparency)
    function getTokenSeed(uint256 tokenId) external view returns (uint256) {
        return _mintSeed[tokenId];
    }

    /// @notice Get rarity tier for a token
    function getTokenRarity(
        uint256 tokenId
    ) external view returns (string memory) {
        (Rarity rarity, , ) = _getRarity(tokenId);

        if (rarity == Rarity.Legendary) return "Legendary";
        if (rarity == Rarity.Rare) return "Rare";
        if (rarity == Rarity.Uncommon) return "Uncommon";
        return "Standard";
    }

    /// @notice Get detailed traits for a token
    function getTokenTraits(
        uint256 tokenId
    )
        external
        view
        returns (string memory rarity, string memory subtype, uint256 seed)
    {
        (Rarity r, uint256 subType, uint256 s) = _getRarity(tokenId);
        seed = s;

        if (r == Rarity.Legendary) {
            rarity = "Legendary";
            if (LegendaryType(subType) == LegendaryType.Spiral)
                subtype = "Spiral";
            else if (LegendaryType(subType) == LegendaryType.Unity)
                subtype = "Unity";
            else subtype = "Zero";
        } else if (r == Rarity.Rare) {
            rarity = "Rare";
            if (RareType(subType) == RareType.Sequence) subtype = "Sequence";
            else if (RareType(subType) == RareType.Infinite)
                subtype = "Infinite";
            else subtype = "Ratio";
        } else if (r == Rarity.Uncommon) {
            rarity = "Uncommon";
            subtype = "Enhanced";
        } else {
            rarity = "Standard";
            subtype = "Standard";
        }
    }

    // =========================================================================
    // RARITY SYSTEM
    // =========================================================================

    function _getRarity(
        uint256 tokenId
    ) internal view returns (Rarity, uint256 subType, uint256 seed) {
        seed = _mintSeed[tokenId];

        // Fallback for unminted tokens (prevents revert, but won't be accurate)
        if (seed == 0) {
            seed = uint256(
                keccak256(abi.encodePacked(tokenId, "INVISIBLE_LAW_FALLBACK"))
            );
        }

        uint256 rarityRoll = seed % 100;

        if (rarityRoll < LEGENDARY_THRESHOLD) {
            subType = (seed >> 8) % 3;
            return (Rarity.Legendary, subType, seed);
        } else if (rarityRoll < RARE_THRESHOLD) {
            subType = (seed >> 8) % 3;
            return (Rarity.Rare, subType, seed);
        } else if (rarityRoll < UNCOMMON_THRESHOLD) {
            return (Rarity.Uncommon, 0, seed);
        } else {
            return (Rarity.Standard, 0, seed);
        }
    }

    // =========================================================================
    // TOKEN URI
    // =========================================================================

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A, IERC721A) returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        (Rarity rarity, uint256 subType, ) = _getRarity(tokenId);
        string memory image = _genStaticSVG(tokenId);
        string memory animation = _generateSVG(tokenId);

        string memory rarityStr;
        string memory subtypeStr;

        if (rarity == Rarity.Legendary) {
            rarityStr = "Legendary";
            if (LegendaryType(subType) == LegendaryType.Spiral)
                subtypeStr = "Spiral";
            else if (LegendaryType(subType) == LegendaryType.Unity)
                subtypeStr = "Unity";
            else subtypeStr = "Zero";
        } else if (rarity == Rarity.Rare) {
            rarityStr = "Rare";
            if (RareType(subType) == RareType.Sequence) subtypeStr = "Sequence";
            else if (RareType(subType) == RareType.Infinite)
                subtypeStr = "Infinite";
            else subtypeStr = "Ratio";
        } else if (rarity == Rarity.Uncommon) {
            rarityStr = "Uncommon";
            subtypeStr = "Enhanced";
        } else {
            rarityStr = "Standard";
            subtypeStr = "Standard";
        }

        string memory json = string(
            abi.encodePacked(
                '{"name": "Invisible Law #',
                tokenId.toString(),
                '",',
                '"description": "Generative Bauhaus Mosaic governed by the Golden Ratio. Layers of geometric forms aligned to Phi grid.",',
                '"attributes": [',
                '{"trait_type": "Tier", "value": "',
                rarityStr,
                '"},',
                '{"trait_type": "Type", "value": "',
                subtypeStr,
                '"},',
                '{"trait_type": "Style", "value": "Bauhaus Mosaic"}',
                "],",
                '"image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(image)),
                '",',
                '"animation_url": "data:text/html;base64,',
                Base64.encode(bytes(_wrapInHTML(animation))),
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

    // =========================================================================
    // SVG GENERATION - MAIN
    // =========================================================================

    /// @notice Generate animated SVG for a token (public wrapper)
    function generateSVG(uint256 tokenId) public view returns (string memory) {
        return _generateSVG(tokenId);
    }

    /// @notice Generate static SVG without animations or filters (for image metadata)
    function generateStaticSVG(
        uint256 tokenId
    ) public view returns (string memory) {
        return _genStaticSVG(tokenId);
    }

    /// @dev Wrap SVG in HTML for animation_url (better wallet compatibility)
    function _wrapInHTML(
        string memory svg
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">",
                    "<style>html,body{margin:0;padding:0;height:100%;width:100%;display:flex;justify-content:center;align-items:center;background:#000}</style>",
                    "</head><body>",
                    svg,
                    "</body></html>"
                )
            );
    }

    /// @dev Internal animated SVG generation
    function _generateSVG(
        uint256 tokenId
    ) internal view returns (string memory) {
        (Rarity rarity, uint256 subType, uint256 seed) = _getRarity(tokenId);

        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">',
            _defs(),
            '<rect width="100%" height="100%" fill="#ffffff"/>',
            '<rect x="50" y="50" width="900" height="900" fill="#1a1a1a" filter="url(#s)"/>',
            '<rect x="75" y="75" width="850" height="850" fill="#FFFDF8"/>',
            '<g clip-path="url(#c)">'
        );

        svg = abi.encodePacked(svg, _genGridLines(false));

        if (
            rarity == Rarity.Legendary &&
            LegendaryType(subType) == LegendaryType.Spiral
        ) {
            svg = abi.encodePacked(svg, _genSpiral());
        } else {
            svg = abi.encodePacked(
                svg,
                '<circle cx="500" cy="500" r="360" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>'
            );
        }

        svg = abi.encodePacked(svg, _genMosaic(seed, rarity, subType, false));
        svg = abi.encodePacked(svg, _genDots(seed, rarity, subType, false));
        svg = abi.encodePacked(svg, _genRings(seed, rarity, false));
        svg = abi.encodePacked(svg, _genExtLines(seed, rarity));
        svg = abi.encodePacked(svg, "</g></svg>");

        return string(svg);
    }

    /// @dev Internal static SVG generation (no defs, no animations, no filters)
    function _genStaticSVG(
        uint256 tokenId
    ) internal view returns (string memory) {
        (Rarity rarity, uint256 subType, uint256 seed) = _getRarity(tokenId);

        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">',
            '<rect width="1000" height="1000" fill="#ffffff"/>',
            '<rect x="50" y="50" width="900" height="900" fill="#1a1a1a"/>',
            '<rect x="75" y="75" width="850" height="850" fill="#FFFDF8"/>'
        );

        svg = abi.encodePacked(svg, _genGridLines(true));

        if (
            rarity == Rarity.Legendary &&
            LegendaryType(subType) == LegendaryType.Spiral
        ) {
            svg = abi.encodePacked(svg, _genSpiral());
        } else {
            svg = abi.encodePacked(
                svg,
                '<circle cx="500" cy="500" r="360" fill="none" stroke="#1a1a1a" stroke-width="2"/>'
            );
        }

        svg = abi.encodePacked(svg, _genMosaic(seed, rarity, subType, true));
        // svg = abi.encodePacked(svg, _genDots(seed, rarity, subType, true));
        // svg = abi.encodePacked(svg, _genRings(seed, rarity, true));
        // svg = abi.encodePacked(svg, _genExtLines(seed, rarity));
        svg = abi.encodePacked(svg, "</svg>");

        return string(svg);
    }

    // =========================================================================
    // DEFS
    // =========================================================================

    /// @dev Defs for animated SVG (includes animations and filter)
    function _defs() internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                "<defs>",
                "<style><![CDATA[",
                "@keyframes d{0%,100%{opacity:1}10%{opacity:.1}}",
                ".d1{animation:d 2.5s 0s infinite}",
                ".d2{animation:d 2.8s .4s infinite}",
                ".d3{animation:d 3.1s .8s infinite}",
                ".d4{animation:d 3.4s 1.2s infinite}",
                ".d5{animation:d 3.7s 1.6s infinite}",
                ".d6{animation:d 4.0s 2.0s infinite}",
                ".d7{animation:d 4.3s .2s infinite}",
                ".d8{animation:d 4.6s .6s infinite}",
                "]]></style>",
                '<filter id="s" x="-20%" y="-20%" width="140%" height="140%">',
                '<feDropShadow dx="4" dy="4" stdDeviation="8" flood-opacity="0.25"/></filter>',
                '<clipPath id="c"><rect x="75" y="75" width="850" height="850"/></clipPath>',
                "</defs>"
            );
    }

    // =========================================================================
    // LAYER 1: GRID LINES
    // =========================================================================

    function _genGridLines(
        bool staticMode
    ) internal pure returns (bytes memory) {
        bytes memory lines;
        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];
        string memory strokeWidth = staticMode ? "1" : "0.5";

        for (uint256 i = 0; i < 9; i++) {
            uint256 pos = INNER_START + (INNER_SIZE * grid[i]) / 1000;

            lines = abi.encodePacked(
                lines,
                '<line x1="',
                pos.toString(),
                '" y1="75" x2="',
                pos.toString(),
                '" y2="925" stroke="#1a1a1a" stroke-width="',
                strokeWidth,
                '"/>',
                '<line x1="75" y1="',
                pos.toString(),
                '" x2="925" y2="',
                pos.toString(),
                '" stroke="#1a1a1a" stroke-width="',
                strokeWidth,
                '"/>'
            );
        }

        return lines;
    }

    // =========================================================================
    // LAYER 2: SPIRAL (LEGENDARY)
    // =========================================================================

    function _genSpiral() internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                '<circle cx="500" cy="500" r="360" fill="none" stroke="#1a1a1a" stroke-width="2"/>',
                '<circle cx="500" cy="500" r="280" fill="none" stroke="#F9D56E" stroke-width="3"/>',
                '<circle cx="500" cy="500" r="175" fill="none" stroke="#E8505B" stroke-width="2"/>',
                '<circle cx="500" cy="500" r="110" fill="#14B1AB"/>',
                '<circle cx="500" cy="500" r="65" fill="#F9D56E"/>',
                '<circle cx="500" cy="500" r="40" fill="#1a1a1a"/>',
                '<circle cx="500" cy="500" r="15" fill="#F3ECC2"/>'
            );
    }

    // =========================================================================
    // LAYER 3: MOSAIC RECTANGLES
    // =========================================================================

    function _genMosaic(
        uint256 seed,
        Rarity rarity,
        uint256 subType,
        bool staticMode
    ) internal pure returns (bytes memory) {
        bytes memory rects;
        uint256 cellW = INNER_SIZE / 12;
        uint256 cellH = INNER_SIZE / 12;

        uint256 insideChance;
        uint256 outsideChance;
        uint256 forcedColorIdx = 99;

        if (rarity == Rarity.Legendary) {
            if (LegendaryType(subType) == LegendaryType.Zero) {
                insideChance = 15;
                outsideChance = 5;
            } else if (LegendaryType(subType) == LegendaryType.Unity) {
                insideChance = 70;
                outsideChance = 20;
                forcedColorIdx = (seed >> 200) % 7;
            } else {
                insideChance = 65;
                outsideChance = 15;
            }
        } else if (rarity == Rarity.Rare) {
            if (RareType(subType) == RareType.Infinite) {
                insideChance = 90;
                outsideChance = 50;
            } else if (RareType(subType) == RareType.Ratio) {
                insideChance = 70;
                outsideChance = 20;
                forcedColorIdx = 100 + ((seed >> 200) % 2);
            } else {
                insideChance = 65;
                outsideChance = 15;
            }
        } else if (rarity == Rarity.Uncommon) {
            insideChance = 75;
            outsideChance = 25;
        } else {
            insideChance = 65;
            outsideChance = 15;
        }

        string[8] memory colors = [
            "#E8505B",
            "#F9D56E",
            "#F3ECC2",
            "#14B1AB",
            "#9AB8A7",
            "#E89B5B",
            "#5B8EE8",
            "#1a1a1a"
        ];

        for (uint256 row = 0; row < 12; row++) {
            for (uint256 col = 0; col < 12; col++) {
                uint256 cellSeed = uint256(
                    keccak256(abi.encodePacked(seed, row, col))
                );

                uint256 cx = INNER_START + col * cellW + cellW / 2;
                uint256 cy = INNER_START + row * cellH + cellH / 2;

                int256 dx = int256(cx) - 500;
                int256 dy = int256(cy) - 500;
                uint256 dist = _sqrt(uint256(dx * dx + dy * dy));

                uint256 chance = dist < 340 ? insideChance : outsideChance;

                if (cellSeed % 100 < chance) {
                    uint256 sizeVar = (cellSeed >> 8) % 100;
                    uint256 w;
                    uint256 h;

                    if (sizeVar < 30) {
                        w = (cellW * 60) / 100;
                        h = (cellH * 60) / 100;
                    } else if (sizeVar < 70) {
                        w = (cellW * 90) / 100;
                        h = (cellH * 90) / 100;
                    } else if (sizeVar < 85) {
                        w = (cellW * 180) / 100;
                        h = (cellH * 70) / 100;
                    } else {
                        w = (cellW * 70) / 100;
                        h = (cellH * 180) / 100;
                    }

                    uint256 x = cx - w / 2;
                    uint256 y = cy - h / 2;

                    string memory color;
                    if (forcedColorIdx < 8) {
                        color = colors[forcedColorIdx];
                    } else if (forcedColorIdx == 100) {
                        uint256[3] memory warm = [uint256(0), 1, 5];
                        color = colors[warm[(cellSeed >> 16) % 3]];
                    } else if (forcedColorIdx == 101) {
                        uint256[3] memory cool = [uint256(3), 4, 6];
                        color = colors[cool[(cellSeed >> 16) % 3]];
                    } else {
                        color = colors[(cellSeed >> 16) % 8];
                    }

                    if (staticMode) {
                        rects = abi.encodePacked(
                            rects,
                            '<rect x="',
                            x.toString(),
                            '" y="',
                            y.toString(),
                            '" width="',
                            w.toString(),
                            '" height="',
                            h.toString(),
                            '" fill="',
                            color,
                            '"/>'
                        );
                    } else {
                        rects = abi.encodePacked(
                            rects,
                            '<rect class="d',
                            ((cellSeed % 8) + 1).toString(),
                            '" x="',
                            x.toString(),
                            '" y="',
                            y.toString(),
                            '" width="',
                            w.toString(),
                            '" height="',
                            h.toString(),
                            '" fill="',
                            color,
                            '"/>'
                        );
                    }
                }
            }
        }

        return rects;
    }

    // =========================================================================
    // LAYER 4: DOTS AT INTERSECTIONS
    // =========================================================================

    function _genDots(
        uint256 seed,
        Rarity rarity,
        uint256 subType,
        bool staticMode
    ) internal pure returns (bytes memory) {
        bytes memory dots;
        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];
        uint8[6] memory fib = [10, 15, 25, 40, 65, 110];

        uint256 dotChance;
        if (rarity == Rarity.Rare && RareType(subType) == RareType.Sequence) {
            dotChance = 70;
        } else if (
            rarity == Rarity.Legendary &&
            LegendaryType(subType) == LegendaryType.Zero
        ) {
            dotChance = 40;
        } else if (rarity == Rarity.Uncommon) {
            dotChance = 35;
        } else {
            dotChance = 25;
        }

        string[8] memory colors = [
            "#E8505B",
            "#F9D56E",
            "#F3ECC2",
            "#14B1AB",
            "#9AB8A7",
            "#E89B5B",
            "#5B8EE8",
            "#1a1a1a"
        ];

        for (uint256 i = 0; i < 9; i++) {
            for (uint256 j = 0; j < 9; j++) {
                uint256 dotSeed = uint256(
                    keccak256(abi.encodePacked(seed, i, j, uint256(5000)))
                );

                if (dotSeed % 100 < dotChance) {
                    uint256 x = INNER_START + (INNER_SIZE * grid[i]) / 1000;
                    uint256 y = INNER_START + (INNER_SIZE * grid[j]) / 1000;

                    uint256 r = fib[(dotSeed >> 8) % 3];

                    string memory color = (dotSeed >> 16) % 100 < 70
                        ? "#1a1a1a"
                        : colors[(dotSeed >> 24) % 8];

                    if (staticMode) {
                        dots = abi.encodePacked(
                            dots,
                            '<circle cx="',
                            x.toString(),
                            '" cy="',
                            y.toString(),
                            '" r="',
                            r.toString(),
                            '" fill="',
                            color,
                            '"/>'
                        );
                    } else {
                        dots = abi.encodePacked(
                            dots,
                            '<circle class="d',
                            ((dotSeed % 8) + 1).toString(),
                            '" cx="',
                            x.toString(),
                            '" cy="',
                            y.toString(),
                            '" r="',
                            r.toString(),
                            '" fill="',
                            color,
                            '"/>'
                        );
                    }
                }
            }
        }

        return dots;
    }

    // =========================================================================
    // LAYER 5: CONCENTRIC CIRCLES
    // =========================================================================

    function _genRings(
        uint256 seed,
        Rarity rarity,
        bool staticMode
    ) internal pure returns (bytes memory) {
        bytes memory rings;
        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];
        uint8[6] memory fib = [10, 15, 25, 40, 65, 110];

        uint256 numGroups;
        if (rarity == Rarity.Uncommon) {
            numGroups = 4 + ((seed >> 100) % 2);
        } else if (rarity == Rarity.Rare) {
            numGroups = 5 + ((seed >> 100) % 2);
        } else if (rarity == Rarity.Legendary) {
            numGroups = 3;
        } else {
            numGroups = 2 + ((seed >> 100) % 3);
        }

        string[8] memory colors = [
            "#E8505B",
            "#F9D56E",
            "#F3ECC2",
            "#14B1AB",
            "#9AB8A7",
            "#E89B5B",
            "#5B8EE8",
            "#1a1a1a"
        ];

        for (uint256 g = 0; g < numGroups; g++) {
            uint256 gSeed = uint256(
                keccak256(abi.encodePacked(seed, g, uint256(8000)))
            );

            uint256 posI = gSeed % 9;
            uint256 posJ = (gSeed >> 8) % 9;
            uint256 cx = INNER_START + (INNER_SIZE * grid[posI]) / 1000;
            uint256 cy = INNER_START + (INNER_SIZE * grid[posJ]) / 1000;

            uint256 outerR = fib[3 + ((gSeed >> 16) % 3)];

            string memory c1 = colors[(gSeed >> 24) % 8];
            if (staticMode) {
                rings = abi.encodePacked(
                    rings,
                    '<circle cx="',
                    cx.toString(),
                    '" cy="',
                    cy.toString(),
                    '" r="',
                    outerR.toString(),
                    '" fill="none" stroke="',
                    c1,
                    '" stroke-width="2"/>'
                );
            } else {
                rings = abi.encodePacked(
                    rings,
                    '<circle class="d',
                    ((gSeed % 8) + 1).toString(),
                    '" cx="',
                    cx.toString(),
                    '" cy="',
                    cy.toString(),
                    '" r="',
                    outerR.toString(),
                    '" fill="none" stroke="',
                    c1,
                    '" stroke-width="2"/>'
                );
            }

            uint256 innerR = (outerR * 60) / 100;
            string memory c2 = colors[(gSeed >> 32) % 8];
            if (staticMode) {
                rings = abi.encodePacked(
                    rings,
                    '<circle cx="',
                    cx.toString(),
                    '" cy="',
                    cy.toString(),
                    '" r="',
                    innerR.toString(),
                    '" fill="',
                    c2,
                    '"/>'
                );
            } else {
                rings = abi.encodePacked(
                    rings,
                    '<circle class="d',
                    (((gSeed >> 4) % 8) + 1).toString(),
                    '" cx="',
                    cx.toString(),
                    '" cy="',
                    cy.toString(),
                    '" r="',
                    innerR.toString(),
                    '" fill="',
                    c2,
                    '"/>'
                );
            }

            rings = abi.encodePacked(
                rings,
                '<circle cx="',
                cx.toString(),
                '" cy="',
                cy.toString(),
                '" r="',
                uint256(fib[1]).toString(),
                '" fill="#1a1a1a"/>'
            );
        }

        return rings;
    }

    // =========================================================================
    // LAYER 6: EXTENDED LINES
    // =========================================================================

    function _genExtLines(
        uint256 seed,
        Rarity rarity
    ) internal pure returns (bytes memory) {
        bytes memory lines;
        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];
        uint8[6] memory fib = [10, 15, 25, 40, 65, 110];

        uint256 numLines;
        if (rarity == Rarity.Uncommon) {
            numLines = 6 + ((seed >> 110) % 4);
        } else if (rarity == Rarity.Rare) {
            numLines = 8 + ((seed >> 110) % 4);
        } else {
            numLines = 4 + ((seed >> 110) % 5);
        }

        for (uint256 l = 0; l < numLines; l++) {
            uint256 lSeed = uint256(
                keccak256(abi.encodePacked(seed, l, uint256(9000)))
            );

            uint256 posI = lSeed % 9;
            uint256 posJ = (lSeed >> 8) % 9;
            uint256 x1 = INNER_START + (INNER_SIZE * grid[posI]) / 1000;
            uint256 y1 = INNER_START + (INNER_SIZE * grid[posJ]) / 1000;

            bool isHoriz = (lSeed >> 16) % 2 == 0;
            bool extendNeg = (lSeed >> 17) % 2 == 0;

            uint256 x2;
            uint256 y2;

            if (isHoriz) {
                x2 = extendNeg ? 50 : 950;
                y2 = y1;
            } else {
                x2 = x1;
                y2 = extendNeg ? 50 : 950;
            }

            lines = abi.encodePacked(
                lines,
                '<line x1="',
                x1.toString(),
                '" y1="',
                y1.toString(),
                '" x2="',
                x2.toString(),
                '" y2="',
                y2.toString(),
                '" stroke="#1a1a1a" stroke-width="1"/>'
            );

            uint256 dotR = fib[(lSeed >> 20) % 2];
            lines = abi.encodePacked(
                lines,
                '<circle cx="',
                x2.toString(),
                '" cy="',
                y2.toString(),
                '" r="',
                dotR.toString(),
                '" fill="#1a1a1a"/>'
            );

            if ((lSeed >> 24) % 100 < 40) {
                lines = abi.encodePacked(
                    lines,
                    '<circle cx="',
                    x1.toString(),
                    '" cy="',
                    y1.toString(),
                    '" r="5" fill="#1a1a1a"/>'
                );
            }
        }

        return lines;
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================

    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
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
                _mintSeed[tokenId] = uint256(
                    keccak256(
                        abi.encodePacked(
                            blockhash(block.number - 1), // Previous block hash (unpredictable)
                            block.timestamp, // Current timestamp
                            block.prevrandao, // Beacon chain randomness (post-merge)
                            msg.sender, // Minter address
                            tokenId, // Token ID
                            tx.gasprice, // Gas price adds entropy
                            gasleft() // Remaining gas adds entropy
                        )
                    )
                );
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
