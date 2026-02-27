// alchemyPrice.ts — Chainlink ETH/USD price feed via Alchemy Sepolia RPC


// Chainlink ETH/USD aggregator on Sepolia
const CHAINLINK_ETH_USD = '0x694AA1769357215DE4FAC081bf1f309aDC325306';

// latestAnswer() selector: keccak256("latestAnswer()") = 0x50d25bcd
const LATEST_ANSWER_SELECTOR = '0x50d25bcd';
// latestTimestamp() selector: keccak256("latestTimestamp()") = 0x8205bf6a
const LATEST_TIMESTAMP_SELECTOR = '0x8205bf6a';

export interface PriceData {
  price: number;
  change24h: number;
}

let prevPrice: number | null = null;

async function ethCall(to: string, data: string): Promise<string> {
  const res = await fetch(ALCHEMY_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  });

  if (!res.ok) throw new Error(`eth_call failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`eth_call error: ${json.error.message}`);
  return json.result as string;
}

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

export async function getEthPrice(): Promise<PriceData> {
  // Chainlink returns price with 8 decimals for ETH/USD
  const rawHex = await ethCall(CHAINLINK_ETH_USD, LATEST_ANSWER_SELECTOR);
  const rawPrice = hexToNumber(rawHex);
  const price = rawPrice / 1e8;

  // Calculate pseudo-change from previous reading
  let change24h = 0;
  if (prevPrice !== null && prevPrice !== 0) {
    change24h = ((price - prevPrice) / prevPrice) * 100;
  }

  prevPrice = price;

  return { price, change24h };
}
