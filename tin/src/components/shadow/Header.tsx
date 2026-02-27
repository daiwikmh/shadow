'use client';

import { useState, useCallback } from 'react';

interface HeaderProps {
  price: number;
  change24h: number;
  walletAddress: string | null;
  onWalletConnect: (address: string) => void;
}

export default function Header({ price, change24h, walletAddress, onWalletConnect }: HeaderProps) {
  const [connecting, setConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not found. Please install it.');
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts[0]) onWalletConnect(accounts[0]);
    } catch (err) {
      console.error('Wallet connect failed:', err);
    } finally {
      setConnecting(false);
    }
  }, [onWalletConnect]);

  const truncate = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const priceStr = price > 0
    ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  const changeStr = change24h !== 0
    ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`
    : '';

  const changeColor = change24h >= 0 ? 'text-[#00D897]' : 'text-[#FF3B5C]';

  return (
    <header
      className="flex items-center justify-between px-5 h-12 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-[#7C5CFC] text-lg leading-none">◈</span>
        <span
          className="text-[#F0F0F0] text-sm font-semibold tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          SHADOW
        </span>
      </div>

      {/* Center — pair + price */}
      <div className="flex items-center gap-4">
        <span
          className="text-[#F0F0F0] text-sm font-medium"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          ETH / USDC
        </span>
        <span
          className="text-[#F0F0F0] text-sm font-semibold"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          {priceStr}
        </span>
        {changeStr && (
          <span
            className={`text-xs font-medium ${changeColor}`}
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {changeStr}
          </span>
        )}
        <span className="text-xs text-[#4A4A4A]">Sepolia</span>
      </div>

      {/* Right — wallet */}
      <div>
        {walletAddress ? (
          <span
            className="text-xs px-3 py-1.5 rounded"
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#F0F0F0',
              fontFamily: 'var(--font-geist-mono)',
            }}
          >
            {truncate(walletAddress)}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="text-xs px-3 py-1.5 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              background: '#7C5CFC',
              color: '#F0F0F0',
              fontFamily: 'var(--font-geist-mono)',
              border: 'none',
            }}
          >
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
