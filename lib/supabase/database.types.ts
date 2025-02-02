export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: number
          slug: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          business_id: number
          slug: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          business_id: number
          slug: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          slug?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          slug: string
          status: 'draft' | 'published'
          views: number
          likes: number
          published_at: string | null
          created_at: string
          updated_at: string | null
          thumbnail_url: string | null
          meta_description: string | null
          seo_keywords: string[] | null
          business_category: 'fukugyo' | 'reskilling' | 'corporate'
          category: string
          category_slug: string
          tags: string[] | null
          author_id: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          slug: string
          status?: 'draft' | 'published'
          views?: number
          likes?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string | null
          thumbnail_url?: string | null
          meta_description?: string | null
          seo_keywords?: string[] | null
          business_category: 'fukugyo' | 'reskilling' | 'corporate'
          category: string
          category_slug: string
          tags?: string[] | null
          author_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          slug?: string
          status?: 'draft' | 'published'
          views?: number
          likes?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string | null
          thumbnail_url?: string | null
          meta_description?: string | null
          seo_keywords?: string[] | null
          business_category?: 'fukugyo' | 'reskilling' | 'corporate'
          category?: string
          category_slug?: string
          tags?: string[] | null
          author_id?: string | null
        }
      }
      post_images: {
        Row: {
          id: number
          post_id: number | null
          url: string
          created_at: string
        }
        Insert: {
          id?: number
          post_id?: number | null
          url: string
          created_at?: string
        }
        Update: {
          id?: number
          post_id?: number | null
          url?: string
          created_at?: string
        }
      }
      chatgpt_sections: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      chatgpt_posts: {
        Row: {
          id: number
          title: string
          content: string
          slug: string
          business_id: number | null
          category_id: number | null
          is_chatgpt_special: boolean
          chatgpt_section_id: number | null
          thumbnail_url: string | null
          author_slug: string | null
          status: string
          published_at: string | null
          created_at: string
          updated_at: string
          meta_description: string | null
          seo_keywords: string[] | null
          is_indexable: boolean
          canonical_url: string | null
        }
        Insert: {
          id?: number
          title: string
          content: string
          slug: string
          business_id?: number | null
          category_id?: number | null
          is_chatgpt_special?: boolean
          chatgpt_section_id?: number | null
          thumbnail_url?: string | null
          author_slug?: string | null
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
          meta_description?: string | null
          seo_keywords?: string[] | null
          is_indexable?: boolean
          canonical_url?: string | null
        }
        Update: {
          id?: number
          title?: string
          content?: string
          slug?: string
          business_id?: number | null
          category_id?: number | null
          is_chatgpt_special?: boolean
          chatgpt_section_id?: number | null
          thumbnail_url?: string | null
          author_slug?: string | null
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
          meta_description?: string | null
          seo_keywords?: string[] | null
          is_indexable?: boolean
          canonical_url?: string | null
        }
      }
      analytics: {
        Row: {
          id: number
          visitor_id: string
          page_path: string
          device_type: string
          country: string
          created_at: string
        }
        Insert: {
          id?: number
          visitor_id: string
          page_path: string
          device_type: string
          country: string
          created_at?: string
        }
        Update: {
          id?: number
          visitor_id?: string
          page_path?: string
          device_type?: string
          country?: string
          created_at?: string
        }
      }
      chatgpt_features: {
        Row: {
          id: string
          title: string
          content: string
          slug: string
          status: 'draft' | 'published'
          section: string
          order: number
          thumbnail_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          slug: string
          status?: 'draft' | 'published'
          section: string
          order?: number
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          slug?: string
          status?: 'draft' | 'published'
          section?: string
          order?: number
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type ChatGPTFeature = Database['public']['Tables']['chatgpt_features']['Row'] 