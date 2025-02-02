export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: number
          slug: 'fukugyo' | 'corporate' | 'reskilling'
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: 'fukugyo' | 'corporate' | 'reskilling'
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: 'fukugyo' | 'corporate' | 'reskilling'
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
          id: number
          business_id: number
          category_id: number
          slug: string
          title: string
          content: string
          excerpt: string | null
          featured_image: string | null
          author_id: string
          status: string
          is_chatgpt_special: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          business_id: number
          category_id: number
          slug: string
          title: string
          content: string
          excerpt?: string | null
          featured_image?: string | null
          author_id: string
          status?: string
          is_chatgpt_special?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          category_id?: number
          slug?: string
          title?: string
          content?: string
          excerpt?: string | null
          featured_image?: string | null
          author_id?: string
          status?: string
          is_chatgpt_special?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
      }
      post_tags: {
        Row: {
          post_id: number
          tag_id: number
        }
        Insert: {
          post_id: number
          tag_id: number
        }
        Update: {
          post_id?: number
          tag_id?: number
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
      business_type: 'fukugyo' | 'corporate' | 'reskilling'
    }
  }
} 