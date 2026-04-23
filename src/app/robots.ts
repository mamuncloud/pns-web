import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/staff/',
        '/staff-dashboard/',
        '/checkout/',
        '/order/',
        '/api/',
      ],
    },
    sitemap: 'https://www.planetnyemilsnack.store/sitemap.xml',
  };
}
