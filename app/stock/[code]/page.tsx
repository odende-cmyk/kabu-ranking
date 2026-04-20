import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatPrice(price?: number, market?: "jp" | "us") {
  if (price == null) return "未取得";

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: market === "jp" ? "JPY" : "USD",
    maximumFractionDigits: market === "jp" ? 0 : 2,
  }).format(price);
}

function getYahooUrl(code: string, market: "jp" | "us") {
  if (market === "jp") {
    return `https://finance.yahoo.co.jp/quote/${code}.T`;
  }

  return `https://finance.yahoo.com/quote/${code}`;
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

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-block text-zinc-400 hover:text-white"
        >
          ← ランキング一覧に戻る
        </Link>

        <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                {stock.market === "jp" ? "日本株" : "アメリカ株"}
              </p>
              <h1 className="text-4xl font-bold">
                {stock.code} {stock.name}
              </h1>
            </div>

            <a
              href={getYahooUrl(stock.code, stock.market)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
            >
              Yahoo Financeでチャートを見る
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 rounded-2xl p-5">
              <p className="text-sm text-zinc-400 mb-2">株価</p>
              <p className="text-3xl font-bold">
                {formatPrice(stock.price, stock.market)}
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5">
              <p className="text-sm text-zinc-400 mb-2">騰落率</p>
              <p
                className={`text-3xl font-bold ${
                  stock.change_rate >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {stock.change_rate >= 0 ? "+" : ""}
                {stock.change_rate}%
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5">
  <p className="text-sm text-zinc-400 mb-2">前日比</p>
  <p
    className={`text-2xl font-bold ${
      stock.change_value >= 0 ? "text-emerald-400" : "text-rose-400"
    }`}
  >
    {stock.change_value >= 0 ? "+" : ""}
    {new Intl.NumberFormat("ja-JP", {
      maximumFractionDigits: stock.market === "jp" ? 0 : 2,
    }).format(stock.change_value)}
    {stock.market === "jp" ? "円" : " USD"}
  </p>
</div>

            <div className="bg-zinc-900 rounded-2xl p-5">
              <p className="text-sm text-zinc-400 mb-2">市場</p>
              <p className="text-2xl font-bold">
                {stock.market === "jp" ? "日本株" : "アメリカ株"}
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 md:col-span-2">
              <p className="text-sm text-zinc-400 mb-2">最終更新</p>
              <p className="text-xl font-bold">
                {formatJst(stock.created_at)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}