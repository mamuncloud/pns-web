import { MetadataRoute } from 'next';
import { getProductsFromDb } from '@/lib/products-db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.planetnyemilsnack.store';

  // Fetch all products (limit 1000 for now, adjust as needed)
  const { data: products } = await getProductsFromDb(1, 1000);

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/partner`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...productUrls];
}
