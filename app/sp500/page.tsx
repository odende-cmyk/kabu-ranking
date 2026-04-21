import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { SP500_SYMBOLS } from "@/lib/sp500";

export const dynamic = "force-dynamic";

type Ranking = {
  id: number;
  code: string;
  name: string;
  price: number;
  change_rate: number;
  change_value: number;
  market: "jp" | "us";
  created_at?: string;
};

export const metadata = {
  title: "S&P500 構成銘柄の上昇率ランキング【今日】",
  description:
    "S&P500構成銘柄の中から、今日の上昇率・下落率ランキング上位10銘柄を掲載しています。",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatChangeRate(value: number) {
  return `${value >= 0 ? "+" : ""}${value}%`;
}

function formatChangeValue(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);

  return `${value >= 0 ? "+" : ""}${formatted} USD`;
}

export default async function Sp500Page() {
  const { data } = await supabase.from("rankings").select("*");

  const usStocks = ((data ?? []) as Ranking[]).filter(
    (item) => item.market === "us"
  );

  const sp500Stocks = usStocks.filter((item) =>
    SP500_SYMBOLS.includes(item.code)
  );

  const up = [...sp500Stocks]
    .filter((item) => item.change_rate >= 0)
    .sort((a, b) => b.change_rate - a.change_rate)
    .slice(0, 10);

  const down = [...sp500Stocks]
    .filter((item) => item.change_rate < 0)
    .sort((a, b) => a.change_rate - b.change_rate)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            S&amp;P500 構成銘柄の上昇率ランキング【今日】
          </h1>
          <p className="text-zinc-400">
            S&amp;P500構成銘柄の中から、今日の上昇率・下落率ランキング上位10銘柄を表示しています。
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">
            上昇率 TOP10
          </h2>

          {up.length === 0 ? (
            <p className="text-zinc-400">
              今日取得した米国株データの中に、該当するS&amp;P500銘柄がありませんでした。
            </p>
          ) : (
            <ul className="space-y-3">
              {up.map((item, i) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border border-zinc-800 rounded-2xl px-4 py-4 bg-zinc-950"
                >
                  <div className="min-w-0">
                    <Link href={`/stock/${item.code}`} className="hover:underline">
                      <p className="font-semibold break-words">
                        #{i + 1} {item.code} {item.name}
                      </p>
                    </Link>
                    <div className="mt-2 text-sm text-zinc-400 space-y-1">
                      <p>株価: {formatPrice(item.price)}</p>
                      <p>前日比: {formatChangeValue(item.change_value)}</p>
                    </div>
                  </div>

                  <p className="text-emerald-400 font-bold text-lg shrink-0">
                    {formatChangeRate(item.change_rate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-rose-400 mb-4">
            下落率 TOP10
          </h2>

          {down.length === 0 ? (
            <p className="text-zinc-400">
              今日取得した米国株データの中に、該当するS&amp;P500銘柄がありませんでした。
            </p>
          ) : (
            <ul className="space-y-3">
              {down.map((item, i) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border border-zinc-800 rounded-2xl px-4 py-4 bg-zinc-950"
                >
                  <div className="min-w-0">
                    <Link href={`/stock/${item.code}`} className="hover:underline">
                      <p className="font-semibold break-words">
                        #{i + 1} {item.code} {item.name}
                      </p>
                    </Link>
                    <div className="mt-2 text-sm text-zinc-400 space-y-1">
                      <p>株価: {formatPrice(item.price)}</p>
                      <p>前日比: {formatChangeValue(item.change_value)}</p>
                    </div>
                  </div>

                  <p className="text-rose-400 font-bold text-lg shrink-0">
                    {formatChangeRate(item.change_rate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}