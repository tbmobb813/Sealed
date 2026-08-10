import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://sealed.techtrendwire.com",
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://sealed.techtrendwire.com/pricing",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
