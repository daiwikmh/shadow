// flashbots.ts — Flashbots Sepolia bundle submission via ethers v5

import { ethers } from 'ethers';
import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
} from '@flashbots/ethers-provider-bundle';

const FLASHBOTS_RELAY = 'https://relay-sepolia.flashbots.net';
const SEPOLIA_CHAIN_ID = 11155111;

// Ephemeral auth signer (new each session — identity not tied to user wallet)
let authSigner: ethers.Wallet | null = null;
let fbProvider: FlashbotsBundleProvider | null = null;

function getAuthSigner(): ethers.Wallet {
  if (!authSigner) {
    authSigner = ethers.Wallet.createRandom();
  }
  return authSigner;
}

async function getFlashbotsProvider(
  provider: ethers.providers.Web3Provider
): Promise<FlashbotsBundleProvider> {
  if (!fbProvider) {
    fbProvider = await FlashbotsBundleProvider.create(
      provider,
      getAuthSigner(),
      FLASHBOTS_RELAY,
      SEPOLIA_CHAIN_ID
    );
  }
  return fbProvider;
}

export interface BundleResult {
  success: boolean;
  resolution?: string;
  error?: string;
}

/**
 * Simulate and submit a bundle of signed transactions via Flashbots.
 * Targets blocks +1 through +10 from current block.
 */
export async function submitBundle(
  provider: ethers.providers.Web3Provider,
  signedTxs: string[]
): Promise<BundleResult> {
  try {
    const fb = await getFlashbotsProvider(provider);
    const blockNumber = await provider.getBlockNumber();

    // Simulate first
    const simulation = await fb.simulate(signedTxs, blockNumber + 1);
    if ('error' in simulation) {
      return { success: false, error: `Simulation failed: ${simulation.error.message}` };
    }

    // Submit for blocks +1 to +10
    const targetBlocks = Array.from({ length: 10 }, (_, i) => blockNumber + 1 + i);
    const submissions = await Promise.all(
      targetBlocks.map((block) =>
        fb.sendRawBundle(signedTxs, block)
      )
    );

    // Wait for first resolution
    const firstSubmission = submissions[0];
    if ('error' in firstSubmission) {
      return { success: false, error: firstSubmission.error.message };
    }

    const resolution = await firstSubmission.wait();
    const resolutionName =
      resolution === FlashbotsBundleResolution.BundleIncluded
        ? 'BundleIncluded'
        : resolution === FlashbotsBundleResolution.AccountNonceTooHigh
        ? 'AccountNonceTooHigh'
        : 'BlockPassedWithoutInclusion';

    return {
      success: resolution === FlashbotsBundleResolution.BundleIncluded,
      resolution: resolutionName,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
