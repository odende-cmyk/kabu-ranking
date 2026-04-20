"use client";

type Props = {
  symbol: string;
};

export default function ChartWidget({ symbol }: Props) {
  const isJapan = symbol.startsWith("TSE:");
  const baseUrl = isJapan
    ? "https://jp.tradingview.com/widgetembed/"
    : "https://www.tradingview.com/widgetembed/";

  const src = `${baseUrl}?symbol=${encodeURIComponent(
    symbol
  )}&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=111827&theme=dark&style=1&timezone=Asia%2FTokyo&locale=ja`;

  return (
    <iframe
      src={src}
      title={`TradingView Chart ${symbol}`}
      style={{
        width: "100%",
        height: "420px",
        border: "none",
      }}
      allowTransparency={true}
      scrolling="no"
    />
  );
}