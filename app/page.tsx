import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Ranking = {
  id: number;
  code: string;
  name: string;
  change_rate: number;
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

export default async function Home() {
  const { data } = await supabase.from("rankings").select("*");

  const rankings = (data ?? []) as Ranking[];

  const jpUp = rankings
    .filter((item) => item.market === "jp" && item.rank_type === "up")
    .sort((a, b) => b.change_rate - a.change_rate);

  const jpDown = rankings
    .filter((item) => item.market === "jp" && item.rank_type === "down")
    .sort((a, b) => a.change_rate - b.change_rate);

  const usUp = rankings
    .filter((item) => item.market === "us" && item.rank_type === "up")
    .sort((a, b) => b.change_rate - a.change_rate);

  const usDown = rankings
    .filter((item) => item.market === "us" && item.rank_type === "down")
    .sort((a, b) => a.change_rate - b.change_rate);

  const latestUpdatedAt =
    rankings.length > 0
      ? rankings
          .map((item) => item.created_at)
          .sort((a, b) => {
            const aNormalized = /Z$|[+-]\d{2}:\d{2}$/.test(a) ? a : `${a}Z`;
            const bNormalized = /Z$|[+-]\d{2}:\d{2}$/.test(b) ? b : `${b}Z`;
            return (
              new Date(bNormalized).getTime() - new Date(aNormalized).getTime()
            );
          })[0]
      : undefined;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">株式ランキング</h1>
          <p className="text-zinc-400">
            最終更新: {formatJst(latestUpdatedAt)}（日本時間）
          </p>
        </header>

        <section>
          <h2 className="text-3xl font-bold mb-8">日本株ランキング</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h3 className="text-2xl font-bold text-emerald-400 mb-6">
                値上がり率ランキング
              </h3>
              <ul className="space-y-3">
                {jpUp.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3"
                  >
                    <div>
                      <p className="text-sm text-zinc-500">#{index + 1}</p>
                      <Link
                        href={`/stock/${item.code}`}
                        className="font-medium hover:underline"
                      >
                        {item.code} {item.name}
                      </Link>
                    </div>
                    <p className="font-semibold text-emerald-400">
                      +{item.change_rate}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h3 className="text-2xl font-bold text-rose-400 mb-6">
                値下がり率ランキング
              </h3>
              <ul className="space-y-3">
                {jpDown.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3"
                  >
                    <div>
                      <p className="text-sm text-zinc-500">#{index + 1}</p>
                      <Link
                        href={`/stock/${item.code}`}
                        className="font-medium hover:underline"
                      >
                        {item.code} {item.name}
                      </Link>
                    </div>
                    <p className="font-semibold text-rose-400">
                      {item.change_rate}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">アメリカ株ランキング</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h3 className="text-2xl font-bold text-emerald-400 mb-6">
                値上がり率ランキング
              </h3>
              <ul className="space-y-3">
                {usUp.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3"
                  >
                    <div>
                      <p className="text-sm text-zinc-500">#{index + 1}</p>
                      <Link
                        href={`/stock/${item.code}`}
                        className="font-medium hover:underline"
                      >
                        {item.code} {item.name}
                      </Link>
                    </div>
                    <p className="font-semibold text-emerald-400">
                      +{item.change_rate}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h3 className="text-2xl font-bold text-rose-400 mb-6">
                値下がり率ランキング
              </h3>
              <ul className="space-y-3">
                {usDown.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3"
                  >
                    <div>
                      <p className="text-sm text-zinc-500">#{index + 1}</p>
                      <Link
                        href={`/stock/${item.code}`}
                        className="font-medium hover:underline"
                      >
                        {item.code} {item.name}
                      </Link>
                    </div>
                    <p className="font-semibold text-rose-400">
                      {item.change_rate}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}