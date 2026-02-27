'use client';

import { useState } from 'react';
import { submitOrder, type Side, type OrderResponse } from '@/lib/sdpClient';

export interface LocalOrder {
  id: string;
  side: Side;
  price: number;   // USD
  size: number;    // ETH
  status: 'pending' | 'matched';
  timestamp: number;
}

interface OrderPanelProps {
  ethPrice: number;
  onSubmit: (order: LocalOrder) => void;
}

export default function OrderPanel({ ethPrice, onSubmit }: OrderPanelProps) {
  const [side, setSide] = useState<Side>('buy');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const estValue =
    price && size
      ? `≈ $${(parseFloat(price) * parseFloat(size)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    const priceNum = parseFloat(price);
    const sizeNum = parseFloat(size);
    if (!priceNum || !sizeNum || priceNum <= 0 || sizeNum <= 0) {
      showToast('Enter a valid price and size');
      return;
    }

    setSubmitting(true);
    try {
      const resp: OrderResponse = await submitOrder({ side, price: priceNum, size: sizeNum });
      const order: LocalOrder = {
        id: resp.id ?? `loc-${Date.now()}`,
        side,
        price: priceNum,
        size: sizeNum,
        status: 'pending',
        timestamp: Date.now(),
      };
      onSubmit(order);
      showToast(`Queued • #${order.id.slice(0, 6)}`);
      setPrice('');
      setSize('');
    } catch (err) {
      showToast(`Error: ${String(err).slice(0, 60)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const monoFont = { fontFamily: 'var(--font-geist-mono)' };

  return (
    <div
      className="flex flex-col gap-0 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}
    >
      {/* Header */}
      <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-3" style={monoFont}>
        Dark Order
      </p>

      {/* Side tabs */}
      <div
        className="flex rounded overflow-hidden mb-4"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => setSide('buy')}
          className="flex-1 py-2 text-xs font-semibold transition-colors"
          style={{
            ...monoFont,
            background: side === 'buy' ? 'rgba(0,216,151,0.15)' : 'transparent',
            color: side === 'buy' ? '#00D897' : '#4A4A4A',
            border: 'none',
            borderBottom: side === 'buy' ? '2px solid #00D897' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('sell')}
          className="flex-1 py-2 text-xs font-semibold transition-colors"
          style={{
            ...monoFont,
            background: side === 'sell' ? 'rgba(255,59,92,0.15)' : 'transparent',
            color: side === 'sell' ? '#FF3B5C' : '#4A4A4A',
            border: 'none',
            borderBottom: side === 'sell' ? '2px solid #FF3B5C' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          SELL
        </button>
      </div>

      {/* Price input */}
      <div className="flex flex-col gap-1 mb-3">
        <label className="text-[10px] text-[#4A4A4A] uppercase tracking-widest" style={monoFont}>
          Price (USD)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={ethPrice > 0 ? ethPrice.toFixed(2) : '0.00'}
          className="w-full px-3 py-2 text-sm rounded outline-none"
          style={{
            ...monoFont,
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#F0F0F0',
          }}
        />
      </div>

      {/* Size input */}
      <div className="flex flex-col gap-1 mb-3">
        <label className="text-[10px] text-[#4A4A4A] uppercase tracking-widest" style={monoFont}>
          Size (ETH)
        </label>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="0.0000"
          className="w-full px-3 py-2 text-sm rounded outline-none"
          style={{
            ...monoFont,
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#F0F0F0',
          }}
        />
      </div>

      {/* Est value */}
      {estValue && (
        <p className="text-xs text-[#4A4A4A] mb-3" style={monoFont}>
          {estValue}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 text-sm font-semibold rounded transition-all disabled:opacity-50"
        style={{
          ...monoFont,
          background: '#7C5CFC',
          color: '#F0F0F0',
          border: 'none',
          cursor: submitting ? 'wait' : 'pointer',
          boxShadow: submitting ? 'none' : '0 0 0 0 rgba(124,92,252,0)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(124,92,252,0.4)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        {submitting ? 'Submitting…' : 'Place Dark Order'}
      </button>

      {/* Toast */}
      {toast && (
        <p className="text-xs mt-2 text-center" style={{ ...monoFont, color: '#7C5CFC' }}>
          {toast}
        </p>
      )}
    </div>
  );
}
