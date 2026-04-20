import { supabase } from "@/lib/supabase";
import RankingsTabs from "./RankingsTabs";

export type Ranking = {
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
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              株式ランキング
            </h1>
            <p className="text-zinc-400 mt-2">
              日本株・米国株の上昇率 / 下落率を一覧で確認
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
              最終更新: {formatJst(latestUpdatedAt)}（日本時間）
            </div>

            <a
              href="/sp500"
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              S&amp;P500ランキングを見る
            </a>
          </div>
        </header>

        <RankingsTabs
          jpUp={jpUp}
          jpDown={jpDown}
          usUp={usUp}
          usDown={usDown}
        />
      </div>

      <footer className="mt-16 pt-6 border-t border-zinc-800 text-sm text-zinc-400 flex flex-wrap gap-4 justify-center">
        <a href="/sp500" className="hover:underline">
          S&amp;P500ランキング
        </a>
        <a href="/about" className="hover:underline">
          運営者情報
        </a>
        <a href="/privacy" className="hover:underline">
          プライバシーポリシー
        </a>
      </footer>
    </main>
  );
}