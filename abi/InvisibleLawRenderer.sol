// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title InvisibleLawRenderer
 * @notice SVG rendering logic for Invisible Law NFT collection
 * @dev Separated from main contract to stay under 24KB limit
 */
contract InvisibleLawRenderer {
    using Strings for uint256;

    // =========================================================================
    // CONSTANTS
    // =========================================================================

    uint256 private constant PHI_NUM = 1618;
    uint256 private constant PHI_DEN = 1000;

    uint256 private constant CANVAS = 1000;
    uint256 private constant INNER_START = 75;
    uint256 private constant INNER_SIZE = 850;

    // Rarity enum (must match main contract)
    enum Rarity {
        Harmony,
        Clarity,
        Emergence,
        Turbulence,
        Chaos
    }

    // =========================================================================
    // MAIN GENERATION FUNCTIONS
    // =========================================================================

    /// @notice Generate animated SVG for a token
    function generateSVG(
        Rarity rarity,
        uint256 seed
    ) external pure returns (string memory) {
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">',
            _defs(),
            '<rect width="100%" height="100%" fill="#ffffff"/>',
            '<rect x="75" y="75" width="850" height="850" fill="#FFFDF8"/>',
            '<g clip-path="url(#c)">'
        );

        svg = abi.encodePacked(svg, _genGridLines(false, rarity));

        if (rarity == Rarity.Chaos) {
            svg = abi.encodePacked(svg, _genSpiral());
        } else {
            svg = abi.encodePacked(
                svg,
                '<circle cx="500" cy="500" r="360" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>'
            );
        }

        svg = abi.encodePacked(svg, _genMosaic(seed, rarity, false));
        svg = abi.encodePacked(svg, _genDots(seed, rarity, false));
        svg = abi.encodePacked(svg, _genRings(seed, rarity, false));
        svg = abi.encodePacked(svg, _genExtLines(seed, rarity));
        svg = abi.encodePacked(svg, "</g>");

        svg = abi.encodePacked(
            svg,
            '<rect x="50" y="50" width="900" height="25" fill="#1a1a1a" filter="url(#s)"/>',
            '<rect x="50" y="925" width="900" height="25" fill="#1a1a1a" filter="url(#s)"/>',
            '<rect x="50" y="50" width="25" height="900" fill="#1a1a1a" filter="url(#s)"/>',
            '<rect x="925" y="50" width="25" height="900" fill="#1a1a1a" filter="url(#s)"/>'
        );
        svg = abi.encodePacked(svg, "</svg>");

        return string(svg);
    }

    /// @notice Generate static SVG without animations
    function generateStaticSVG(
        Rarity rarity,
        uint256 seed
    ) external pure returns (string memory) {
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">',
            '<rect width="1000" height="1000" fill="#ffffff"/>',
            '<rect x="75" y="75" width="850" height="850" fill="#FFFDF8"/>'
        );

        svg = abi.encodePacked(svg, _genGridLines(true, rarity));

        if (rarity == Rarity.Chaos) {
            svg = abi.encodePacked(svg, _genSpiral());
        } else {
            svg = abi.encodePacked(
                svg,
                '<circle cx="500" cy="500" r="360" fill="none" stroke="#1a1a1a" stroke-width="2"/>'
            );
        }

        svg = abi.encodePacked(svg, _genMosaic(seed, rarity, true));

        svg = abi.encodePacked(
            svg,
            '<rect x="50" y="50" width="900" height="25" fill="#1a1a1a"/>',
            '<rect x="50" y="925" width="900" height="25" fill="#1a1a1a"/>',
            '<rect x="50" y="50" width="25" height="900" fill="#1a1a1a"/>',
            '<rect x="925" y="50" width="25" height="900" fill="#1a1a1a"/>'
        );
        svg = abi.encodePacked(svg, "</svg>");

        return string(svg);
    }

    /// @notice Wrap SVG in HTML for animation_url
    function wrapInHTML(
        string memory svg
    ) external pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<!DOCTYPE html><html><head><meta charset="UTF-8">',
                    "<style>body{margin:0;padding:0;overflow:hidden;background:#000}svg{width:100%;height:100%}</style>",
                    "</head><body>",
                    svg,
                    "</body></html>"
                )
            );
    }

    // =========================================================================
    // DEFS
    // =========================================================================

    function _defs() internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                "<defs>",
                "<style><![CDATA[",
                "@keyframes phiExist{",
                "0%{opacity:1}",
                "38.2%{opacity:1}",
                "39.5%{opacity:0}",
                "60.5%{opacity:0}",
                "61.8%{opacity:1}",
                "100%{opacity:1}",
                "}",
                "@keyframes phiFade{",
                "0%{opacity:1}",
                "15%{opacity:0.96}",
                "38.2%{opacity:0.12}",
                "50%{opacity:0.18}",
                "61.8%{opacity:0.6}",
                "85%{opacity:0.96}",
                "100%{opacity:1}",
                "}",
                "@keyframes phiStroke{",
                "0%{stroke-width:1}",
                "30%{stroke-width:1}",
                "38.2%{stroke-width:0.618}",
                "55%{stroke-width:0.618}",
                "61.8%{stroke-width:1.618}",
                "85%{stroke-width:1.618}",
                "100%{stroke-width:1}",
                "}",
                "@keyframes phiRotate{",
                "0%{transform:rotate(0deg)}",
                "30%{transform:rotate(0deg)}",
                "38.2%{transform:rotate(137.5deg)}",
                "55%{transform:rotate(137.5deg)}",
                "61.8%{transform:rotate(222.5deg)}",
                "80%{transform:rotate(222.5deg)}",
                "100%{transform:rotate(360deg)}",
                "}",
                ".d1{animation:phiFade 2s infinite}",
                ".d2{animation:phiFade 3.236s infinite;animation-delay:1.236s}",
                ".d3{animation:phiFade 5.236s infinite;animation-delay:0.764s}",
                ".d4{animation:phiFade 8.472s infinite;animation-delay:0.472s}",
                ".d5{animation:phiFade 13.708s infinite}",
                ".d6{animation:phiFade 22.18s infinite}",
                ".d7{animation:phiFade 35.888s infinite}",
                ".v1{animation:phiExist 5.236s infinite}",
                ".v2{animation:phiExist 8.472s infinite}",
                ".s1{animation:phiStroke 5.236s infinite}",
                ".s2{animation:phiStroke 8.472s infinite}",
                ".s3{animation:phiStroke 13.708s infinite}",
                ".r1{transform-origin:50% 50%;animation:phiRotate 3.236s infinite}",
                "]]></style>",
                '<filter id="s" x="-20%" y="-20%" width="140%" height="140%">',
                '<feDropShadow dx="4" dy="4" stdDeviation="8" flood-opacity="0.25"/></filter>',
                '<clipPath id="c"><rect x="75" y="75" width="850" height="850"/></clipPath>',
                "</defs>"
            );
    }

    // =========================================================================
    // ANIMATION HELPERS
    // =========================================================================

    function _getMaxLayer(Rarity rarity) internal pure returns (uint256) {
        if (rarity == Rarity.Chaos) return 7;
        if (rarity == Rarity.Turbulence) return 4;
        if (rarity == Rarity.Emergence) return 3;
        if (rarity == Rarity.Clarity) return 2;
        return 1;
    }

    function _getLayerClass(uint256 layer) internal pure returns (string memory) {
        if (layer == 1) return "d1";
        if (layer == 2) return "d2";
        if (layer == 3) return "d3";
        if (layer == 4) return "d4";
        if (layer == 5) return "d5";
        if (layer == 6) return "d6";
        return "d7";
    }

    function _getAnimClass(
        uint256 layer,
        Rarity rarity,
        bool includeStroke,
        bool includeRotation
    ) internal pure returns (string memory) {
        string memory baseClass = _getLayerClass(layer);

        if (includeStroke && rarity >= Rarity.Emergence) {
            uint256 strokeLayer = ((layer - 1) % 3) + 1;
            if (strokeLayer == 1) {
                baseClass = string(abi.encodePacked(baseClass, " s1"));
            } else if (strokeLayer == 2) {
                baseClass = string(abi.encodePacked(baseClass, " s2"));
            } else {
                baseClass = string(abi.encodePacked(baseClass, " s3"));
            }
        }

        if (includeRotation && rarity == Rarity.Chaos) {
            baseClass = string(abi.encodePacked(baseClass, " r1"));
        }

        return baseClass;
    }

    // =========================================================================
    // LAYER 1: GRID LINES
    // =========================================================================

    function _genGridLines(
        bool staticMode,
        Rarity rarity
    ) internal pure returns (bytes memory) {
        bytes memory lines;
        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];
        string memory strokeWidth = staticMode ? "1" : "0.5";

        for (uint256 i = 0; i < 9; i++) {
            uint256 pos = INNER_START + (INNER_SIZE * grid[i]) / 1000;

            string memory classAttr = "";
            if (!staticMode && rarity >= Rarity.Emergence) {
                uint256 strokeLayer = (i % 3) + 1;
                if (strokeLayer == 1) classAttr = ' class="s1"';
                else if (strokeLayer == 2) classAttr = ' class="s2"';
                else classAttr = ' class="s3"';
            }

            lines = abi.encodePacked(
                lines,
                "<line",
                classAttr,
                ' x1="',
                pos.toString(),
                '" y1="75" x2="',
                pos.toString(),
                '" y2="925" stroke="#1a1a1a" stroke-width="',
                strokeWidth,
                '"/>',
                "<line",
                classAttr,
                ' x1="75" y1="',
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
    // LAYER 2: SPIRAL (CHAOS ONLY)
    // =========================================================================

    function _genSpiral() internal pure returns (bytes memory) {
        uint256 r0 = 360;
        uint256 r1 = (r0 * PHI_DEN) / PHI_NUM;
        uint256 r2 = (r1 * PHI_DEN) / PHI_NUM;
        uint256 r3 = (r2 * PHI_DEN) / PHI_NUM;
        uint256 r4 = (r3 * PHI_DEN) / PHI_NUM;
        uint256 r5 = (r4 * PHI_DEN) / PHI_NUM;

        return
            abi.encodePacked(
                '<circle cx="500" cy="500" r="',
                r0.toString(),
                '" fill="none" stroke="#1a1a1a" stroke-width="2"/>',
                '<circle cx="500" cy="500" r="',
                r1.toString(),
                '" fill="none" stroke="#F9D56E" stroke-width="3"/>',
                '<circle cx="500" cy="500" r="',
                r2.toString(),
                '" fill="none" stroke="#E8505B" stroke-width="2"/>',
                '<circle cx="500" cy="500" r="',
                r3.toString(),
                '" fill="#14B1AB"/>',
                '<circle cx="500" cy="500" r="',
                r4.toString(),
                '" fill="#F9D56E"/>',
                '<circle cx="500" cy="500" r="',
                r5.toString(),
                '" fill="#1a1a1a"/>'
            );
    }

    // =========================================================================
    // LAYER 3: MOSAIC RECTANGLES
    // =========================================================================

    function _genMosaic(
        uint256 seed,
        Rarity rarity,
        bool staticMode
    ) internal pure returns (bytes memory) {
        bytes memory rects;
        uint256 base = INNER_SIZE / 12;

        uint256 insideChance;
        uint256 outsideChance;

        if (rarity == Rarity.Chaos) {
            insideChance = 618;
            outsideChance = 382;
        } else if (rarity == Rarity.Turbulence) {
            insideChance = 600;
            outsideChance = 370;
        } else if (rarity == Rarity.Emergence) {
            insideChance = 580;
            outsideChance = 360;
        } else if (rarity == Rarity.Clarity) {
            insideChance = 560;
            outsideChance = 350;
        } else {
            insideChance = 550;
            outsideChance = 340;
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

        uint256 maxLayer = _getMaxLayer(rarity);

        for (uint256 row = 0; row < 12; row++) {
            for (uint256 col = 0; col < 12; col++) {
                uint256 s = uint256(
                    keccak256(abi.encodePacked(seed, row, col))
                );

                uint256 cx = INNER_START + col * base + base / 2;
                uint256 cy = INNER_START + row * base + base / 2;

                uint256 dist = _sqrt(
                    uint256((int256(cx) - 500) ** 2 + (int256(cy) - 500) ** 2)
                );

                uint256 chance = dist < 360 ? insideChance : outsideChance;
                if (s % 1000 >= chance) continue;

                bool vertical = (s & 1) == 0;

                uint256 w = vertical ? base : (base * PHI_NUM) / PHI_DEN;
                uint256 h = vertical ? (base * PHI_NUM) / PHI_DEN : base;

                uint256 x = cx - w / 2;
                uint256 y = cy - h / 2;

                string memory color = colors[(s >> 8) % 8];

                uint256 layer = ((row + col) % maxLayer) + 1;

                string memory animClass;
                if (staticMode) {
                    animClass = "";
                } else {
                    animClass = string(
                        abi.encodePacked(
                            ' class="',
                            _getAnimClass(layer, rarity, false, true),
                            '"'
                        )
                    );
                }

                rects = abi.encodePacked(
                    rects,
                    "<rect",
                    animClass,
                    ' x="',
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
        return rects;
    }

    // =========================================================================
    // LAYER 4: DOTS AT PHI INTERSECTIONS
    // =========================================================================

    function _genDots(
        uint256 seed,
        Rarity rarity,
        bool staticMode
    ) internal pure returns (bytes memory) {
        bytes memory dots;

        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];

        uint256 base = INNER_SIZE / 12;
        uint256 r = (base * PHI_DEN * PHI_DEN * PHI_DEN) / (PHI_NUM * PHI_NUM * PHI_NUM);

        uint256 dotChance;
        if (rarity == Rarity.Chaos) {
            dotChance = 700;
        } else if (rarity == Rarity.Turbulence) {
            dotChance = 550;
        } else if (rarity == Rarity.Emergence) {
            dotChance = 400;
        } else if (rarity == Rarity.Clarity) {
            dotChance = 350;
        } else {
            dotChance = 250;
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

        uint256 maxLayer = _getMaxLayer(rarity);

        for (uint256 i = 0; i < 9; i++) {
            for (uint256 j = 0; j < 9; j++) {
                uint256 s = uint256(
                    keccak256(abi.encodePacked(seed, i, j, uint256(5000)))
                );

                if (s % 1000 >= dotChance) continue;

                uint256 x = INNER_START + (INNER_SIZE * grid[i]) / 1000;
                uint256 y = INNER_START + (INNER_SIZE * grid[j]) / 1000;

                string memory color = ((s >> 16) % 100 < 70)
                    ? "#1a1a1a"
                    : colors[(s >> 24) % 8];

                uint256 layer = ((i + j) % maxLayer) + 1;

                string memory animClass;
                if (staticMode) {
                    animClass = "";
                } else {
                    animClass = string(
                        abi.encodePacked(
                            ' class="',
                            _getAnimClass(layer, rarity, false, true),
                            '"'
                        )
                    );
                }

                dots = abi.encodePacked(
                    dots,
                    "<circle",
                    animClass,
                    ' cx="',
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

        uint256 numGroups;
        if (rarity == Rarity.Chaos) {
            numGroups = 6 + ((seed >> 100) % 3);
        } else if (rarity == Rarity.Turbulence) {
            numGroups = 5 + ((seed >> 100) % 2);
        } else if (rarity == Rarity.Emergence) {
            numGroups = 4 + ((seed >> 100) % 2);
        } else if (rarity == Rarity.Clarity) {
            numGroups = 3 + ((seed >> 100) % 2);
        } else {
            numGroups = 2 + ((seed >> 100) % 3);
        }

        uint256 maxLayer = _getMaxLayer(rarity);

        for (uint256 g = 0; g < numGroups; g++) {
            rings = abi.encodePacked(
                rings,
                _genRingGroup(seed, rarity, staticMode, g, maxLayer)
            );
        }

        return rings;
    }

    function _genRingGroup(
        uint256 seed,
        Rarity rarity,
        bool staticMode,
        uint256 g,
        uint256 maxLayer
    ) internal pure returns (bytes memory) {
        uint16[9] memory grid = [0, 146, 236, 382, 500, 618, 764, 854, 1000];
        uint256 base = INNER_SIZE / 12;

        uint256 s = uint256(keccak256(abi.encodePacked(seed, g, uint256(8000))));

        uint256 cx = INNER_START + (INNER_SIZE * grid[s % 9]) / 1000;
        uint256 cy = INNER_START + (INNER_SIZE * grid[(s >> 8) % 9]) / 1000;

        uint256 outerR = (base * PHI_NUM) / PHI_DEN;
        uint256 innerR = (outerR * PHI_DEN) / PHI_NUM;
        uint256 coreR = (innerR * PHI_DEN) / PHI_NUM;

        string memory c1 = _getColor((s >> 24) % 8);
        string memory c2 = _getColor((s >> 32) % 8);

        string memory outerClass = "";
        string memory innerClass = "";
        if (!staticMode) {
            uint256 outerLayer = (g % maxLayer) + 1;
            uint256 innerLayer = ((g + 2) % maxLayer) + 1;
            outerClass = string(
                abi.encodePacked(' class="', _getAnimClass(outerLayer, rarity, true, false), '"')
            );
            innerClass = string(
                abi.encodePacked(' class="', _getAnimClass(innerLayer, rarity, false, true), '"')
            );
        }

        return abi.encodePacked(
            _ringCircle(cx, cy, outerR, outerClass, c1, true),
            _ringCircle(cx, cy, innerR, innerClass, c2, false),
            '<circle cx="', cx.toString(), '" cy="', cy.toString(),
            '" r="', coreR.toString(), '" fill="#1a1a1a"/>'
        );
    }

    function _ringCircle(
        uint256 cx,
        uint256 cy,
        uint256 r,
        string memory classAttr,
        string memory color,
        bool isStroke
    ) internal pure returns (bytes memory) {
        if (isStroke) {
            return abi.encodePacked(
                "<circle", classAttr,
                ' cx="', cx.toString(), '" cy="', cy.toString(),
                '" r="', r.toString(), '" fill="none" stroke="', color, '" stroke-width="2"/>'
            );
        }
        return abi.encodePacked(
            "<circle", classAttr,
            ' cx="', cx.toString(), '" cy="', cy.toString(),
            '" r="', r.toString(), '" fill="', color, '"/>'
        );
    }

    function _getColor(uint256 index) internal pure returns (string memory) {
        if (index == 0) return "#E8505B";
        if (index == 1) return "#F9D56E";
        if (index == 2) return "#F3ECC2";
        if (index == 3) return "#14B1AB";
        if (index == 4) return "#9AB8A7";
        if (index == 5) return "#E89B5B";
        if (index == 6) return "#5B8EE8";
        return "#1a1a1a";
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

        uint256 minEdge = INNER_START;
        uint256 maxEdge = INNER_START + INNER_SIZE;
        uint256 phiEdge = INNER_START + (INNER_SIZE * 618) / 1000;
        uint256 invPhiEdge = INNER_START + (INNER_SIZE * 382) / 1000;

        uint256[4] memory edges = [minEdge, invPhiEdge, phiEdge, maxEdge];

        uint256 numLines;
        if (rarity == Rarity.Chaos) numLines = 10 + ((seed >> 110) % 4);
        else if (rarity == Rarity.Turbulence)
            numLines = 8 + ((seed >> 110) % 4);
        else if (rarity == Rarity.Emergence) numLines = 6 + ((seed >> 110) % 4);
        else if (rarity == Rarity.Clarity) numLines = 5 + ((seed >> 110) % 3);
        else numLines = 4 + ((seed >> 110) % 5);

        for (uint256 l = 0; l < numLines; l++) {
            uint256 s = uint256(
                keccak256(abi.encodePacked(seed, l, uint256(9000)))
            );

            uint256 x1 = INNER_START + (INNER_SIZE * grid[s % 9]) / 1000;
            uint256 y1 = INNER_START + (INNER_SIZE * grid[(s >> 8) % 9]) / 1000;

            bool horiz = (s >> 16) & 1 == 0;

            uint256 edge = edges[(s >> 17) % 4];

            uint256 x2 = horiz ? edge : x1;
            uint256 y2 = horiz ? y1 : edge;

            uint256 base = INNER_SIZE / 12;
            uint256 dotR = (base * 1000) / 1618;

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
                '" stroke="#1a1a1a" stroke-width="1"/>',
                '<circle cx="',
                x2.toString(),
                '" cy="',
                y2.toString(),
                '" r="',
                dotR.toString(),
                '" fill="#1a1a1a"/>'
            );
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
}
