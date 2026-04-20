import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChartWidget from "./ChartWidget";

type Ranking = {
  id: number;
  code: string;
  name: string;
  price: number;
  change_rate: number;
  change_value: number;
  rank_type: "up" | "down";
  market: "jp" | "us";
  created_at: string;
};

function formatJst(dateString?: string) {
  if (!dateString) return "未取得";

  const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(dateString)
    ? dateString
    : `${dateString}Z`;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "未取得";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

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

function getYahooUrl(code: string, market: "jp" | "us") {
  if (market === "jp") {
    return `https://finance.yahoo.co.jp/quote/${code}.T`;
  }
  return `https://finance.yahoo.com/quote/${code}`;
}

function getTradingViewSymbol(code: string, market: "jp" | "us") {
  if (market === "jp") {
    return `TSE:${code}`;
  }
  return code;
}

export async function generateMetadata({
    params,
  }: {
    params: { code: string };
  }) {
    return {
      title: `${params.code} 株価・チャート・前日比 | 株式ランキング`,
      description: `${params.code} の株価、前日比、騰落率、チャートを確認できます。${params.code}の最新情報をリアルタイム更新。日本株・米国株に対応。`,
    };
  }

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const { data } = await supabase
    .from("rankings")
    .select("*")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1);

  const stock = data?.[0] as Ranking | undefined;

  if (!stock) {
    notFound();
  }

  const isUp = stock.change_rate >= 0;
  const yahooUrl = getYahooUrl(stock.code, stock.market);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
        >
          ← ランキング一覧に戻る
        </Link>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-zinc-300">
                  {stock.market === "jp" ? "日本株" : "米国株"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-medium ${
                    isUp
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {isUp ? "上昇銘柄" : "下落銘柄"}
                </span>
              </div>

              <div>
                <p className="text-zinc-400 text-sm mb-2">銘柄コード</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {stock.code}
                </h1>
                <p className="mt-3 text-xl md:text-2xl text-zinc-200">
                  {stock.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={yahooUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Yahoo Financeで詳細を見る
              </a>
              <p className="text-xs text-zinc-500">
                最終更新: {formatJst(stock.created_at)}（日本時間）
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400 mb-2">株価</p>
            <p className="text-3xl md:text-4xl font-bold">
              {formatPrice(stock.price, stock.market)}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400 mb-2">前日比</p>
            <p
              className={`text-3xl md:text-4xl font-bold ${
                stock.change_value >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatChangeValue(stock.change_value, stock.market)}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400 mb-2">騰落率</p>
            <p
              className={`text-3xl md:text-4xl font-bold ${
                stock.change_rate >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stock.change_rate >= 0 ? "+" : ""}
              {stock.change_rate}%
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">チャート</h2>
              <p className="text-sm text-zinc-500 mt-1">
                {stock.market === "jp"
                  ? "日本株は外部チャートで確認"
                  : "日足ベースで値動きを確認"}
              </p>
            </div>
          </div>

          {stock.market === "us" ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">
              <ChartWidget symbol={getTradingViewSymbol(stock.code, stock.market)} />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center">
              <p className="text-lg font-semibold">日本株チャートは外部ページで確認できます</p>
              <p className="mt-2 text-sm text-zinc-400">
                Yahoo Finance のチャートページに移動します
              </p>
              <a
                href={yahooUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Yahoo Financeでチャートを見る
              </a>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400 mb-2">市場</p>
            <p className="text-2xl font-bold">
              {stock.market === "jp" ? "日本株" : "米国株"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400 mb-2">ランキング区分</p>
            <p className="text-2xl font-bold">
              {stock.rank_type === "up" ? "値上がり率ランキング" : "値下がり率ランキング"}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}