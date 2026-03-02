import { getCollection, type CollectionEntry } from 'astro:content';

export type Tour = CollectionEntry<'tours'>;

export async function getAllTours(): Promise<Tour[]> {
  return getCollection('tours');
}

export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  const tours = await getCollection('tours');
  return tours.find((t) => t.slug === slug);
}

export function formatPrice(euros: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(euros);
}
