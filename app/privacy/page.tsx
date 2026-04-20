export default function PrivacyPage() {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
  
          <p className="text-zinc-300 leading-relaxed">
            当サイトでは、第三者配信の広告サービス（Google AdSense）を利用する予定です。
            広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
          </p>
  
          <p className="text-zinc-300 leading-relaxed">
            Cookieを使用することで当サイトはユーザーのコンピュータを識別できるようになりますが、
            個人を特定するものではありません。
          </p>
  
          <p className="text-zinc-300 leading-relaxed">
            ユーザーはブラウザの設定によりCookieを無効にすることができます。
          </p>
  
          <p className="text-zinc-300 leading-relaxed">
            Google AdSenseに関する詳細は以下をご確認ください。
          </p>
  
          <a
            href="https://policies.google.com/technologies/ads?hl=ja"
            target="_blank"
            className="text-blue-400 underline"
          >
            Google広告ポリシー
          </a>
  
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">免責事項</h2>
            <p className="text-zinc-300">
              当サイトに掲載されている情報は、正確性を保証するものではありません。
              投資に関する最終判断はご自身の責任でお願いいたします。
            </p>
          </div>
        </div>
      </main>
    );
  }