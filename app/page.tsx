import { supabase } from "@/lib/supabase";

type Ranking = {
  id: number;
  code: string;
  name: string;
  change_rate: number;
  rank_type: "up" | "down";
  market: "jp" | "us";
};

export default async function Home() {
  const { data } = await supabase.from("rankings").select("*");

  const rankings = (data ?? []) as Ranking[];

  const jpUp = rankings.filter(
    (item) => item.market === "jp" && item.rank_type === "up"
  );
  const jpDown = rankings.filter(
    (item) => item.market === "jp" && item.rank_type === "down"
  );

  const usUp = rankings.filter(
    (item) => item.market === "us" && item.rank_type === "up"
  );
  const usDown = rankings.filter(
    (item) => item.market === "us" && item.rank_type === "down"
  );

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <section>
          <h1 className="text-4xl font-bold mb-8">日本株ランキング</h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-emerald-400 mb-6">
                値上がり率ランキング
              </h2>
              <ul className="space-y-3">
                {jpUp.map((item) => (
                  <li key={item.id}>
                    {item.code} {item.name} +{item.change_rate}%
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-rose-400 mb-6">
                値下がり率ランキング
              </h2>
              <ul className="space-y-3">
                {jpDown.map((item) => (
                  <li key={item.id}>
                    {item.code} {item.name} {item.change_rate}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h1 className="text-4xl font-bold mb-8">アメリカ株ランキング</h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-emerald-400 mb-6">
                値上がり率ランキング
              </h2>
              <ul className="space-y-3">
                {usUp.map((item) => (
                  <li key={item.id}>
                    {item.code} {item.name} +{item.change_rate}%
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-rose-400 mb-6">
                値下がり率ランキング
              </h2>
              <ul className="space-y-3">
                {usDown.map((item) => (
                  <li key={item.id}>
                    {item.code} {item.name} {item.change_rate}%
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