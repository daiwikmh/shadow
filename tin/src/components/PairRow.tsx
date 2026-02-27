'use client';

import { TradingPair } from '@/configs/tradingPairs';

interface PairRowProps {
  pair: TradingPair;
  isSelected: boolean;
  onClick: () => void;
}

export default function PairRow({ pair, isSelected, onClick }: PairRowProps) {
  const changePositive = pair.change24h >= 0;
  const changeColor = changePositive ? 'text-emerald-400' : 'text-red-400';
  const changePrefix = changePositive ? '+' : '';

  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
        'border-l-2',
        isSelected
          ? 'bg-white/[0.06] border-blue-500'
          : 'border-transparent hover:bg-white/[0.03]',
      ].join(' ')}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white leading-none">
          {pair.baseToken}
        </span>
        <span className="text-xs text-zinc-500 leading-none">{pair.quoteToken}</span>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-mono text-zinc-200 leading-none">
          {pair.price > 0 ? pair.price.toLocaleString() : '—'}
        </span>
        <span className={`text-xs font-mono leading-none ${changeColor}`}>
          {pair.change24h !== 0
            ? `${changePrefix}${pair.change24h.toFixed(2)}%`
            : '—'}
        </span>
      </div>
    </button>
  );
}
