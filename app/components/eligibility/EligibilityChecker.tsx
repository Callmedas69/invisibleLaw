"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { useEligibility } from "@/app/hooks/useEligibility";
import { useMiniApp } from "@/app/hooks/useMiniApp";
import { ScoreCard } from "./ScoreCard";
import { SocialFollowCard } from "./SocialFollowCard";
import { ShareCard } from "./ShareCard";
import { CustomConnectButton } from "@/app/components/ui/CustomConnectButton";

export function EligibilityChecker() {
  const { isConnected } = useAccount();
  const { isMiniApp } = useMiniApp();
  const {
    scores,
    social,
    share,
    farcasterUser,
    passesScoreRequirement,
    passesSocialRequirement,
    passesShareRequirement,
    isEligible,
    isAlreadyAllowlisted,
    xFollowConfirmed,
    hasClickedXFollow,
    isLoading,
    isAdding,
    error,
    confirmXFollow,
    markXFollowClicked,
    shareCast,
    addToAllowlist,
  } = useEligibility();

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className="text-center space-y-6">
        <p className="text-foreground/70">
          Connect your wallet to check eligibility
        </p>
        <CustomConnectButton />
      </div>
    );
  }

  // Already on allowlist
  if (isAlreadyAllowlisted) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-600 border border-green-600/20">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">You&apos;re on the allowlist!</span>
        </div>
        <p className="text-foreground/70">
          You have 1 FREE mint available on the allowlist.
        </p>
        <Link
          href="/mint"
          className="inline-block px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
        >
          Go to Mint
        </Link>
      </div>
    );
  }

  // Find X social entry for confirm callback
  const xSocial = social.find((s) => s.platform === "x");
  const fcSocial = social.find((s) => s.platform === "farcaster");

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Farcaster user info - hidden on mobile and in miniapps */}
      {farcasterUser && (
        <div className={`${isMiniApp ? 'hidden' : 'hidden sm:flex'} items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-foreground/20`}>
          {farcasterUser.pfpUrl && (
            <img
              src={farcasterUser.pfpUrl}
              alt={farcasterUser.displayName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{farcasterUser.displayName}</p>
            <p className="text-sm text-foreground/50">
              @{farcasterUser.username}
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-600/10 text-red-600 border border-red-600/20">
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Reputation Scores Section */}
      <section className="space-y-2 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <h2 className="font-serif text-lg">Reputation Scores</h2>
          <span className="text-sm text-foreground/50">
            Need at least one to pass
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
          {scores.map((score) => (
            <ScoreCard
              key={score.provider}
              provider={score.provider}
              score={score.score}
              threshold={score.threshold}
              passes={score.passes}
              error={score.error}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Score requirement status */}
        <div
          className={`text-sm font-medium ${
            passesScoreRequirement ? "text-green-600" : "text-foreground/50"
          }`}
        >
          {passesScoreRequirement
            ? "Score requirement met"
            : "Score requirement not met"}
        </div>
      </section>

      {/* Social Follows Section */}
      <section className="space-y-2 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <h2 className="font-serif text-lg">Social Follows</h2>
          <span className="text-sm text-foreground/50">Need both to pass</span>
        </div>

        <div className="flex flex-col gap-2 sm:gap-4">
          {/* X (Twitter) */}
          {xSocial && (
            <SocialFollowCard
              platform="x"
              username={xSocial.username}
              profileUrl={xSocial.profileUrl}
              isFollowing={xFollowConfirmed || xSocial.isFollowing}
              verified={xSocial.verified}
              error={xSocial.error}
              isLoading={isLoading}
              onConfirmFollow={confirmXFollow}
              hasClickedFollow={hasClickedXFollow}
              onFollowClick={markXFollowClicked}
            />
          )}

          {/* Farcaster */}
          {fcSocial && (
            <SocialFollowCard
              platform="farcaster"
              username={fcSocial.username}
              profileUrl={fcSocial.profileUrl}
              isFollowing={fcSocial.isFollowing}
              verified={fcSocial.verified}
              error={fcSocial.error}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Social requirement status */}
        <div
          className={`text-sm font-medium ${
            passesSocialRequirement ? "text-green-600" : "text-foreground/50"
          }`}
        >
          {passesSocialRequirement
            ? "Social requirement met"
            : "Social requirement not met"}
        </div>
      </section>

      {/* Share Requirement Section - Only shown in miniapp context */}
      {isMiniApp && (
        <section className="space-y-2 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <h2 className="font-serif text-lg">Share Requirement</h2>
            <span className="text-sm text-foreground/50">
              Must share to pass
            </span>
          </div>

          <ShareCard
            hasShared={share?.hasShared ?? false}
            verified={share?.verified ?? false}
            error={share?.error ?? null}
            isLoading={isLoading}
            onShare={shareCast}
          />

          {/* Share requirement status */}
          <div
            className={`text-sm font-medium ${
              passesShareRequirement ? "text-green-600" : "text-foreground/50"
            }`}
          >
            {passesShareRequirement
              ? "Share requirement met"
              : "Share requirement not met"}
          </div>
        </section>
      )}

      {/* Action Section */}
      <section className="pt-3 sm:pt-4 border-t border-foreground/10">
        {isEligible ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-medium">
              You meet all eligibility requirements!
            </p>
            <button
              onClick={addToAllowlist}
              disabled={isAdding}
              className="px-6 py-3 min-h-[44px] bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? "Adding..." : "Join Allowlist"}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-foreground/50">
              Complete the requirements above to join the allowlist.
            </p>
            <button
              disabled
              className="px-6 py-3 min-h-[44px] bg-foreground/20 text-foreground/50 font-medium cursor-not-allowed"
            >
              Join Allowlist
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
