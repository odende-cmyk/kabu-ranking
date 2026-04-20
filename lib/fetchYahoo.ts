import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchRanking(page: any, url: string, rankType: "up" | "down") {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const rows = await page.locator("table tbody tr").all();

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const text = await rows[i].innerText();

    const lines = text
      .split("\n")
      .map((v: string) => v.trim())
      .filter(Boolean);

    const first = lines[0].split("\t");

    const name = first[1];
    const code = lines[1];

    const changeRate = parseFloat(
      (lines.find((v: string) => v.includes("%")) ?? "0")
        .replace("%", "")
        .replace("+", "")
    );

    const volume = parseInt(
      lines[lines.length - 1]
        .replace("株", "")
        .replace(/,/g, "")
    );

    await supabase.from("rankings").insert({
      code,
      name,
      price: 0,
      change_rate: changeRate,
      volume,
      rank_type: rankType,
    });
  }
}

export async function fetchYahoo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 古いデータ削除
  await supabase
    .from("rankings")
    .delete()
    .in("rank_type", ["up", "down"]);

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
}