import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kabu-ranking-alpha.vercel.app/",
      lastModified: new Date(),
    },
    {
      url: "https://kabu-ranking-alpha.vercel.app/sp500",
      lastModified: new Date(),
    },
  ];
}