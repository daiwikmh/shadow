'use client';

import { useState, useEffect, useCallback } from 'react';
import ChartSection from '@/components/ChartSection';
import Header from '@/components/shadow/Header';
import OrderPanel, { type LocalOrder } from '@/components/shadow/OrderPanel';
import FillFeed from '@/components/shadow/FillFeed';
import MyOrders from '@/components/shadow/MyOrders';
import AttestationBar from '@/components/shadow/AttestationBar';
import { getEthPrice } from '@/lib/alchemyPrice';
import { health, type FillInfo } from '@/lib/sdpClient';

export default function ShadowPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [myOrders, setMyOrders] = useState<LocalOrder[]>([]);
  const [fills, setFills] = useState<FillInfo[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);

  // Try reconnect wallet if already authorized
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: unknown) => {
        const accs = accounts as string[];
        if (accs && accs.length > 0) setWalletAddress(accs[0]);
      })
      .catch(() => {});
  }, []);

  // Poll ETH price every 15s
  const fetchPrice = useCallback(async () => {
    try {
      const { price, change24h: c } = await getEthPrice();
      setEthPrice(price);
      setChange24h(c);
    } catch {
      // keep previous price
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const timer = setInterval(fetchPrice, 15_000);
    return () => clearInterval(timer);
  }, [fetchPrice]);

  // Poll health every 10s
  const checkHealth = useCallback(async () => {
    const ok = await health();
    setBackendOnline(ok);
  }, []);

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 10_000);
    return () => clearInterval(timer);
  }, [checkHealth]);

  const handleOrder = useCallback((order: LocalOrder) => {
    setMyOrders((prev) => [order, ...prev]);
  }, []);

  const handleFill = useCallback((newFills: FillInfo[]) => {
    setFills((prev) => {
      const combined = [...newFills, ...prev];
      // deduplicate by order IDs
      const seen = new Set<string>();
      return combined.filter((f) => {
        const key = `${f.buy_order_id}-${f.sell_order_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080808' }}>
      <Header
        price={ethPrice}
        change24h={change24h}
        walletAddress={walletAddress}
        onWalletConnect={setWalletAddress}
      />

      <main className="flex flex-1 min-h-0">
        {/* Left: chart + fill feed */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 min-h-0">
            <ChartSection pair="ETH/USDC" />
          </div>
          <div style={{ height: '160px', flexShrink: 0 }}>
            <FillFeed onNewFill={handleFill} />
          </div>
        </div>

        {/* Right sidebar */}
        <aside
          className="flex flex-col"
          style={{
            width: '320px',
            flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: '#0D0D0D',
          }}
        >
          <OrderPanel ethPrice={ethPrice} onSubmit={handleOrder} />
          <MyOrders pendingOrders={myOrders} fills={fills} />
        </aside>
      </main>

      <AttestationBar online={backendOnline} />
    </div>
  );
}
