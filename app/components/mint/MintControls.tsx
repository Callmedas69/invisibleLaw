"use client";

import { useState, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { useContractReads } from "@/app/hooks/useContractReads";
import { useMint } from "@/app/hooks/useMint";
import { QuantityPicker } from "@/app/components/ui/QuantityPicker";
import { formatEthDisplay, calculateMintCost } from "@/app/lib/format";
import { getErrorMessage, isUserRejection } from "@/app/lib/errors";

export function MintControls() {
  const [quantity, setQuantity] = useState(1);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectChain = chainId === base.id;

  const {
    mintPrice,
    mintActive,
    paused,
    isSoldOut,
    maxPerTx,
    maxPerWallet,
    userMinted,
    remaining,
    isLoading: isContractLoading,
  } = useContractReads();

  const { mint, isPending, isConfirming, isSuccess, error, reset } = useMint();

  // Calculate max mintable for this user
  const userRemaining = maxPerWallet - userMinted;
  const maxMintable = Math.min(maxPerTx, userRemaining, remaining);

  // Clamp quantity to valid range
  const validQuantity = Math.min(Math.max(1, quantity), Math.max(1, maxMintable));

  // Total cost
  const totalCost = useMemo(
    () => calculateMintCost(mintPrice, validQuantity),
    [mintPrice, validQuantity]
  );

  // Determine button state
  const getButtonState = () => {
    if (!isConnected) {
      return { disabled: true, text: "Connect Wallet" };
    }
    if (!isCorrectChain) {
      return { disabled: true, text: "Switch to Base" };
    }
    if (isContractLoading) {
      return { disabled: true, text: "Loading..." };
    }
    if (isSoldOut) {
      return { disabled: true, text: "Sold Out" };
    }
    if (paused) {
      return { disabled: true, text: "Paused" };
    }
    if (!mintActive) {
      return { disabled: true, text: "Minting Not Active" };
    }
    if (userRemaining <= 0) {
      return { disabled: true, text: "Max Per Wallet Reached" };
    }
    if (isPending) {
      return { disabled: true, text: "Confirm in Wallet..." };
    }
    if (isConfirming) {
      return { disabled: true, text: "Minting..." };
    }
    if (isSuccess) {
      return { disabled: true, text: "Minted!" };
    }

    return {
      disabled: false,
      text: `Mint ${validQuantity} for ${formatEthDisplay(totalCost)}`,
    };
  };

  const buttonState = getButtonState();

  // Handle mint
  const handleMint = () => {
    if (buttonState.disabled) return;
    mint(validQuantity, totalCost);
  };

  // Reset after success
  if (isSuccess) {
    setTimeout(() => {
      reset();
      setQuantity(1);
    }, 2000);
  }

  // Show error (but not for user rejections)
  const showError = error && !isUserRejection(error);

  return (
    <div className="space-y-6">
      {/* Quantity picker */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm text-foreground/60">Quantity</label>
        <QuantityPicker
          value={validQuantity}
          onChange={setQuantity}
          min={1}
          max={maxMintable > 0 ? maxMintable : 1}
          disabled={!isConnected || !mintActive || isPending || isConfirming}
        />
      </div>

      {/* Total cost */}
      <div className="text-center">
        <p className="text-sm text-foreground/60">Total</p>
        <p className="text-xl font-mono">{formatEthDisplay(totalCost)}</p>
      </div>

      {/* Mint button */}
      <button
        onClick={handleMint}
        disabled={buttonState.disabled}
        className={`w-full py-4 text-base font-medium transition-all
          ${
            buttonState.disabled
              ? "bg-foreground/10 text-foreground/40 cursor-not-allowed"
              : "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
          }
          ${isSuccess ? "bg-green-600 text-white" : ""}
          ${isPending || isConfirming ? "animate-pulse" : ""}
        `}
      >
        {buttonState.text}
      </button>

      {/* Error message */}
      {showError && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {getErrorMessage(error)}
        </p>
      )}
    </div>
  );
}
