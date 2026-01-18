# Mint Page & Allowlist System Explanation

## Overview

The InvisibleLaw mint page allows users to mint NFTs with optional **free mints** for allowlisted addresses. The system uses a **Merkle tree** for efficient on-chain verification.

---

## Smart Contract Mint Function

**Contract**: `0x5De2AD02bF64f9d8D74b9CB321A615d85c8a4019` (Base Mainnet)

### Function Signature
```solidity
function mint(uint256 quantity, bytes32[] calldata proof) external payable
```

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `quantity` | uint256 | Number of NFTs to mint (1-5) |
| `proof` | bytes32[] | Merkle proof for allowlist (empty `[]` for public mint) |

### Key Constants
- **MAX_SUPPLY**: 1272 tokens
- **MAX_PER_WALLET**: 5 tokens
- **Default Mint Price**: 0.00618 ETH per token
- **Allowlist Free Mint**: 1 free mint per allowlisted address

---

## How Allowlist Works

### 1. Storage (Redis)
- Allowlisted addresses stored in **Upstash Redis** (SET data structure)
- Key: `allowlist:addresses`
- File: `app/lib/allowlist-service.ts`

### 2. Merkle Tree Generation
- Built from all allowlisted addresses
- Uses `keccak256` hashing (Ethereum standard)
- File: `app/lib/merkle.ts`

```
Addresses → keccak256(each) → Merkle Tree → Root + Proofs
```

### 3. On-Chain Verification
The contract stores a **merkleRoot** set by the owner. When minting:

```solidity
// Inside mint() function
if (proof.length > 0 && !allowlistClaimed[msg.sender] && merkleRoot != bytes32(0)) {
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
    if (MerkleProof.verify(proof, merkleRoot, leaf)) {
        discount = allowlistFreeMint;  // Apply free mint discount
        allowlistClaimed[msg.sender] = true;  // Mark as claimed
    }
}
```

---

## Frontend Flow

### Data Fetching

```
┌─────────────────────────────────────────────────────────────┐
│  useAllowlist Hook                                          │
│  ├── GET /api/allowlist/status → { isAllowlisted: bool }    │
│  ├── GET /api/allowlist/proof  → { proof: 0x...[] }         │
│  └── useReadContract("hasClaimedAllowlist") → hasClaimed    │
└─────────────────────────────────────────────────────────────┘
```

### Cost Calculation (MintControls.tsx)

```typescript
// Determine eligibility
const eligibleForFree = isAllowlisted && !hasClaimed && proof.length > 0;

// Calculate free vs paid
const freeCount = eligibleForFree ? Math.min(allowlistFreeMint, quantity) : 0;
const paidCount = quantity - freeCount;

// Total cost (free mints excluded)
const totalCost = mintPrice * BigInt(paidCount);
```

### Example Scenarios

| User Status | Minting 3 | Payment |
|-------------|-----------|---------|
| Not allowlisted | 3 paid | 0.01854 ETH |
| Allowlisted (unclaimed) | 1 free + 2 paid | 0.01236 ETH |
| Allowlisted (claimed) | 3 paid | 0.01854 ETH |

---

## Mint Transaction Flow

```
User clicks "Mint"
       ↓
MintControls.handleMint()
       ↓
useMint.mint(quantity, totalCost, proof)
       ↓
wagmi.writeContract({
  functionName: "mint",
  args: [quantity, proof],  // proof = [] if not allowlisted
  value: totalCost          // ETH in wei
})
       ↓
Contract validates:
  - quantity > 0
  - totalMinted + quantity <= MAX_SUPPLY
  - userMinted + quantity <= MAX_PER_WALLET
  - msg.value >= mintPrice * (quantity - discount)
       ↓
NFT minted, events emitted
       ↓
Frontend refetches contract data
       ↓
Success modal shown
```

---

## Key Files

| File | Purpose |
|------|---------|
| `app/mint/page.tsx` | Mint page wrapper |
| `app/components/mint/MintControls.tsx` | Main mint UI + logic |
| `app/hooks/useMint.ts` | Transaction management |
| `app/hooks/useAllowlist.ts` | Allowlist status + proof |
| `app/hooks/useContractReads.ts` | Contract state reads |
| `app/lib/allowlist-service.ts` | Redis + Merkle service |
| `app/lib/merkle.ts` | Merkle tree utilities |
| `app/api/allowlist/status/route.ts` | Check if address allowlisted |
| `app/api/allowlist/proof/route.ts` | Get Merkle proof |
| `abi/InvisibleLaw.sol` | Smart contract source |

---

## Security Notes

1. **All validation happens on-chain** - frontend is untrusted
2. **Merkle proof verified by contract** - cannot fake allowlist status
3. **One-time claim** - `allowlistClaimed` mapping prevents double-claiming
4. **Address normalized** - lowercased to prevent case issues

---

## Button States

The mint button adapts based on conditions:

| Condition | Button Text |
|-----------|-------------|
| Not connected | "Connect Wallet" (disabled) |
| Wrong chain | "Switch to Base" (disabled) |
| Loading | "Loading..." (disabled) |
| Sold out | "Sold Out" (disabled) |
| Paused | "Paused" (disabled) |
| Max reached | "Max Per Wallet Reached" (disabled) |
| Pending | "Confirm in Wallet..." (disabled) |
| Confirming | "Minting..." (disabled) |
| Success | "Minted!" (disabled) |
| Free mint eligible | "Mint X for FREE" (enabled) |
| Mixed (free+paid) | "Mint X (Y FREE + Z paid)" (enabled) |
| Public mint | "Mint X for Y.XXXXX ETH" (enabled) |
