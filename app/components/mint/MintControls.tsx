"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAccount, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { useContractReads } from "@/app/hooks/useContractReads";
import { useMint } from "@/app/hooks/useMint";
import { useAllowlist } from "@/app/hooks/useAllowlist";
import { QuantityPicker } from "@/app/components/ui/QuantityPicker";
import { MintSuccessModal } from "@/app/components/mint/MintSuccessModal";
import { formatEthDisplay } from "@/app/lib/format";
import { getErrorMessage, isUserRejection } from "@/app/lib/errors";

export function MintControls() {
  const [quantity, setQuantity] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedQuantity, setMintedQuantity] = useState(0);
  const mintButtonRef = useRef<HTMLButtonElement>(null);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectChain = chainId === base.id;

  const {
    mintPrice,
    mintActive,
    paused,
    isSoldOut,
    maxPerWallet,
    allowlistFreeMint,
    userMinted,
    remaining,
    isLoading: isContractLoading,
  } = useContractReads();

  const { mint, isPending, isConfirming, isSuccess, error, txHash, reset } = useMint();

  // Allowlist detection
  const {
    isAllowlisted,
    hasClaimed,
    proof,
    isLoading: isAllowlistLoading,
  } = useAllowlist();

  // Handle modal close
  const handleModalClose = () => {
    setShowSuccessModal(false);
    reset();
    setQuantity(1);
    // Return focus to mint button
    mintButtonRef.current?.focus();
  };

  // Calculate max mintable for this user
  const userRemaining = maxPerWallet - userMinted;
  const maxMintable = Math.min(userRemaining, remaining);

  // Clamp quantity to valid range
  const validQuantity = Math.min(Math.max(1, quantity), Math.max(1, maxMintable));

  // Show success modal when mint completes
  useEffect(() => {
    if (isSuccess && !showSuccessModal) {
      setMintedQuantity(validQuantity);
      setShowSuccessModal(true);
    }
  }, [isSuccess, showSuccessModal, validQuantity]);

  // Calculate allowlist eligibility
  const eligibleForFree = isAllowlisted && !hasClaimed && proof.length > 0;
  const freeCount = eligibleForFree ? Math.min(allowlistFreeMint, validQuantity) : 0;
  const paidCount = validQuantity - freeCount;

  // Total cost (accounting for free mints)
  const totalCost = useMemo(
    () => mintPrice * BigInt(paidCount),
    [mintPrice, paidCount]
  );

  // Determine button state
  const getButtonState = () => {
    if (!isConnected) {
      return { disabled: true, text: "Connect Wallet" };
    }
    if (!isCorrectChain) {
      return { disabled: true, text: "Switch to Base" };
    }
    if (isContractLoading || isAllowlistLoading) {
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

    // Show appropriate text based on free mint eligibility
    if (eligibleForFree && freeCount > 0) {
      if (paidCount === 0) {
        return { disabled: false, text: `Mint ${validQuantity} for FREE` };
      }
      return {
        disabled: false,
        text: `Mint ${validQuantity} (${freeCount} FREE + ${paidCount} paid)`,
      };
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
    // Pass proof when eligible for free mint
    mint(validQuantity, totalCost, eligibleForFree ? proof : []);
  };

  // Show error (but not for user rejections)
  const showError = error && !isUserRejection(error);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Allowlist status indicator */}
      {isConnected && !isAllowlistLoading && eligibleForFree && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {allowlistFreeMint} FREE mint available
          </span>
        </div>
      )}

      {/* Already claimed indicator */}
      {isConnected && !isAllowlistLoading && isAllowlisted && hasClaimed && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground/60">
            Free mint claimed
          </span>
        </div>
      )}

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
        {eligibleForFree && paidCount === 0 ? (
          <p className="text-xl font-mono text-green-600">FREE</p>
        ) : eligibleForFree && freeCount > 0 ? (
          <div>
            <p className="text-xl font-mono">{formatEthDisplay(totalCost)}</p>
            <p className="text-xs text-green-600">{freeCount} free + {paidCount} paid</p>
          </div>
        ) : (
          <p className="text-xl font-mono">{formatEthDisplay(totalCost)}</p>
        )}
      </div>

      {/* Mint button */}
      <button
        ref={mintButtonRef}
        onClick={handleMint}
        disabled={buttonState.disabled}
        className={`w-full py-4 text-sm sm:text-base font-medium transition-all
          focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none
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

      {/* Success modal */}
      <MintSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        txHash={txHash}
        quantity={mintedQuantity}
      />
    </div>
  );
}
