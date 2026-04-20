// app/sitemap.ts
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://kabu-ranking-alpha.vercel.app";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 銘柄コード一覧を取得（重複排除）
  const { data } = await supabase
    .from("rankings")
    .select("code")
    .limit(1000); // 必要に応じて増やす

  const codes = Array.from(new Set((data ?? []).map((v) => v.code)));

  // トップページ
  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
  ];

  // 銘柄ページ
  const stockRoutes = codes.map((code) => ({
    url: `${baseUrl}/stock/${code}`,
    lastModified: new Date(),
  }));

  return [...routes, ...stockRoutes];
}