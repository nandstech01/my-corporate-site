export interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  views: number;
  tags?: string[];
  likes: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  thumbnail_url?: string;
  meta_description?: string;
  seo_keywords?: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Author {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
}

export interface BlogPostWithAuthor extends BlogPost {
  author?: Author;
}

export interface BlogPostWithRelated extends BlogPost {
  related_posts?: BlogPost[];
} 