export interface TradingPair {
  symbol:     string;
  baseToken:  string;
  quoteToken: string;
  price:      number;
  change24h:  number;
  volume24h:  number;
  baseLogo:   string;
  quoteLogo:  string;
}

const ETH_USDC: TradingPair = {
  symbol: 'ETH/USDC', baseToken: 'ETH', quoteToken: 'USDC',
  price: 0, change24h: 0, volume24h: 0,
  baseLogo: '/eth.png', quoteLogo: '/usdc.png',
};

const PAIRS: TradingPair[] = [ETH_USDC];

export function getTradingPairs(): TradingPair[] {
  return PAIRS;
}

export const tradingPairs = PAIRS;
