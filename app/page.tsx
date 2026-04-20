import { supabase } from "@/lib/supabase";

type Ranking = {
  id: number;
  code: string;
  name: string;
  change_rate: number;
  rank_type: string;
};

export default async function Home() {
  const { data } = await supabase
    .from("rankings")
    .select("*");

  const rankings = (data ?? []) as Ranking[];

  const upList = rankings.filter((item) => item.rank_type === "up");
  const downList = rankings.filter((item) => item.rank_type === "down");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          日本株ランキング
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              値上がり率ランキング
            </h2>

            <ul className="space-y-2">
              {upList.map((item) => (
                <li key={item.id}>
                  {item.code} {item.name} +{item.change_rate}%
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              値下がり率ランキング
            </h2>

            <ul className="space-y-2">
              {downList.map((item) => (
                <li key={item.id}>
                  {item.code} {item.name} {item.change_rate}%
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}