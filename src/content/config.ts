import { defineCollection, z } from 'astro:content';

const tours = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(), // short summary used for SEO meta description
    price: z.number(),        // price per person in EUR (display only)
    duration: z.string(),     // e.g. "3 hours"
    maxGroupSize: z.number(),
    includes: z.array(z.string()),
    highlights: z.array(z.string()),
    image: z.string(),
    imageAlt: z.string(),
    location: z.string(),
    meetingPoint: z.string(),
    languages: z.array(z.string()),
    category: z.enum(['walking', 'boat']),
  }),
});

export const collections = { tours };
