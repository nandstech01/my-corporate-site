export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail_url?: string;
  featured_image?: string;
  category?: {
    name: string;
    slug: string;
  };
  seo_keywords?: string[];
}; 