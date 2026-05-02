import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function safeGoto(page: any, url: string, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`アクセス開始 (${i}/${retries}): ${url}`);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });

      await page.waitForSelector("table tbody tr", { timeout: 30000 });

      console.log(`アクセス成功: ${url}`);
      return;
    } catch (error) {
      console.warn(`goto失敗 (${i}/${retries}): ${url}`);

      if (i === retries) {
        throw error;
      }

      await page.waitForTimeout(5000);
    }
  }
}

async function fetchRanking(page: any, url: string, rankType: "up" | "down") {
  await safeGoto(page, url);
  await page.waitForTimeout(3000);

  const tableRows = await page.locator("table tbody tr").all();

  for (let i = 0; i < Math.min(tableRows.length, 10); i++) {
    const text = await tableRows[i].innerText();

    const lines = text
      .split("\n")
      .map((v: string) => v.trim())
      .filter(Boolean);

    console.log("取得行:", lines);

    const first = lines[0]?.split("\t") ?? [];
    const name = first[1] ?? "";
    const code = lines[1] ?? "";

    const price = parseFloat((lines[4] ?? "0").replace(/,/g, ""));
    const changeValue = parseFloat((lines[6] ?? "0").replace(/,/g, ""));

    let changeRate = parseFloat(
      (lines[7] ?? "0").replace("%", "").replace("+", "").replace(/,/g, "")
    );

    if (rankType === "down") {
      changeRate = -Math.abs(changeRate);
    }

    const volume = parseInt(
      (lines[lines.length - 1] ?? "0")
        .replace("株", "")
        .replace(/,/g, ""),
      10
    );

    if (!code || !name) {
      console.warn("コードまたは銘柄名の取得失敗:", { lines });
      continue;
    }

    if (Number.isNaN(price) || price <= 0) {
      console.warn("株価の取得失敗:", { code, name, lines });
      continue;
    }

    if (Number.isNaN(changeValue)) {
      console.warn("前日比の取得失敗:", { code, name, lines });
      continue;
    }

    if (Number.isNaN(changeRate)) {
      console.warn("騰落率の取得失敗:", { code, name, lines });
      continue;
    }

    const row = {
      code,
      name,
      price,
      change_rate: changeRate,
      change_value: changeValue,
      volume: Number.isNaN(volume) ? 0 : volume,
      rank_type: rankType,
      market: "jp",
    };

    const rows = [row];

    const { error: rankingError } = await supabase
      .from("rankings")
      .upsert(rows, {
        onConflict: "code,market,date",
      });

    if (rankingError) {
      console.error("ranking insert error:", rankingError);
      continue;
    }

    const today = new Date().toISOString().slice(0, 10);

    const historyRows = rows.map((row) => ({
      code: row.code,
      market: "jp",
      price: row.price,
      change_rate: row.change_rate,
      change_value: row.change_value,
      date: today,
    }));

    const { error: historyError } = await supabase
      .from("stock_prices")
      .upsert(historyRows, {
        onConflict: "code,market,date",
      });

    if (historyError) {
      console.error("history insert error:", historyError);
      continue;
    }

    console.log(
      "保存:",
      rankType,
      code,
      name,
      price,
      changeValue,
      changeRate
    );
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  console.log("既存データ削除開始...");

  const { error: deleteError } = await supabase
    .from("rankings")
    .delete()
    .eq("market", "jp");

  if (deleteError) {
    console.error("削除エラー:", deleteError.message);
    await browser.close();
    return;
  }

  console.log("既存データ削除完了");

  await fetchRanking(
    page,
    "https://finance.yahoo.co.jp/stocks/ranking/up",
    "up"
  );

  await fetchRanking(
    page,
    "https://finance.yahoo.co.jp/stocks/ranking/down",
    "down"
  );

  await browser.close();
  console.log("全処理完了");
}

main();