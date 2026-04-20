"use client";

import { useEffect, useId } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (options: Record<string, unknown>) => unknown;
    };
  }
}

type Props = {
  symbol: string;
};

export default function ChartWidget({ symbol }: Props) {
  const rawId = useId();
  const containerId = `tv-chart-${rawId.replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const renderWidget = () => {
      if (cancelled) return;
      if (!window.TradingView) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = "";

      new window.TradingView.widget({
        container_id: containerId,
        width: "100%",
        height: 420,
        symbol,
        interval: "D",
        timezone: "Asia/Tokyo",
        theme: "dark",
        style: "1",
        locale: "ja",
        toolbar_bg: "#111827",
        enable_publishing: false,
        allow_symbol_change: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
      });
    };

    if (window.TradingView) {
      renderWidget();
    } else {
      script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, containerId]);

  return <div id={containerId} style={{ width: "100%", height: 420 }} />;
}