'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { runMatch, centsToUsd, eth6ToEth, type FillInfo } from '@/lib/sdpClient';

interface EnrichedFill extends FillInfo {
  key: string;
  timestamp: number;
  isNew: boolean;
}

interface FillFeedProps {
  onNewFill?: (fills: FillInfo[]) => void;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function truncateId(id: string): string {
  return id.length > 6 ? `0x${id.slice(0, 6)}…` : id;
}

export default function FillFeed({ onNewFill }: FillFeedProps) {
  const [fills, setFills] = useState<EnrichedFill[]>([]);
  const [, setTick] = useState(0);
  const seenKeys = useRef(new Set<string>());

  // Re-render every second to update "Xs ago" times
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const poll = useCallback(async () => {
    try {
      const { results: raw } = await runMatch();
      if (!raw || raw.length === 0) return;

      const now = Date.now();
      const newFills: EnrichedFill[] = [];

      for (const f of raw) {
        const key = `${f.buy_order_id}-${f.sell_order_id}`;
        if (!seenKeys.current.has(key)) {
          seenKeys.current.add(key);
          newFills.push({ ...f, key, timestamp: now, isNew: true });
        }
      }

      if (newFills.length > 0) {
        onNewFill?.(raw);
        setFills((prev) => {
          const combined = [...newFills, ...prev.map((f) => ({ ...f, isNew: false }))];
          return combined.slice(0, 20);
        });

        // Clear isNew after animation
        setTimeout(() => {
          setFills((prev) =>
            prev.map((f) => (newFills.some((nf) => nf.key === f.key) ? { ...f, isNew: false } : f))
          );
        }, 2000);
      }
    } catch {
      // silently ignore match errors
    }
  }, [onNewFill]);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [poll]);

  const monoFont = { fontFamily: 'var(--font-geist-mono)' };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#00D897] animate-pulse" />
        <span className="text-[10px] text-[#4A4A4A] uppercase tracking-widest" style={monoFont}>
          Fill Feed
        </span>
      </div>

      {/* Feed rows */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-2">
        {fills.length === 0 ? (
          <p className="text-xs text-[#4A4A4A] py-4 text-center" style={monoFont}>
            Waiting for fills…
          </p>
        ) : (
          fills.map((fill) => {
            // Determine display side: maker is typically the passive side
            // We show the fill as a neutral event
            const price = centsToUsd(fill.price);
            const sizeEth = eth6ToEth(fill.quantity);
            const priceStr = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const sizeStr = sizeEth.toFixed(4);

            return (
              <div
                key={fill.key}
                className="flex items-center gap-2 py-1.5 text-xs"
                style={{
                  ...monoFont,
                  opacity: fill.isNew ? 1 : 0.7,
                  transition: 'opacity 0.5s',
                }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${fill.isNew ? 'animate-pulse' : ''}`}
                  style={{ background: '#00D897' }}
                />
                <span className="text-[#4A4A4A]">{truncateId(fill.buy_order_id)}</span>
                <span className="text-[#F0F0F0]">{sizeStr} ETH</span>
                <span className="text-[#4A4A4A]">@</span>
                <span className="text-[#F0F0F0]">{priceStr}</span>
                <span className="text-[#4A4A4A] ml-auto">{timeAgo(fill.timestamp)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
