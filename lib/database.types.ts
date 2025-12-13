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
          name: string
          slug: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          business_id: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          business_id: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          business_id?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      chatgpt_posts: {
        Row: {
          id: number
          title: string
          content: string
          excerpt: string
          slug: string
          business_id: number
          category_id: number
          status: string
          thumbnail_url: string | null
          meta_title: string | null
          meta_description: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          excerpt: string
          slug: string
          business_id: number
          category_id: number
          status?: string
          thumbnail_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          excerpt?: string
          slug?: string
          business_id?: number
          category_id?: number
          status?: string
          thumbnail_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
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
      posts: {
        Row: {
          id: number
          title: string
          slug: string
          content: string
          business_id: number
          category_id: number
          status: 'draft' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          title: string
          slug: string
          content: string
          business_id: number
          category_id: number
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          content?: string
          business_id?: number
          category_id?: number
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      video_jobs: {
        Row: {
          id: string
          user_id: string
          status: string
          title_internal: string
          youtube_title: string
          youtube_description: string | null
          youtube_tags: string[]
          script_raw: string
          script_struct: Json | null
          voice: Json | null
          avatar: Json | null
          background: Json | null
          caption: Json | null
          music: Json | null
          timeline: Json | null
          akool_job_id: string | null
          akool_video_url: string | null
          final_video_url: string | null
          youtube_video_id: string | null
          youtube_url: string | null
          youtube_published_at: string | null
          metrics: Json | null
          related_blog_post_id: number | null
          article_slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          title_internal: string
          youtube_title: string
          youtube_description?: string | null
          youtube_tags?: string[]
          script_raw: string
          script_struct?: Json | null
          voice?: Json | null
          avatar?: Json | null
          background?: Json | null
          caption?: Json | null
          music?: Json | null
          timeline?: Json | null
          akool_job_id?: string | null
          akool_video_url?: string | null
          final_video_url?: string | null
          youtube_video_id?: string | null
          youtube_url?: string | null
          youtube_published_at?: string | null
          metrics?: Json | null
          related_blog_post_id?: number | null
          article_slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          title_internal?: string
          youtube_title?: string
          youtube_description?: string | null
          youtube_tags?: string[]
          script_raw?: string
          script_struct?: Json | null
          voice?: Json | null
          avatar?: Json | null
          background?: Json | null
          caption?: Json | null
          music?: Json | null
          timeline?: Json | null
          akool_job_id?: string | null
          akool_video_url?: string | null
          final_video_url?: string | null
          youtube_video_id?: string | null
          youtube_url?: string | null
          youtube_published_at?: string | null
          metrics?: Json | null
          related_blog_post_id?: number | null
          article_slug?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      youtube_auth: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          scope: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          scope: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string
          scope?: string
          created_at?: string
          updated_at?: string
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