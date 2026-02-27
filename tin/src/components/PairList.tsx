'use client';

import { TradingPair } from '@/configs/tradingPairs';
import PairRow from './PairRow';

interface PairListProps {
  pairs: TradingPair[];
  selectedPair: string;
  onSelect: (symbol: string) => void;
}

export default function PairList({ pairs, selectedPair, onSelect }: PairListProps) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.08] bg-[#0F0F0F] overflow-y-auto">
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Markets
        </h2>
      </div>

      <div className="flex flex-col">
        {pairs.map((pair) => (
          <PairRow
            key={pair.symbol}
            pair={pair}
            isSelected={pair.symbol === selectedPair}
            onClick={() => onSelect(pair.symbol)}
          />
        ))}
      </div>
    </aside>
  );
}
