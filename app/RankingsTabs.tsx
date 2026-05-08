"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Ranking } from "./page";

type Period = "today" | "week";

type RankingWithWeek = Ranking & {
  week_change_rate?: number;
};

function formatPrice(price?: number, market?: "jp" | "us") {
  if (price == null || Number.isNaN(price)) return "未取得";

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: market === "jp" ? "JPY" : "USD",
    maximumFractionDigits: market === "jp" ? 0 : 2,
  }).format(price);
}

function formatChangeValue(value?: number, market?: "jp" | "us") {
  if (value == null || Number.isNaN(value)) return "未取得";

  const formatted = new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: market === "jp" ? 0 : 2,
  }).format(value);

  return `${value >= 0 ? "+" : ""}${formatted}${market === "jp" ? "円" : " USD"}`;
}

function RankingCard({
  title,
  titleColor,
  items,
  period,
}: {
  title: string;
  titleColor: string;
  items: RankingWithWeek[];
  period: Period;
}) {
  return (
    <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
      <h3 className={`text-2xl font-bold mb-6 ${titleColor}`}>{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">
          データがまだありません。過去1週間ランキングは履歴が貯まると表示されます。
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const displayRate =
              period === "week" && item.week_change_rate != null
                ? item.week_change_rate
                : item.change_rate;

            return (
              <li
                key={`${item.market}-${item.code}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500 mb-1">#{index + 1}</p>

                    <Link
                      href={`/stock/${item.code}`}
                      className="block hover:opacity-90 transition-opacity"
                    >
                      <p className="font-semibold text-white leading-snug break-words">
                        {item.code} {item.name}
                      </p>
                    </Link>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                      <span>{item.market === "jp" ? "日本株" : "米国株"}</span>
                      <span>株価: {formatPrice(item.price, item.market)}</span>
                      <span>
                        前日比: {formatChangeValue(item.change_value, item.market)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-xl font-bold ${
                        displayRate >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {displayRate >= 0 ? "+" : ""}
                      {displayRate.toFixed(2)}%
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {period === "week" ? "7日騰落率" : "騰落率"}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function RankingsTabs({
  jpUp,
  jpDown,
  usUp,
  usDown,
}: {
  jpUp: Ranking[];
  jpDown: Ranking[];
  usUp: Ranking[];
  usDown: Ranking[];
}) {
  const [activeTab, setActiveTab] = useState<"jp" | "us">("jp");
  const [period, setPeriod] = useState<Period>("today");
  const [apiData, setApiData] = useState<{
    up: RankingWithWeek[];
    down: RankingWithWeek[];
  }>({
    up: [],
    down: [],
  });

  useEffect(() => {
    fetch(`/api/rankings?market=${activeTab}&period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        setApiData({
          up: json.up ?? [],
          down: json.down ?? [],
        });
      })
      .catch((error) => {
        console.error("rankings fetch error:", error);
        setApiData({ up: [], down: [] });
      });
  }, [activeTab, period]);

  const current = useMemo(() => {
    if (period === "today") {
      if (activeTab === "jp") {
        const weekUp = [...apiData.up, ...apiData.down]
  .filter((item) => item.week_change_rate != null)
  .filter((item) => item.week_change_rate! > 0)
  .sort((a, b) => b.week_change_rate! - a.week_change_rate!)
  .slice(0, 10);

const weekDown = [...apiData.up, ...apiData.down]
  .filter((item) => item.week_change_rate != null)
  .filter((item) => item.week_change_rate! < 0)
  .sort((a, b) => a.week_change_rate! - b.week_change_rate!)
  .slice(0, 10);

return {
  title: activeTab === "jp" ? "日本株ランキング" : "アメリカ株ランキング",
  description: "過去1週間の上昇率・下落率を表示",
  up: weekUp,
  down: weekDown,
};
      }

      return {
        title: "アメリカ株ランキング",
        description: "米国株も同じレイアウトで比較しやすく表示",
        up: usUp,
        down: usDown,
      };
    }

    return {
      title: activeTab === "jp" ? "日本株ランキング" : "アメリカ株ランキング",
      description: "過去1週間の上昇率・下落率を表示",
      up: apiData.up,
      down: apiData.down,
    };
  }, [activeTab, period, jpUp, jpDown, usUp, usDown, apiData]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">{current.title}</h2>
          <p className="text-zinc-500 mt-1 text-sm">{current.description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("jp")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "jp"
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              日本株
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("us")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "us"
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              米国株
            </button>
          </div>

          <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setPeriod("today")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                period === "today"
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              今日
            </button>
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                period === "week"
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              過去1週間
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <RankingCard
          title="値上がり率ランキング"
          titleColor="text-emerald-400"
          items={current.up}
          period={period}
        />
        <RankingCard
          title="値下がり率ランキング"
          titleColor="text-rose-400"
          items={current.down}
          period={period}
        />
      </div>
    </section>
  );
}