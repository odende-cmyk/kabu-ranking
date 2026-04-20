import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchUsRanking(page: any, url: string, rankType: "up" | "down") {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(5000);

  const rows = await page.locator("table tbody tr").all();

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const text = await rows[i].innerText();

    const lines = text
      .split("\n")
      .map((v: string) => v.trim())
      .filter(Boolean);

    const code = lines[0];
    const name = lines[1];

    const percentLine = lines.find((v: string) => v.includes("%")) ?? "";
    const percentMatches =
      percentLine.match(/[+-]?\d+(?:\.\d+)?%/g) ?? [];
    const firstPercent = percentMatches[0] ?? "0%";

    let changeRate = parseFloat(
      firstPercent.replace("%", "").replace("+", "")
    );

    if (rankType === "down") {
      changeRate = -Math.abs(changeRate);
    }

    const { error } = await supabase.from("rankings").insert({
      code,
      name,
      price: 0,
      change_rate: changeRate,
      volume: 0,
      rank_type: rankType,
      market: "us",
    });

    if (error) {
      console.error("保存エラー:", error.message, code, name);
    } else {
      console.log("保存:", rankType, code, name);
    }
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  console.log("米国株の既存データ削除開始...");

  const { error: deleteError } = await supabase
    .from("rankings")
    .delete()
    .eq("market", "us");

  if (deleteError) {
    console.error("削除エラー:", deleteError.message);
    await browser.close();
    return;
  }

  console.log("米国株の既存データ削除完了");

  await fetchUsRanking(
    page,
    "https://finance.yahoo.com/markets/stocks/gainers/",
    "up"
  );

  await fetchUsRanking(
    page,
    "https://finance.yahoo.com/markets/stocks/losers/",
    "down"
  );

  await browser.close();
  console.log("米国株の全処理完了");
}

main();