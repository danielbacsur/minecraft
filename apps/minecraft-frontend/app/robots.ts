import type { MetadataRoute } from "next";

import { origin } from "@/utils/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/api/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
