import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Ranking = {
  id: number;
  code: string;
  name: string;
  price: number;
  change_rate: number;
  change_value: number;
  market: "jp" | "us";
};

export const metadata = {
  title: "S&P500 上昇率ランキング（今日）",
  description:
    "S&P500構成銘柄の中から、今日の上昇率・下落率ランキング上位10銘柄を掲載。",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatChange(value: number) {
  return `${value >= 0 ? "+" : ""}${value}%`;
}

export default async function Sp500Page() {
  const { data } = await supabase.from("rankings").select("*");

  const usStocks = (data ?? []).filter((v) => v.market === "us");

  const up = usStocks
    .sort((a, b) => b.change_rate - a.change_rate)
    .slice(0, 10);

  const down = usStocks
    .sort((a, b) => a.change_rate - b.change_rate)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold">
            S&amp;P500 上昇率ランキング（今日）
          </h1>
          <p className="text-zinc-400 mt-2">
            S&amp;P500構成銘柄の中から、今日の値動き上位銘柄を表示しています
          </p>
        </header>

        {/* 上昇 */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">
            上昇率 TOP10
          </h2>

          <ul className="space-y-3">
            {up.map((item, i) => (
              <li
                key={item.id}
                className="flex justify-between items-center border border-zinc-800 rounded-xl px-4 py-3"
              >
                <div>
                  <Link href={`/stock/${item.code}`}>
                    <p className="font-semibold">
                      #{i + 1} {item.code} {item.name}
                    </p>
                  </Link>
                  <p className="text-sm text-zinc-400">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <p className="text-emerald-400 font-bold">
                  {formatChange(item.change_rate)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 下落 */}
        <section>
          <h2 className="text-2xl font-bold text-rose-400 mb-4">
            下落率 TOP10
          </h2>

          <ul className="space-y-3">
            {down.map((item, i) => (
              <li
                key={item.id}
                className="flex justify-between items-center border border-zinc-800 rounded-xl px-4 py-3"
              >
                <div>
                  <Link href={`/stock/${item.code}`}>
                    <p className="font-semibold">
                      #{i + 1} {item.code} {item.name}
                    </p>
                  </Link>
                  <p className="text-sm text-zinc-400">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <p className="text-rose-400 font-bold">
                  {formatChange(item.change_rate)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}