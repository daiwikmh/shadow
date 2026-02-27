'use client';

import { type LocalOrder } from '@/components/shadow/OrderPanel';
import { type FillInfo, centsToUsd } from '@/lib/sdpClient';

interface MyOrdersProps {
  pendingOrders: LocalOrder[];
  fills: FillInfo[];
}

function formatPrice(usd: number): string {
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MyOrders({ pendingOrders, fills }: MyOrdersProps) {
  const monoFont = { fontFamily: 'var(--font-geist-mono)' };

  // Check which orders appear in fills (match by price proximity)
  const matchedIds = new Set<string>();
  for (const order of pendingOrders) {
    for (const fill of fills) {
      const fillPrice = centsToUsd(fill.price);
      if (Math.abs(fillPrice - order.price) < 0.01) {
        matchedIds.add(order.id);
      }
    }
  }

  const pendingList = pendingOrders.filter((o) => !matchedIds.has(o.id));
  const matchedList = pendingOrders.filter((o) => matchedIds.has(o.id));

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: '#0D0D0D' }}>
      {/* Header */}
      <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] text-[#4A4A4A] uppercase tracking-widest" style={monoFont}>
          My Orders
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-2">
        {/* Pending section */}
        <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-2 mt-1" style={monoFont}>
          Pending
        </p>
        {pendingList.length === 0 ? (
          <p className="text-xs text-[#4A4A4A] mb-3" style={monoFont}>—</p>
        ) : (
          <div className="flex flex-col gap-1 mb-4">
            {pendingList.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-2 text-xs py-1"
                style={monoFont}
              >
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: order.side === 'buy' ? 'rgba(0,216,151,0.15)' : 'rgba(255,59,92,0.15)',
                    color: order.side === 'buy' ? '#00D897' : '#FF3B5C',
                  }}
                >
                  {order.side.toUpperCase()}
                </span>
                <span className="text-[#F0F0F0]">{order.size.toFixed(4)} ETH</span>
                <span className="text-[#4A4A4A]">{formatPrice(order.price)}</span>
                <span className="ml-auto text-base leading-none" title="Pending">⏳</span>
              </div>
            ))}
          </div>
        )}

        {/* Matched section */}
        <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-2" style={monoFont}>
          Matched
        </p>
        {matchedList.length === 0 ? (
          <p className="text-xs text-[#4A4A4A]" style={monoFont}>—</p>
        ) : (
          <div className="flex flex-col gap-1">
            {matchedList.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-2 text-xs py-1"
                style={monoFont}
              >
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: order.side === 'buy' ? 'rgba(0,216,151,0.15)' : 'rgba(255,59,92,0.15)',
                    color: order.side === 'buy' ? '#00D897' : '#FF3B5C',
                  }}
                >
                  {order.side.toUpperCase()}
                </span>
                <span className="text-[#F0F0F0]">{order.size.toFixed(4)} ETH</span>
                <span className="text-[#4A4A4A]">{formatPrice(order.price)}</span>
                <span className="ml-auto text-base leading-none" title="Matched">✅</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
