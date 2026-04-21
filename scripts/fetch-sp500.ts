import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

type FinnhubConstituentsResponse = {
  constituents?: string[];
};

type FinnhubQuote = {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSp500Constituents(): Promise<string[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY is not set");
  }

  const url = `https://finnhub.io/api/v1/index/constituents?symbol=%5EGSPC&token=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`構成銘柄取得失敗: ${res.status}`);
  }

  const data = (await res.json()) as FinnhubConstituentsResponse;
  return data.constituents ?? [];
}

async function fetchQuote(symbol: string): Promise<FinnhubQuote> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY is not set");
  }

  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`${symbol} 取得失敗: ${res.status}`);
  }

  return (await res.json()) as FinnhubQuote;
}

async function main() {
  console.log("SP500 既存データ削除開始...");

  const { error: deleteError } = await supabase
    .from("rankings")
    .delete()
    .eq("market", "sp500");

  if (deleteError) {
    console.error("削除エラー:", deleteError.message);
    process.exit(1);
  }

  console.log("SP500 既存データ削除完了");

  const symbols = await fetchSp500Constituents();
  console.log("構成銘柄数:", symbols.length);

  const rows: {
    code: string;
    name: string;
    price: number;
    change_rate: number;
    change_value: number;
    volume: number;
    rank_type: "up" | "down";
    market: "sp500";
  }[] = [];

  for (const symbol of symbols) {
    try {
      const q = await fetchQuote(symbol);

      if (!q.c || q.c <= 0) {
        continue;
      }

      rows.push({
        code: symbol,
        name: symbol,
        price: q.c,
        change_rate: q.dp,
        change_value: q.d,
        volume: 0,
        rank_type: q.dp >= 0 ? "up" : "down",
        market: "sp500",
      });

      console.log("取得:", symbol, q.c, q.d, q.dp);
      await sleep(300);
    } catch (e) {
      console.log("skip:", symbol);
    }
  }

  const up = [...rows]
    .filter((item) => item.change_rate >= 0)
    .sort((a, b) => b.change_rate - a.change_rate)
    .slice(0, 10);

  const down = [...rows]
    .filter((item) => item.change_rate < 0)
    .sort((a, b) => a.change_rate - b.change_rate)
    .slice(0, 10);

  const finalRows = [...up, ...down];

  const { error } = await supabase.from("rankings").insert(finalRows);

  if (error) {
    console.error("保存エラー:", error.message);
    process.exit(1);
  }

  console.log("SP500 保存完了:", finalRows.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});