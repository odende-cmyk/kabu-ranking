"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Ranking } from "./page";

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
}: {
  title: string;
  titleColor: string;
  items: Ranking[];
}) {
  return (
    <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
      <h3 className={`text-2xl font-bold mb-6 ${titleColor}`}>{title}</h3>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id}
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
                  <span>前日比: {formatChangeValue(item.change_value, item.market)}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`text-xl font-bold ${
                    item.change_rate >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.change_rate >= 0 ? "+" : ""}
                  {item.change_rate}%
                </p>
                <p className="mt-1 text-xs text-zinc-500">騰落率</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
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

  const current = useMemo(() => {
    if (activeTab === "jp") {
      return {
        title: "日本株ランキング",
        description: "株価・前日比・騰落率をまとめて表示",
        up: jpUp,
        down: jpDown,
      };
    }

    return {
      title: "アメリカ株ランキング",
      description: "米国株も同じレイアウトで比較しやすく表示",
      up: usUp,
      down: usDown,
    };
  }, [activeTab, jpUp, jpDown, usUp, usDown]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">{current.title}</h2>
          <p className="text-zinc-500 mt-1 text-sm">{current.description}</p>
        </div>

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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <RankingCard
          title="値上がり率ランキング"
          titleColor="text-emerald-400"
          items={current.up}
        />
        <RankingCard
          title="値下がり率ランキング"
          titleColor="text-rose-400"
          items={current.down}
        />
      </div>
    </section>
  );
}