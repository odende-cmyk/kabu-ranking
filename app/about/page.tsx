export default function AboutPage() {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">このサイトについて</h1>
  
          <p className="text-zinc-300 leading-relaxed">
            当サイトは、日本株および米国株の値上がり率・値下がり率ランキングを提供する株式情報サイトです。
            株価、前日比、騰落率、チャートなどを分かりやすく一覧表示し、投資判断の参考となる情報を提供しています。
          </p>
  
          <p className="text-zinc-300 leading-relaxed">
            データは外部サービス（Yahoo Finance 等）をもとに取得・表示していますが、
            情報の正確性・完全性を保証するものではありません。
            投資判断はご自身の責任にてお願いいたします。
          </p>
  
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">運営者</h2>
            <p className="text-zinc-400">株式ランキング運営チーム</p>
          </div>
        </div>
      </main>
    );
  }