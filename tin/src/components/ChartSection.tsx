'use client';

import { useEffect, useRef, memo } from 'react';
import {
  TRADINGVIEW_SCRIPT_URL,
  defaultTradingViewConfig,
  getTradingViewSymbol,
} from '@/utils/tradingview';

interface ChartSectionProps {
  pair?: string;
  height?: string;
}

function ChartSection({ pair = 'XLM/USDC', height = '100%' }: ChartSectionProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // 1. Clear previous widget
    container.current.innerHTML = '';

    // 2. Re-create the inner widget div
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';
    container.current.appendChild(widgetDiv);

    // 3. Create and append the script with config as innerHTML
    const script = document.createElement('script');
    script.src = TRADINGVIEW_SCRIPT_URL;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      ...defaultTradingViewConfig,
      symbol: getTradingViewSymbol(pair),
    });
    container.current.appendChild(script);
  }, [pair]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height, width: '100%' }}
    />
  );
}

export default memo(ChartSection);
