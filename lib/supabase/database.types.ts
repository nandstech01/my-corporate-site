export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_quotation_history: {
        Row: {
          ai_engine: string
          complete_uri: string
          created_at: string | null
          detected_at: string | null
          detected_source: string | null
          fragment_id: string
          id: string
          quotation_context: string | null
          quotation_quality_score: number | null
          quotation_type: string | null
        }
        Insert: {
          ai_engine: string
          complete_uri: string
          created_at?: string | null
          detected_at?: string | null
          detected_source?: string | null
          fragment_id: string
          id?: string
          quotation_context?: string | null
          quotation_quality_score?: number | null
          quotation_type?: string | null
        }
        Update: {
          ai_engine?: string
          complete_uri?: string
          created_at?: string | null
          detected_at?: string | null
          detected_source?: string | null
          fragment_id?: string
          id?: string
          quotation_context?: string | null
          quotation_quality_score?: number | null
          quotation_type?: string | null
        }
        Relationships: []
      }
      analytics: {
        Row: {
          country: string | null
          created_at: string | null
          device_type: string | null
          id: number
          page_path: string
          visitor_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: number
          page_path: string
          visitor_id: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: number
          page_path?: string
          visitor_id?: string
        }
        Relationships: []
      }
      auth_group: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      auth_group_permissions: {
        Row: {
          group_id: number
          id: number
          permission_id: number
        }
        Insert: {
          group_id: number
          id?: number
          permission_id: number
        }
        Update: {
          group_id?: number
          id?: number
          permission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "auth_permission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "auth_group"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_permission: {
        Row: {
          codename: string
          content_type_id: number
          id: number
          name: string
        }
        Insert: {
          codename: string
          content_type_id: number
          id?: number
          name: string
        }
        Update: {
          codename?: string
          content_type_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_permission_content_type_id_2f476e4b_fk_django_co"
            columns: ["content_type_id"]
            isOneToOne: false
            referencedRelation: "django_content_type"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_user: {
        Row: {
          date_joined: string
          email: string
          first_name: string
          id: number
          is_active: boolean
          is_staff: boolean
          is_superuser: boolean
          last_login: string | null
          last_name: string
          password: string
          username: string
        }
        Insert: {
          date_joined: string
          email: string
          first_name: string
          id?: number
          is_active: boolean
          is_staff: boolean
          is_superuser: boolean
          last_login?: string | null
          last_name: string
          password: string
          username: string
        }
        Update: {
          date_joined?: string
          email?: string
          first_name?: string
          id?: number
          is_active?: boolean
          is_staff?: boolean
          is_superuser?: boolean
          last_login?: string | null
          last_name?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      auth_user_groups: {
        Row: {
          group_id: number
          id: number
          user_id: number
        }
        Insert: {
          group_id: number
          id?: number
          user_id: number
        }
        Update: {
          group_id?: number
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_user_groups_group_id_97559544_fk_auth_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "auth_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_user_groups_user_id_6a12ed8b_fk_auth_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_user"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_user_user_permissions: {
        Row: {
          id: number
          permission_id: number
          user_id: number
        }
        Insert: {
          id?: number
          permission_id: number
          user_id: number
        }
        Update: {
          id?: number
          permission_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "auth_permission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_user"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          slug: Database["public"]["Enums"]["business_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          slug: Database["public"]["Enums"]["business_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: Database["public"]["Enums"]["business_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      catalyst_rag: {
        Row: {
          core_message: string
          counterpoint: string | null
          created_at: string | null
          embedding: string | null
          embedding_text: string
          emotion: string | null
          emotion_code: string
          id: number
          insertion_style: string | null
          lang: string | null
          person: string
          quote: string
          source_url: string | null
          subthemes: string[] | null
          theme: string
          use_cases: string[] | null
          verify_status: string | null
          your_voice_paraphrase: string
        }
        Insert: {
          core_message: string
          counterpoint?: string | null
          created_at?: string | null
          embedding?: string | null
          embedding_text: string
          emotion?: string | null
          emotion_code: string
          id?: number
          insertion_style?: string | null
          lang?: string | null
          person: string
          quote: string
          source_url?: string | null
          subthemes?: string[] | null
          theme: string
          use_cases?: string[] | null
          verify_status?: string | null
          your_voice_paraphrase: string
        }
        Update: {
          core_message?: string
          counterpoint?: string | null
          created_at?: string | null
          embedding?: string | null
          embedding_text?: string
          emotion?: string | null
          emotion_code?: string
          id?: number
          insertion_style?: string | null
          lang?: string | null
          person?: string
          quote?: string
          source_url?: string | null
          subthemes?: string[] | null
          theme?: string
          use_cases?: string[] | null
          verify_status?: string | null
          your_voice_paraphrase?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          business_id: number | null
          created_at: string | null
          description: string | null
          id: number
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          business_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          business_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      chatgpt_posts: {
        Row: {
          author_id: string | null
          author_slug: string | null
          business_id: number | null
          canonical_url: string | null
          category_id: number | null
          chatgpt_section_id: number | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: number
          is_chatgpt_special: boolean | null
          is_indexable: boolean | null
          meta_description: string | null
          published_at: string | null
          section_id: number | null
          seo_keywords: string[] | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          author_slug?: string | null
          business_id?: number | null
          canonical_url?: string | null
          category_id?: number | null
          chatgpt_section_id?: number | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: number
          is_chatgpt_special?: boolean | null
          is_indexable?: boolean | null
          meta_description?: string | null
          published_at?: string | null
          section_id?: number | null
          seo_keywords?: string[] | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          author_slug?: string | null
          business_id?: number | null
          canonical_url?: string | null
          category_id?: number | null
          chatgpt_section_id?: number | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: number
          is_chatgpt_special?: boolean | null
          is_indexable?: boolean | null
          meta_description?: string | null
          published_at?: string | null
          section_id?: number | null
          seo_keywords?: string[] | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatgpt_posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatgpt_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatgpt_posts_chatgpt_section_id_fkey"
            columns: ["chatgpt_section_id"]
            isOneToOne: false
            referencedRelation: "chatgpt_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatgpt_posts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "chatgpt_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      chatgpt_sections: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          slug: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          slug: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      company_vectors: {
        Row: {
          content_chunk: string
          content_tsvector: unknown
          content_type: string
          created_at: string | null
          embedding: string
          fragment_id: string | null
          id: number
          metadata: Json | null
          page_slug: string
          relevance_score: number | null
          section_title: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          content_chunk: string
          content_tsvector?: unknown
          content_type: string
          created_at?: string | null
          embedding: string
          fragment_id?: string | null
          id?: number
          metadata?: Json | null
          page_slug: string
          relevance_score?: number | null
          section_title?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content_chunk?: string
          content_tsvector?: unknown
          content_type?: string
          created_at?: string | null
          embedding?: string
          fragment_id?: string | null
          id?: number
          metadata?: Json | null
          page_slug?: string
          relevance_score?: number | null
          section_title?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_youtube_shorts: {
        Row: {
          ai_optimization_score: number | null
          approved_at: string | null
          approved_by: string | null
          background_music_suggestion: string | null
          blog_slug: string | null
          category: string
          comment_count: number | null
          complete_uri: string | null
          content: string
          content_for_embedding: string | null
          content_title: string
          content_type: string
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          embed_url: string | null
          embedded_at: string | null
          embedding: string | null
          engagement_rate: number | null
          entity_definition: Json | null
          fragment_id: string
          hook_type: string | null
          id: number
          like_count: number | null
          metadata: Json | null
          notes: string | null
          page_path: string
          published_at: string | null
          related_blog_post_id: number | null
          related_entities: string[] | null
          schema_data: Json | null
          script_body: string | null
          script_cta: string | null
          script_duration_seconds: number | null
          script_empathy: string | null
          script_hook: string | null
          script_title: string | null
          semantic_weight: number | null
          source_system: string | null
          status: string | null
          tags: string[] | null
          target_emotion: string | null
          target_queries: string[] | null
          text_overlays: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          video_editing_started_at: string | null
          video_id: string | null
          video_url: string | null
          view_count: number | null
          viral_elements: string[] | null
          virality_score: number | null
          visual_instructions: Json | null
          workflow_status: string | null
          youtube_uploaded_at: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          ai_optimization_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          background_music_suggestion?: string | null
          blog_slug?: string | null
          category?: string
          comment_count?: number | null
          complete_uri?: string | null
          content: string
          content_for_embedding?: string | null
          content_title: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          embed_url?: string | null
          embedded_at?: string | null
          embedding?: string | null
          engagement_rate?: number | null
          entity_definition?: Json | null
          fragment_id: string
          hook_type?: string | null
          id?: never
          like_count?: number | null
          metadata?: Json | null
          notes?: string | null
          page_path?: string
          published_at?: string | null
          related_blog_post_id?: number | null
          related_entities?: string[] | null
          schema_data?: Json | null
          script_body?: string | null
          script_cta?: string | null
          script_duration_seconds?: number | null
          script_empathy?: string | null
          script_hook?: string | null
          script_title?: string | null
          semantic_weight?: number | null
          source_system?: string | null
          status?: string | null
          tags?: string[] | null
          target_emotion?: string | null
          target_queries?: string[] | null
          text_overlays?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          video_editing_started_at?: string | null
          video_id?: string | null
          video_url?: string | null
          view_count?: number | null
          viral_elements?: string[] | null
          virality_score?: number | null
          visual_instructions?: Json | null
          workflow_status?: string | null
          youtube_uploaded_at?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          ai_optimization_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          background_music_suggestion?: string | null
          blog_slug?: string | null
          category?: string
          comment_count?: number | null
          complete_uri?: string | null
          content?: string
          content_for_embedding?: string | null
          content_title?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          embed_url?: string | null
          embedded_at?: string | null
          embedding?: string | null
          engagement_rate?: number | null
          entity_definition?: Json | null
          fragment_id?: string
          hook_type?: string | null
          id?: never
          like_count?: number | null
          metadata?: Json | null
          notes?: string | null
          page_path?: string
          published_at?: string | null
          related_blog_post_id?: number | null
          related_entities?: string[] | null
          schema_data?: Json | null
          script_body?: string | null
          script_cta?: string | null
          script_duration_seconds?: number | null
          script_empathy?: string | null
          script_hook?: string | null
          script_title?: string | null
          semantic_weight?: number | null
          source_system?: string | null
          status?: string | null
          tags?: string[] | null
          target_emotion?: string | null
          target_queries?: string[] | null
          text_overlays?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          video_editing_started_at?: string | null
          video_id?: string | null
          video_url?: string | null
          view_count?: number | null
          viral_elements?: string[] | null
          virality_score?: number | null
          visual_instructions?: Json | null
          workflow_status?: string | null
          youtube_uploaded_at?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_blog_post"
            columns: ["related_blog_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      deeplink_analytics: {
        Row: {
          ai_quotation_count: number | null
          click_count: number | null
          complete_uri: string
          conversion_count: number | null
          created_at: string | null
          form_submissions: number | null
          fragment_id: string
          id: string
          last_updated: string | null
          line_shares: number | null
          page_path: string
          similarity_score: number | null
          social_shares: number | null
          video_embeddings: number | null
        }
        Insert: {
          ai_quotation_count?: number | null
          click_count?: number | null
          complete_uri: string
          conversion_count?: number | null
          created_at?: string | null
          form_submissions?: number | null
          fragment_id: string
          id?: string
          last_updated?: string | null
          line_shares?: number | null
          page_path: string
          similarity_score?: number | null
          social_shares?: number | null
          video_embeddings?: number | null
        }
        Update: {
          ai_quotation_count?: number | null
          click_count?: number | null
          complete_uri?: string
          conversion_count?: number | null
          created_at?: string | null
          form_submissions?: number | null
          fragment_id?: string
          id?: string
          last_updated?: string | null
          line_shares?: number | null
          page_path?: string
          similarity_score?: number | null
          social_shares?: number | null
          video_embeddings?: number | null
        }
        Relationships: []
      }
      django_admin_log: {
        Row: {
          action_flag: number
          action_time: string
          change_message: string
          content_type_id: number | null
          id: number
          object_id: string | null
          object_repr: string
          user_id: number
        }
        Insert: {
          action_flag: number
          action_time: string
          change_message: string
          content_type_id?: number | null
          id?: number
          object_id?: string | null
          object_repr: string
          user_id: number
        }
        Update: {
          action_flag?: number
          action_time?: string
          change_message?: string
          content_type_id?: number | null
          id?: number
          object_id?: string | null
          object_repr?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "django_admin_log_content_type_id_c4bce8eb_fk_django_co"
            columns: ["content_type_id"]
            isOneToOne: false
            referencedRelation: "django_content_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "django_admin_log_user_id_c564eba6_fk_auth_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_user"
            referencedColumns: ["id"]
          },
        ]
      }
      django_content_type: {
        Row: {
          app_label: string
          id: number
          model: string
        }
        Insert: {
          app_label: string
          id?: number
          model: string
        }
        Update: {
          app_label?: string
          id?: number
          model?: string
        }
        Relationships: []
      }
      django_migrations: {
        Row: {
          app: string
          applied: string
          id: number
          name: string
        }
        Insert: {
          app: string
          applied?: string
          id?: number
          name: string
        }
        Update: {
          app?: string
          applied?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      django_session: {
        Row: {
          expire_date: string
          session_data: string
          session_key: string
        }
        Insert: {
          expire_date: string
          session_data: string
          session_key: string
        }
        Update: {
          expire_date?: string
          session_data?: string
          session_key?: string
        }
        Relationships: []
      }
      evaluation_queries: {
        Row: {
          category: string
          created_at: string
          dataset_version: string
          description: string
          difficulty: number
          expected_fragment_ids: string[]
          id: number
          query: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at: string
          dataset_version: string
          description: string
          difficulty: number
          expected_fragment_ids: string[]
          id?: number
          query: string
          updated_at: string
        }
        Update: {
          category?: string
          created_at?: string
          dataset_version?: string
          description?: string
          difficulty?: number
          expected_fragment_ids?: string[]
          id?: number
          query?: string
          updated_at?: string
        }
        Relationships: []
      }
      evaluation_results: {
        Row: {
          created_at: string
          dataset_version: string
          id: number
          mlflow_run_id: string | null
          mrr: number | null
          ndcg: number | null
          precision_at_5: number | null
          query_id: number
          recall_at_20: number | null
          results_json: Json | null
          run_id: string | null
          search_duration_ms: number | null
          variant: string
        }
        Insert: {
          created_at: string
          dataset_version: string
          id?: number
          mlflow_run_id?: string | null
          mrr?: number | null
          ndcg?: number | null
          precision_at_5?: number | null
          query_id: number
          recall_at_20?: number | null
          results_json?: Json | null
          run_id?: string | null
          search_duration_ms?: number | null
          variant: string
        }
        Update: {
          created_at?: string
          dataset_version?: string
          id?: number
          mlflow_run_id?: string | null
          mrr?: number | null
          ndcg?: number | null
          precision_at_5?: number | null
          query_id?: number
          recall_at_20?: number | null
          results_json?: Json | null
          run_id?: string | null
          search_duration_ms?: number | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_results_query_id_d177743d_fk_evaluation_queries_id"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "evaluation_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_vectors: {
        Row: {
          category: string | null
          complete_uri: string
          content: string
          content_title: string
          content_tsvector: unknown
          content_type: string
          created_at: string | null
          embedding: string
          fragment_id: string
          id: number
          metadata: Json | null
          page_path: string
          related_entities: string[] | null
          semantic_weight: number | null
          source_system: string | null
          target_queries: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          complete_uri: string
          content: string
          content_title: string
          content_tsvector?: unknown
          content_type: string
          created_at?: string | null
          embedding: string
          fragment_id: string
          id?: never
          metadata?: Json | null
          page_path: string
          related_entities?: string[] | null
          semantic_weight?: number | null
          source_system?: string | null
          target_queries?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          complete_uri?: string
          content?: string
          content_title?: string
          content_tsvector?: unknown
          content_type?: string
          created_at?: string | null
          embedding?: string
          fragment_id?: string
          id?: never
          metadata?: Json | null
          page_path?: string
          related_entities?: string[] | null
          semantic_weight?: number | null
          source_system?: string | null
          target_queries?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          content: string
          created_at: string | null
          id: number
          metadata: Json | null
          query: string | null
          rag_sources: string[] | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          metadata?: Json | null
          query?: string | null
          rag_sources?: string[] | null
          status?: string | null
          title: string
          type?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          metadata?: Json | null
          query?: string | null
          rag_sources?: string[] | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      hybrid_deep_research: {
        Row: {
          authority_score: number | null
          content: string
          content_tsvector: unknown
          created_at: string | null
          data_freshness: string | null
          embedding: string | null
          id: number
          is_active: boolean | null
          key_findings: string[] | null
          metadata: Json | null
          related_entities: string[] | null
          research_date: string | null
          research_prompt: string
          research_topic: string
          research_type: string | null
          researched_at: string | null
          semantic_keywords: string[] | null
          source_count: number | null
          source_urls: string[] | null
          summary: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          authority_score?: number | null
          content: string
          content_tsvector?: unknown
          created_at?: string | null
          data_freshness?: string | null
          embedding?: string | null
          id?: number
          is_active?: boolean | null
          key_findings?: string[] | null
          metadata?: Json | null
          related_entities?: string[] | null
          research_date?: string | null
          research_prompt: string
          research_topic: string
          research_type?: string | null
          researched_at?: string | null
          semantic_keywords?: string[] | null
          source_count?: number | null
          source_urls?: string[] | null
          summary?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          authority_score?: number | null
          content?: string
          content_tsvector?: unknown
          created_at?: string | null
          data_freshness?: string | null
          embedding?: string | null
          id?: number
          is_active?: boolean | null
          key_findings?: string[] | null
          metadata?: Json | null
          related_entities?: string[] | null
          research_date?: string | null
          research_prompt?: string
          research_topic?: string
          research_type?: string | null
          researched_at?: string | null
          semantic_keywords?: string[] | null
          source_count?: number | null
          source_urls?: string[] | null
          summary?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      hybrid_scraped_keywords: {
        Row: {
          content: string
          content_tsvector: unknown
          created_at: string | null
          embedding: string | null
          frequency: number | null
          id: number
          is_active: boolean | null
          keyword: string
          keyword_type: string
          metadata: Json | null
          related_entities: string[] | null
          scraped_at: string | null
          search_query: string
          semantic_category: string | null
          source_count: number | null
          source_urls: string[] | null
          updated_at: string | null
        }
        Insert: {
          content: string
          content_tsvector?: unknown
          created_at?: string | null
          embedding?: string | null
          frequency?: number | null
          id?: number
          is_active?: boolean | null
          keyword: string
          keyword_type: string
          metadata?: Json | null
          related_entities?: string[] | null
          scraped_at?: string | null
          search_query: string
          semantic_category?: string | null
          source_count?: number | null
          source_urls?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_tsvector?: unknown
          created_at?: string | null
          embedding?: string | null
          frequency?: number | null
          id?: number
          is_active?: boolean | null
          keyword?: string
          keyword_type?: string
          metadata?: Json | null
          related_entities?: string[] | null
          scraped_at?: string | null
          search_query?: string
          semantic_category?: string | null
          source_count?: number | null
          source_urls?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kenji_harada_architect_knowledge: {
        Row: {
          created_at: string | null
          created_by: string | null
          embedding: string | null
          id: number
          is_active: boolean | null
          key_terms: string[] | null
          metadata: Json | null
          priority: number | null
          related_thoughts: string[] | null
          thought_category: string | null
          thought_content: string
          thought_id: string
          thought_title: string
          tone: string | null
          updated_at: string | null
          usage_context: string | null
          vector_dimensions: number | null
          vector_model: string | null
          vectorization_status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: never
          is_active?: boolean | null
          key_terms?: string[] | null
          metadata?: Json | null
          priority?: number | null
          related_thoughts?: string[] | null
          thought_category?: string | null
          thought_content: string
          thought_id: string
          thought_title: string
          tone?: string | null
          updated_at?: string | null
          usage_context?: string | null
          vector_dimensions?: number | null
          vector_model?: string | null
          vectorization_status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: never
          is_active?: boolean | null
          key_terms?: string[] | null
          metadata?: Json | null
          priority?: number | null
          related_thoughts?: string[] | null
          thought_category?: string | null
          thought_content?: string
          thought_id?: string
          thought_title?: string
          tone?: string | null
          updated_at?: string | null
          usage_context?: string | null
          vector_dimensions?: number | null
          vector_model?: string | null
          vectorization_status?: string | null
        }
        Relationships: []
      }
      knowledge_vectors: {
        Row: {
          authority_score: number | null
          authors: string[] | null
          citation_count: number | null
          content: string
          created_at: string | null
          doi: string | null
          embedding: string
          id: number
          keywords: string[] | null
          knowledge_type: string
          publication_date: string | null
          source: string
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          authority_score?: number | null
          authors?: string[] | null
          citation_count?: number | null
          content: string
          created_at?: string | null
          doi?: string | null
          embedding: string
          id?: number
          keywords?: string[] | null
          knowledge_type: string
          publication_date?: string | null
          source: string
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          authority_score?: number | null
          authors?: string[] | null
          citation_count?: number | null
          content?: string
          created_at?: string | null
          doi?: string | null
          embedding?: string
          id?: number
          keywords?: string[] | null
          knowledge_type?: string
          publication_date?: string | null
          source?: string
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_sales: {
        Row: {
          client_company: string
          course_name: string
          course_type: Database["public"]["Enums"]["course_type_enum"]
          created_at: string | null
          id: string
          participants: number
          partner_commission: number
          partner_commission_rate: number
          partner_id: string
          payment_date: string | null
          referrer_commission: number | null
          referrer_commission_rate: number | null
          referrer_id: string | null
          sale_date: string
          status: Database["public"]["Enums"]["sale_status_enum"] | null
          total_amount: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          client_company: string
          course_name: string
          course_type: Database["public"]["Enums"]["course_type_enum"]
          created_at?: string | null
          id?: string
          participants: number
          partner_commission: number
          partner_commission_rate: number
          partner_id: string
          payment_date?: string | null
          referrer_commission?: number | null
          referrer_commission_rate?: number | null
          referrer_id?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status_enum"] | null
          total_amount: number
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          client_company?: string
          course_name?: string
          course_type?: Database["public"]["Enums"]["course_type_enum"]
          created_at?: string | null
          id?: string
          participants?: number
          partner_commission?: number
          partner_commission_rate?: number
          partner_id?: string
          payment_date?: string | null
          referrer_commission?: number | null
          referrer_commission_rate?: number | null
          referrer_id?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status_enum"] | null
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_sales_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          business_description: string | null
          company_name: string
          created_at: string | null
          direct_revenue: number | null
          email: string
          expected_monthly_deals: number | null
          experience: string | null
          id: string
          is_active: boolean | null
          monthly_fee_paid: boolean | null
          motivation: string | null
          parent_partner_id: string | null
          partner_type: Database["public"]["Enums"]["partner_type_enum"]
          password_hash: string | null
          phone: string | null
          referral_code: string
          referral_revenue: number | null
          representative_name: string
          social_media: string | null
          status: Database["public"]["Enums"]["partner_status_enum"] | null
          temp_password: string | null
          total_referrals: number | null
          total_revenue: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          business_description?: string | null
          company_name: string
          created_at?: string | null
          direct_revenue?: number | null
          email: string
          expected_monthly_deals?: number | null
          experience?: string | null
          id?: string
          is_active?: boolean | null
          monthly_fee_paid?: boolean | null
          motivation?: string | null
          parent_partner_id?: string | null
          partner_type: Database["public"]["Enums"]["partner_type_enum"]
          password_hash?: string | null
          phone?: string | null
          referral_code: string
          referral_revenue?: number | null
          representative_name: string
          social_media?: string | null
          status?: Database["public"]["Enums"]["partner_status_enum"] | null
          temp_password?: string | null
          total_referrals?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          business_description?: string | null
          company_name?: string
          created_at?: string | null
          direct_revenue?: number | null
          email?: string
          expected_monthly_deals?: number | null
          experience?: string | null
          id?: string
          is_active?: boolean | null
          monthly_fee_paid?: boolean | null
          motivation?: string | null
          parent_partner_id?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type_enum"]
          password_hash?: string | null
          phone?: string | null
          referral_code?: string
          referral_revenue?: number | null
          representative_name?: string
          social_media?: string | null
          status?: Database["public"]["Enums"]["partner_status_enum"] | null
          temp_password?: string | null
          total_referrals?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_parent_partner_id_fkey"
            columns: ["parent_partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_parent_partner_id_fkey"
            columns: ["parent_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_story_rag: {
        Row: {
          content: string
          core_theme: string
          created_at: string | null
          embedding: string | null
          embedding_text: string
          emotion: string
          id: number
          keywords: string[] | null
          rhythm_note: string | null
          section_title: string
          story_arc: string
          use_cases: string[] | null
          voice_direction: string | null
        }
        Insert: {
          content: string
          core_theme: string
          created_at?: string | null
          embedding?: string | null
          embedding_text: string
          emotion: string
          id?: number
          keywords?: string[] | null
          rhythm_note?: string | null
          section_title: string
          story_arc: string
          use_cases?: string[] | null
          voice_direction?: string | null
        }
        Update: {
          content?: string
          core_theme?: string
          created_at?: string | null
          embedding?: string | null
          embedding_text?: string
          emotion?: string
          id?: number
          keywords?: string[] | null
          rhythm_note?: string | null
          section_title?: string
          story_arc?: string
          use_cases?: string[] | null
          voice_direction?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          business_id: number | null
          canonical_url: string | null
          category_id: number | null
          category_tags: string[] | null
          content: string
          created_at: string | null
          id: number
          meta_description: string | null
          meta_keywords: string[] | null
          published_at: string | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          youtube_script_id: number | null
          youtube_script_status: string | null
        }
        Insert: {
          business_id?: number | null
          canonical_url?: string | null
          category_id?: number | null
          category_tags?: string[] | null
          content: string
          created_at?: string | null
          id?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          youtube_script_id?: number | null
          youtube_script_status?: string | null
        }
        Update: {
          business_id?: number | null
          canonical_url?: string | null
          category_id?: number | null
          category_tags?: string[] | null
          content?: string
          created_at?: string | null
          id?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          youtube_script_id?: number | null
          youtube_script_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_youtube_script_id_fkey"
            columns: ["youtube_script_id"]
            isOneToOne: false
            referencedRelation: "company_youtube_shorts"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_data_statistics: {
        Row: {
          avg_duration_ms: number | null
          avg_similarity: number | null
          created_at: string
          id: number
          source_type: string
          stat_date: string
          total_searches: number | null
          total_vectors: number | null
          updated_at: string
        }
        Insert: {
          avg_duration_ms?: number | null
          avg_similarity?: number | null
          created_at?: string
          id?: number
          source_type: string
          stat_date?: string
          total_searches?: number | null
          total_vectors?: number | null
          updated_at?: string
        }
        Update: {
          avg_duration_ms?: number | null
          avg_similarity?: number | null
          created_at?: string
          id?: number
          source_type?: string
          stat_date?: string
          total_searches?: number | null
          total_vectors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rag_search_logs: {
        Row: {
          avg_similarity: number | null
          created_at: string
          id: number
          ip_address: unknown
          query: string
          results_count: number | null
          search_duration_ms: number | null
          sources: Json | null
          top_similarity: number | null
          user_agent: string | null
        }
        Insert: {
          avg_similarity?: number | null
          created_at?: string
          id?: number
          ip_address?: unknown
          query: string
          results_count?: number | null
          search_duration_ms?: number | null
          sources?: Json | null
          top_similarity?: number | null
          user_agent?: string | null
        }
        Update: {
          avg_similarity?: number | null
          created_at?: string
          id?: number
          ip_address?: unknown
          query?: string
          results_count?: number | null
          search_duration_ms?: number | null
          sources?: Json | null
          top_similarity?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      referral_links: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          partner_id: string
          referral_url: string
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          partner_id: string
          referral_url: string
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          partner_id?: string
          referral_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_links_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_links_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_company: string | null
          author_email: string
          author_name: string
          author_position: string | null
          created_at: string | null
          id: number
          is_approved: boolean | null
          is_public: boolean | null
          rating: number
          review_body: string
          service_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_company?: string | null
          author_email: string
          author_name: string
          author_position?: string | null
          created_at?: string | null
          id?: number
          is_approved?: boolean | null
          is_public?: boolean | null
          rating: number
          review_body: string
          service_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_company?: string | null
          author_email?: string
          author_name?: string
          author_position?: string | null
          created_at?: string | null
          id?: number
          is_approved?: boolean | null
          is_public?: boolean | null
          rating?: number
          review_body?: string
          service_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      semantic_similarity_cache: {
        Row: {
          context_type: string
          id: number
          last_calculated: string | null
          similarity_score: number
          source_id: string
          target_id: string
        }
        Insert: {
          context_type: string
          id?: number
          last_calculated?: string | null
          similarity_score: number
          source_id: string
          target_id: string
        }
        Update: {
          context_type?: string
          id?: number
          last_calculated?: string | null
          similarity_score?: number
          source_id?: string
          target_id?: string
        }
        Relationships: []
      }
      similarity_history: {
        Row: {
          company_rag_contribution: number | null
          complete_uri: string
          created_at: string | null
          data_source: string
          dynamic_rag_contribution: number | null
          fragment_id: string
          id: string
          measured_at: string | null
          measurement_type: string | null
          similarity_score: number
          trend_rag_contribution: number | null
        }
        Insert: {
          company_rag_contribution?: number | null
          complete_uri: string
          created_at?: string | null
          data_source: string
          dynamic_rag_contribution?: number | null
          fragment_id: string
          id?: string
          measured_at?: string | null
          measurement_type?: string | null
          similarity_score: number
          trend_rag_contribution?: number | null
        }
        Update: {
          company_rag_contribution?: number | null
          complete_uri?: string
          created_at?: string | null
          data_source?: string
          dynamic_rag_contribution?: number | null
          fragment_id?: string
          id?: string
          measured_at?: string | null
          measurement_type?: string | null
          similarity_score?: number
          trend_rag_contribution?: number | null
        }
        Relationships: []
      }
      system_locks: {
        Row: {
          created_at: string | null
          id: number
          lock_key: string
          locked_at: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          lock_key: string
          locked_at: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          lock_key?: string
          locked_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      thumbnail_base_images: {
        Row: {
          color_scheme: Json | null
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
          pattern_type: string
          text_position: Json | null
          updated_at: string | null
          url: string
        }
        Insert: {
          color_scheme?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          pattern_type: string
          text_position?: Json | null
          updated_at?: string | null
          url: string
        }
        Update: {
          color_scheme?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          pattern_type?: string
          text_position?: Json | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      thumbnail_stock: {
        Row: {
          alt_text: string | null
          created_at: string | null
          filename: string
          id: number
          is_active: boolean | null
          uploaded_at: string | null
          url: string
          usage_count: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          filename: string
          id?: number
          is_active?: boolean | null
          uploaded_at?: string | null
          url: string
          usage_count?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          filename?: string
          id?: number
          is_active?: boolean | null
          uploaded_at?: string | null
          url?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      trend_rag: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: number
          is_active: boolean | null
          relevance_score: number | null
          trend_category: string | null
          trend_content: string
          trend_date: string
          trend_source: string | null
          trend_title: string
          trend_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: number
          is_active?: boolean | null
          relevance_score?: number | null
          trend_category?: string | null
          trend_content: string
          trend_date?: string
          trend_source?: string | null
          trend_title: string
          trend_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: number
          is_active?: boolean | null
          relevance_score?: number | null
          trend_category?: string | null
          trend_content?: string
          trend_date?: string
          trend_source?: string | null
          trend_title?: string
          trend_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trend_vectors: {
        Row: {
          content: string
          content_id: string
          content_tsvector: unknown
          content_type: string
          created_at: string | null
          embedding: string
          id: number
          keywords: string[] | null
          metadata: Json | null
          popularity_score: number | null
          relevance_score: number | null
          source: string
          source_url: string | null
          trend_date: string
          trend_topic: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_id: string
          content_tsvector?: unknown
          content_type?: string
          created_at?: string | null
          embedding: string
          id?: number
          keywords?: string[] | null
          metadata?: Json | null
          popularity_score?: number | null
          relevance_score?: number | null
          source: string
          source_url?: string | null
          trend_date: string
          trend_topic: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_id?: string
          content_tsvector?: unknown
          content_type?: string
          created_at?: string | null
          embedding?: string
          id?: number
          keywords?: string[] | null
          metadata?: Json | null
          popularity_score?: number | null
          relevance_score?: number | null
          source?: string
          source_url?: string | null
          trend_date?: string
          trend_topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vector_search_stats: {
        Row: {
          avg_similarity: number | null
          created_at: string | null
          execution_time_ms: number | null
          id: number
          query_text: string
          results_count: number | null
          search_type: string
        }
        Insert: {
          avg_similarity?: number | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: number
          query_text: string
          results_count?: number | null
          search_type: string
        }
        Update: {
          avg_similarity?: number | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: number
          query_text?: string
          results_count?: number | null
          search_type?: string
        }
        Relationships: []
      }
      video_jobs: {
        Row: {
          akool_job_id: string | null
          akool_video_url: string | null
          article_slug: string | null
          avatar: Json | null
          background: Json | null
          caption: Json | null
          created_at: string
          final_video_url: string | null
          id: string
          metrics: Json | null
          music: Json | null
          related_blog_post_id: number | null
          script_raw: string
          script_struct: Json | null
          status: string
          timeline: Json | null
          title_internal: string
          updated_at: string
          user_id: string
          voice: Json | null
          youtube_description: string | null
          youtube_published_at: string | null
          youtube_tags: string[] | null
          youtube_title: string
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          akool_job_id?: string | null
          akool_video_url?: string | null
          article_slug?: string | null
          avatar?: Json | null
          background?: Json | null
          caption?: Json | null
          created_at?: string
          final_video_url?: string | null
          id?: string
          metrics?: Json | null
          music?: Json | null
          related_blog_post_id?: number | null
          script_raw: string
          script_struct?: Json | null
          status?: string
          timeline?: Json | null
          title_internal: string
          updated_at?: string
          user_id: string
          voice?: Json | null
          youtube_description?: string | null
          youtube_published_at?: string | null
          youtube_tags?: string[] | null
          youtube_title: string
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          akool_job_id?: string | null
          akool_video_url?: string | null
          article_slug?: string | null
          avatar?: Json | null
          background?: Json | null
          caption?: Json | null
          created_at?: string
          final_video_url?: string | null
          id?: string
          metrics?: Json | null
          music?: Json | null
          related_blog_post_id?: number | null
          script_raw?: string
          script_struct?: Json | null
          status?: string
          timeline?: Json | null
          title_internal?: string
          updated_at?: string
          user_id?: string
          voice?: Json | null
          youtube_description?: string | null
          youtube_published_at?: string | null
          youtube_tags?: string[] | null
          youtube_title?: string
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_jobs_related_blog_post_id_fkey"
            columns: ["related_blog_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      viral_hook_patterns: {
        Row: {
          created_at: string | null
          description: string | null
          effectiveness_score: number
          example: string | null
          id: string
          name: string
          pattern_id: string
          source: string | null
          target_audience: string
          template: string
          type: string
          updated_at: string | null
          use_cases: string[] | null
          variables: string[]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effectiveness_score?: number
          example?: string | null
          id?: string
          name: string
          pattern_id: string
          source?: string | null
          target_audience: string
          template: string
          type: string
          updated_at?: string | null
          use_cases?: string[] | null
          variables: string[]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effectiveness_score?: number
          example?: string | null
          id?: string
          name?: string
          pattern_id?: string
          source?: string | null
          target_audience?: string
          template?: string
          type?: string
          updated_at?: string | null
          use_cases?: string[] | null
          variables?: string[]
        }
        Relationships: []
      }
      youtube_auth: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          scope: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          scope: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          scope?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      youtube_vectors: {
        Row: {
          channel_name: string
          complexity_level: number | null
          content: string
          content_id: string
          content_tsvector: unknown
          content_type: string
          created_at: string
          educational_score: number | null
          embedding: string
          id: number
          implementation_score: number | null
          keywords: string[] | null
          like_count: number | null
          metadata: Json | null
          published_at: string
          relevance_score: number | null
          source: string
          source_url: string
          transcript_language: string | null
          updated_at: string
          video_duration_seconds: number | null
          video_title: string
          video_url: string
          view_count: number | null
        }
        Insert: {
          channel_name: string
          complexity_level?: number | null
          content: string
          content_id: string
          content_tsvector?: unknown
          content_type?: string
          created_at?: string
          educational_score?: number | null
          embedding: string
          id?: never
          implementation_score?: number | null
          keywords?: string[] | null
          like_count?: number | null
          metadata?: Json | null
          published_at: string
          relevance_score?: number | null
          source?: string
          source_url: string
          transcript_language?: string | null
          updated_at?: string
          video_duration_seconds?: number | null
          video_title: string
          video_url: string
          view_count?: number | null
        }
        Update: {
          channel_name?: string
          complexity_level?: number | null
          content?: string
          content_id?: string
          content_tsvector?: unknown
          content_type?: string
          created_at?: string
          educational_score?: number | null
          embedding?: string
          id?: never
          implementation_score?: number | null
          keywords?: string[] | null
          like_count?: number | null
          metadata?: Json | null
          published_at?: string
          relevance_score?: number | null
          source?: string
          source_url?: string
          transcript_language?: string | null
          updated_at?: string
          video_duration_seconds?: number | null
          video_title?: string
          video_url?: string
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      aso_client_analyses: {
        Row: {
          ai_structure_score: number | null
          analysis_data: Json | null
          company_name: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          id: string | null
          score_breakdown: Json | null
          site_description: string | null
          site_title: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          url: string | null
          validation_result: Json | null
        }
        Insert: {
          ai_structure_score?: number | null
          analysis_data?: Json | null
          company_name?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string | null
          score_breakdown?: Json | null
          site_description?: string | null
          site_title?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          url?: string | null
          validation_result?: Json | null
        }
        Update: {
          ai_structure_score?: number | null
          analysis_data?: Json | null
          company_name?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string | null
          score_breakdown?: Json | null
          site_description?: string | null
          site_title?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          url?: string | null
          validation_result?: Json | null
        }
        Relationships: []
      }
      aso_fragment_vectors: {
        Row: {
          analysis_id: string | null
          category: string | null
          complete_uri: string | null
          content: string | null
          content_title: string | null
          content_type: string | null
          created_at: string | null
          embedding: string | null
          fragment_id: string | null
          id: string | null
          metadata: Json | null
          page_path: string | null
          related_entities: string[] | null
          semantic_weight: number | null
          target_queries: string[] | null
          tenant_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          category?: string | null
          complete_uri?: string | null
          content?: string | null
          content_title?: string | null
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          fragment_id?: string | null
          id?: string | null
          metadata?: Json | null
          page_path?: string | null
          related_entities?: string[] | null
          semantic_weight?: number | null
          target_queries?: string[] | null
          tenant_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          category?: string | null
          complete_uri?: string | null
          content?: string | null
          content_title?: string | null
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          fragment_id?: string | null
          id?: string | null
          metadata?: Json | null
          page_path?: string | null
          related_entities?: string[] | null
          semantic_weight?: number | null
          target_queries?: string[] | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      aso_performance_metrics: {
        Row: {
          analysis_id: string | null
          entity_count: number | null
          estimated_cost_usd: number | null
          fragment_count: number | null
          id: string | null
          openai_tokens_used: number | null
          processing_time_ms: number | null
          recorded_at: string | null
          tenant_id: string | null
          validation_errors: number | null
          validation_warnings: number | null
          vector_count: number | null
        }
        Insert: {
          analysis_id?: string | null
          entity_count?: number | null
          estimated_cost_usd?: number | null
          fragment_count?: number | null
          id?: string | null
          openai_tokens_used?: number | null
          processing_time_ms?: number | null
          recorded_at?: string | null
          tenant_id?: string | null
          validation_errors?: number | null
          validation_warnings?: number | null
          vector_count?: number | null
        }
        Update: {
          analysis_id?: string | null
          entity_count?: number | null
          estimated_cost_usd?: number | null
          fragment_count?: number | null
          id?: string | null
          openai_tokens_used?: number | null
          processing_time_ms?: number | null
          recorded_at?: string | null
          tenant_id?: string | null
          validation_errors?: number | null
          validation_warnings?: number | null
          vector_count?: number | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string | null
          created_at: string | null
          id: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clavi_client_analyses: {
        Row: {
          ai_structure_score: number | null
          analysis_data: Json | null
          company_name: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          id: string | null
          pipeline_version: string | null
          score_breakdown: Json | null
          site_description: string | null
          site_title: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          url: string | null
          url_hash: string | null
          validation_result: Json | null
        }
        Insert: {
          ai_structure_score?: number | null
          analysis_data?: Json | null
          company_name?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string | null
          pipeline_version?: string | null
          score_breakdown?: Json | null
          site_description?: string | null
          site_title?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          url?: string | null
          url_hash?: string | null
          validation_result?: Json | null
        }
        Update: {
          ai_structure_score?: number | null
          analysis_data?: Json | null
          company_name?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string | null
          pipeline_version?: string | null
          score_breakdown?: Json | null
          site_description?: string | null
          site_title?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          url?: string | null
          url_hash?: string | null
          validation_result?: Json | null
        }
        Relationships: []
      }
      clavi_fragment_vectors: {
        Row: {
          analysis_id: string | null
          category: string | null
          complete_uri: string | null
          content: string | null
          content_title: string | null
          content_type: string | null
          created_at: string | null
          embedding: string | null
          fragment_id: string | null
          id: string | null
          metadata: Json | null
          page_path: string | null
          related_entities: string[] | null
          semantic_weight: number | null
          target_queries: string[] | null
          tenant_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          category?: string | null
          complete_uri?: string | null
          content?: string | null
          content_title?: string | null
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          fragment_id?: string | null
          id?: string | null
          metadata?: Json | null
          page_path?: string | null
          related_entities?: string[] | null
          semantic_weight?: number | null
          target_queries?: string[] | null
          tenant_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          category?: string | null
          complete_uri?: string | null
          content?: string | null
          content_title?: string | null
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          fragment_id?: string | null
          id?: string | null
          metadata?: Json | null
          page_path?: string | null
          related_entities?: string[] | null
          semantic_weight?: number | null
          target_queries?: string[] | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      clavi_performance_metrics: {
        Row: {
          analysis_id: string | null
          entity_count: number | null
          estimated_cost_usd: number | null
          fragment_count: number | null
          id: string | null
          openai_tokens_used: number | null
          processing_time_ms: number | null
          recorded_at: string | null
          tenant_id: string | null
          validation_errors: number | null
          validation_warnings: number | null
          vector_count: number | null
        }
        Insert: {
          analysis_id?: string | null
          entity_count?: number | null
          estimated_cost_usd?: number | null
          fragment_count?: number | null
          id?: string | null
          openai_tokens_used?: number | null
          processing_time_ms?: number | null
          recorded_at?: string | null
          tenant_id?: string | null
          validation_errors?: number | null
          validation_warnings?: number | null
          vector_count?: number | null
        }
        Update: {
          analysis_id?: string | null
          entity_count?: number | null
          estimated_cost_usd?: number | null
          fragment_count?: number | null
          id?: string | null
          openai_tokens_used?: number | null
          processing_time_ms?: number | null
          recorded_at?: string | null
          tenant_id?: string | null
          validation_errors?: number | null
          validation_warnings?: number | null
          vector_count?: number | null
        }
        Relationships: []
      }
      clavi_tenants_admin_view: {
        Row: {
          analysis_count: number | null
          created_at: string | null
          id: string | null
          member_count: number | null
          name: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_count?: never
          created_at?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_count?: never
          created_at?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          invited_by: string | null
          status: string | null
          target_email: string | null
          target_role: string | null
          tenant_id: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          invited_by?: string | null
          status?: string | null
          target_email?: string | null
          target_role?: string | null
          tenant_id?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          invited_by?: string | null
          status?: string | null
          target_email?: string | null
          target_role?: string | null
          tenant_id?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_dashboard_view: {
        Row: {
          company_name: string | null
          created_at: string | null
          direct_revenue: number | null
          email: string | null
          id: string | null
          is_active: boolean | null
          latest_sale_date: string | null
          my_referrals: number | null
          partner_type: Database["public"]["Enums"]["partner_type_enum"] | null
          referral_code: string | null
          referral_revenue: number | null
          representative_name: string | null
          status: Database["public"]["Enums"]["partner_status_enum"] | null
          this_month_confirmed: number | null
          this_month_pending: number | null
          this_month_total: number | null
          total_referrals: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_tenants: {
        Row: {
          created_at: string | null
          role: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: Json }
      calculate_commission: {
        Args: { has_referrer: boolean; total_amount: number }
        Returns: {
          partner_commission: number
          partner_rate: number
          referrer_commission: number
          referrer_rate: number
        }[]
      }
      check_existing_analysis: {
        Args: {
          p_pipeline_version: string
          p_tenant_id: string
          p_url_hash: string
        }
        Returns: {
          id: string
          status: string
          url: string
        }[]
      }
      check_usage_limit: {
        Args: { p_tenant_id: string; p_year_month?: string }
        Returns: {
          current_usage: number
          is_allowed: boolean
          remaining: number
          tier: string
          usage_limit: number
        }[]
      }
      cleanup_old_audit_logs: {
        Args: { p_retention_days?: number }
        Returns: number
      }
      cleanup_old_trends: { Args: never; Returns: undefined }
      create_invitation: {
        Args: { p_target_email: string; p_target_role?: string }
        Returns: Json
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      delete_tenant: { Args: never; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      get_current_tenant_context: {
        Args: never
        Returns: {
          tenant_id: string
          tenant_role: string
        }[]
      }
      get_my_subscription: {
        Args: never
        Returns: {
          cancel_at_period_end: boolean
          current_period_end: string
          current_usage: number
          stripe_price_id: string
          stripe_subscription_id: string
          subscription_status: string
          subscription_tier: string
          tenant_id: string
          tenant_name: string
          usage_limit: number
        }[]
      }
      get_my_usage: {
        Args: never
        Returns: {
          current_usage: number
          is_allowed: boolean
          remaining: number
          tier: string
          usage_limit: number
        }[]
      }
      get_or_create_job_user: { Args: { p_tenant_id: string }; Returns: Json }
      get_tenant_settings: { Args: never; Returns: Json }
      get_tenant_settings_by_id: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      get_user_tenant_by_id: { Args: { p_user_id: string }; Returns: Json }
      get_user_tenant_context: {
        Args: { p_user_id: string }
        Returns: {
          role: string
          tenant_id: string
        }[]
      }
      hybrid_search_company_vectors: {
        Args: {
          bm25_weight?: number
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
          vector_weight?: number
        }
        Returns: {
          bm25_score: number
          combined_score: number
          content: string
          content_id: string
          content_type: string
          created_at: string
          id: number
          metadata: Json
          source: string
          vector_score: number
        }[]
      }
      hybrid_search_deep_research: {
        Args: {
          bm25_weight?: number
          filter_research_type?: string
          match_count?: number
          match_threshold?: number
          min_authority_score?: number
          query_embedding: string
          query_text: string
          vector_weight?: number
        }
        Returns: {
          authority_score: number
          bm25_score: number
          combined_score: number
          content: string
          id: number
          key_findings: string[]
          metadata: Json
          research_topic: string
          research_type: string
          source_urls: string[]
          summary: string
          vector_score: number
        }[]
      }
      hybrid_search_fragment_vectors: {
        Args: {
          bm25_weight?: number
          filter_content_type?: string
          filter_page_path?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
          vector_weight?: number
        }
        Returns: {
          bm25_score: number
          category: string
          combined_score: number
          complete_uri: string
          content: string
          content_title: string
          content_type: string
          created_at: string
          fragment_id: string
          id: number
          metadata: Json
          page_path: string
          vector_score: number
        }[]
      }
      hybrid_search_scraped_keywords: {
        Args: {
          bm25_weight?: number
          filter_keyword_type?: string
          filter_search_query?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
          vector_weight?: number
        }
        Returns: {
          bm25_score: number
          combined_score: number
          content: string
          frequency: number
          id: number
          keyword: string
          keyword_type: string
          metadata: Json
          search_query: string
          vector_score: number
        }[]
      }
      hybrid_search_trend_vectors: {
        Args: {
          bm25_weight?: number
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
          recency_weight?: number
          vector_weight?: number
        }
        Returns: {
          bm25_score: number
          combined_score: number
          id: number
          recency_score: number
          similarity: number
          trend_category: string
          trend_content: string
          trend_date: string
          trend_title: string
          trend_url: string
          vector_score: number
        }[]
      }
      hybrid_search_youtube_vectors: {
        Args: {
          bm25_weight?: number
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
          vector_weight?: number
        }
        Returns: {
          bm25_score: number
          combined_score: number
          content: string
          content_id: string
          content_type: string
          created_at: string
          id: number
          metadata: Json
          vector_score: number
          video_title: string
        }[]
      }
      increment_thumbnail_usage: {
        Args: { thumbnail_id: number }
        Returns: undefined
      }
      increment_usage: {
        Args: { p_tenant_id: string; p_year_month?: string }
        Returns: number
      }
      insert_client_analysis:
        | {
            Args: {
              p_ai_structure_score?: number
              p_analysis_data?: Json
              p_company_name?: string
              p_pipeline_version: string
              p_status?: string
              p_tenant_id: string
              p_url: string
            }
            Returns: {
              id: string
            }[]
          }
        | {
            Args: {
              p_ai_structure_score: number
              p_analysis_data: Json
              p_company_name: string
              p_pipeline_version: string
              p_status: string
              p_tenant_id: string
              p_url: string
              p_url_hash: string
            }
            Returns: {
              id: string
            }[]
          }
      insert_failed_analysis:
        | {
            Args: {
              p_error_message: string
              p_pipeline_version: string
              p_status: string
              p_tenant_id: string
              p_url: string
            }
            Returns: {
              id: string
            }[]
          }
        | {
            Args: {
              p_error_message: string
              p_pipeline_version: string
              p_status: string
              p_tenant_id: string
              p_url: string
              p_url_hash: string
            }
            Returns: {
              id: string
            }[]
          }
      list_client_analyses: {
        Args: { p_limit?: number; p_offset?: number; p_tenant_id: string }
        Returns: {
          ai_structure_score: number
          company_name: string
          created_at: string
          id: string
          site_description: string
          site_title: string
          status: string
          updated_at: string
          url: string
        }[]
      }
      list_members: { Args: never; Returns: Json }
      match_catalyst_thoughts: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          core_message: string
          counterpoint: string
          emotion: string
          emotion_code: string
          id: number
          insertion_style: string
          lang: string
          person: string
          quote: string
          similarity: number
          source_url: string
          subthemes: string[]
          theme: string
          use_cases: string[]
          verify_status: string
          your_voice_paraphrase: string
        }[]
      }
      match_company_vectors: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content_chunk: string
          content_type: string
          created_at: string
          fragment_id: string
          id: number
          metadata: Json
          page_slug: string
          relevance_score: number
          section_title: string
          service_id: string
          similarity: number
        }[]
      }
      match_company_youtube_shorts: {
        Args: {
          filter_status?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          complete_uri: string
          content: string
          content_title: string
          content_type: string
          fragment_id: string
          id: number
          metadata: Json
          page_path: string
          related_entities: string[]
          script_title: string
          semantic_weight: number
          similarity: number
          target_queries: string[]
        }[]
      }
      match_deep_research: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          authority_score: number
          content: string
          created_at: string
          id: number
          key_findings: string[]
          metadata: Json
          research_topic: string
          similarity: number
          source_urls: string[]
          summary: string
        }[]
      }
      match_fragment_vectors: {
        Args: {
          filter_content_type?: string
          filter_page_path?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          complete_uri: string
          content: string
          content_title: string
          content_type: string
          created_at: string
          fragment_id: string
          id: number
          metadata: Json
          page_path: string
          related_entities: string[]
          semantic_weight: number
          similarity: number
          target_queries: string[]
        }[]
      }
      match_kenji_thoughts: {
        Args: {
          filter_category?: string
          filter_usage_context?: string
          match_count?: number
          match_threshold?: number
          only_active?: boolean
          query_embedding: string
        }
        Returns: {
          key_terms: string[]
          metadata: Json
          priority: number
          similarity: number
          thought_category: string
          thought_content: string
          thought_id: string
          thought_title: string
          usage_context: string
        }[]
      }
      match_personal_story_thoughts: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          core_theme: string
          emotion: string
          id: number
          keywords: string[]
          rhythm_note: string
          section_title: string
          similarity: number
          story_arc: string
          use_cases: string[]
          voice_direction: string
        }[]
      }
      match_scraped_keywords: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          created_at: string
          id: number
          keyword: string
          keyword_type: string
          metadata: Json
          scraped_at: string
          similarity: number
          source_urls: string[]
        }[]
      }
      match_trend_vectors: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          created_at: string
          id: number
          keywords: string[]
          metadata: Json
          popularity_score: number
          relevance_score: number
          similarity: number
          source: string
          source_url: string
          trend_date: string
          trend_topic: string
        }[]
      }
      match_youtube_vectors: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          channel_name: string
          complexity_level: number
          content: string
          content_id: string
          content_type: string
          created_at: string
          educational_score: number
          id: number
          implementation_score: number
          keywords: string[]
          like_count: number
          metadata: Json
          published_at: string
          relevance_score: number
          similarity: number
          source: string
          source_url: string
          transcript_language: string
          video_duration_seconds: number
          video_title: string
          video_url: string
          view_count: number
        }[]
      }
      onboard: { Args: { tenant_name: string }; Returns: string }
      remove_member: { Args: { p_user_id: string }; Returns: Json }
      revoke_invitation: { Args: { p_invitation_id: string }; Returns: Json }
      update_member_role: {
        Args: { p_new_role: string; p_user_id: string }
        Returns: Json
      }
      update_tenant: {
        Args: { p_name?: string; p_subscription_tier?: string }
        Returns: Json
      }
      update_tenant_settings: {
        Args: { p_author?: Json; p_same_as?: Json }
        Returns: Json
      }
    }
    Enums: {
      business_type:
        | "fukugyo"
        | "corporate"
        | "reskilling"
        | "personal-reskilling"
      course_type_enum:
        | "ai_development"
        | "aio_re_implementation"
        | "sns_consulting"
      partner_status_enum: "pending" | "approved" | "rejected" | "suspended"
      partner_type_enum: "kol" | "corporate"
      sale_status_enum: "pending" | "confirmed" | "paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      business_type: [
        "fukugyo",
        "corporate",
        "reskilling",
        "personal-reskilling",
      ],
      course_type_enum: [
        "ai_development",
        "aio_re_implementation",
        "sns_consulting",
      ],
      partner_status_enum: ["pending", "approved", "rejected", "suspended"],
      partner_type_enum: ["kol", "corporate"],
      sale_status_enum: ["pending", "confirmed", "paid"],
    },
  },
} as const
