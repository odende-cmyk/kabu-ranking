import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const market = searchParams.get("market") ?? "jp";
  const period = searchParams.get("period") ?? "today";

  // 👇 最新ランキング取得
  const { data: rankings, error } = await supabase
    .from("rankings")
    .select("*")
    .eq("market", market);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 👇 今日ランキング
  if (period === "today") {
    return NextResponse.json({
      up: rankings?.filter((r) => r.rank_type === "up") ?? [],
      down: rankings?.filter((r) => r.rank_type === "down") ?? [],
    });
  }

  // 👇 7日前の日付
  const target = new Date();
  target.setDate(target.getDate() - 7);
  const targetDate = target.toISOString().slice(0, 10);

  const codes = rankings?.map((r) => r.code) ?? [];

  // 👇 過去データ取得
  const { data: histories, error: historyError } = await supabase
    .from("stock_prices")
    .select("*")
    .eq("market", market)
    .in("code", codes)
    .lte("date", targetDate)
    .order("date", { ascending: false });

  if (historyError) {
    return NextResponse.json(
      { error: historyError.message },
      { status: 500 }
    );
  }

  // 👇 銘柄ごとの過去価格をマップ化
  const pastMap = new Map<string, number>();

  for (const h of histories ?? []) {
    if (!pastMap.has(h.code)) {
      pastMap.set(h.code, Number(h.price));
    }
  }

  // 👇 7日変化率計算
  const weekly = (rankings ?? [])
    .map((r) => {
      const pastPrice = pastMap.get(r.code);
      if (!pastPrice || pastPrice <= 0) return null;

      const week_change_rate =
        ((Number(r.price) - pastPrice) / pastPrice) * 100;

      return {
        ...r,
        week_change_rate,
      };
    })
    .filter(Boolean) as any[];

  return NextResponse.json({
    up: weekly
      .sort((a, b) => b.week_change_rate - a.week_change_rate)
      .slice(0, 10),
    down: weekly
      .sort((a, b) => a.week_change_rate - b.week_change_rate)
      .slice(0, 10),
  });
}