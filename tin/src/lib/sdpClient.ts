// sdpClient.ts — typed fetch wrapper for sdp-ecloud Axum backend
// Price scale: user USD → ×100 before sending (u64 cents), ÷100 on display
// Size scale:  user ETH → ×1_000_000 before sending (u64 ETH-6), ÷1_000_000 on display

const SDP_BASE = 'http://localhost:3000';

export type Side = 'buy' | 'sell';

export interface OrderRequest {
  side: Side;
  price: number;  // USD dollars — converted to cents internally
  size: number;   // ETH amount — converted to ETH-6 units internally
}

// Matches the Axum OrderResponse struct exactly
export interface OrderResponse {
  id: string;
  status: string;
}

// Matches the Axum FillInfo struct exactly
export interface FillInfo {
  buy_order_id:  string;
  sell_order_id: string;
  price:         number;   // u64 cents
  quantity:      number;   // u64 ETH-6
  tx_hash:       string | null;
  screener:      string;
}

// Matches the Axum MatchResponse struct exactly
export interface MatchResponse {
  fills:   number;        // count of fills this cycle
  results: FillInfo[];    // the actual fill records
}

export async function submitOrder(req: OrderRequest): Promise<OrderResponse> {
  const body = {
    side:          req.side,
    price:         Math.round(req.price * 100),          // dollars → cents
    quantity:      Math.round(req.size * 1_000_000),     // ETH → ETH-6
    trader_pubkey: 'anonymous',                           // replaced by wallet address in Part 2
  };

  const res = await fetch(`${SDP_BASE}/order`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`submitOrder failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function runMatch(): Promise<MatchResponse> {
  const res = await fetch(`${SDP_BASE}/match`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    '{}',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`runMatch failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  // Backend shape: { fills: usize, results: FillInfo[] }
  return {
    fills:   data.fills   ?? 0,
    results: data.results ?? [],
  };
}

export async function health(): Promise<boolean> {
  try {
    const res = await fetch(`${SDP_BASE}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    // Backend returns plain text "ok", not JSON
    const text = await res.text();
    return res.ok && text.trim() === 'ok';
  } catch {
    return false;
  }
}

/** Convert price cents (u64) → display USD string */
export function centsToUsd(cents: number): number {
  return cents / 100;
}

/** Convert ETH-6 quantity → display ETH */
export function eth6ToEth(qty: number): number {
  return qty / 1_000_000;
}
