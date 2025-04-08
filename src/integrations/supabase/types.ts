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
      ads_campaigns: {
        Row: {
          billing_type: string
          budget_euros: number
          campaign_type: string
          created_at: string
          created_by: string
          display_frequency: number
          end_date: string
          id: string
          is_visible: boolean
          jam_id: string
          name: string
          planned_impressions: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          billing_type: string
          budget_euros: number
          campaign_type: string
          created_at?: string
          created_by: string
          display_frequency?: number
          end_date: string
          id?: string
          is_visible?: boolean
          jam_id: string
          name: string
          planned_impressions: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          billing_type?: string
          budget_euros?: number
          campaign_type?: string
          created_at?: string
          created_by?: string
          display_frequency?: number
          end_date?: string
          id?: string
          is_visible?: boolean
          jam_id?: string
          name?: string
          planned_impressions?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaigns_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_clicks: {
        Row: {
          campaign_id: string
          clicked_at: string
          id: string
          ip_address: string | null
          source_page: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          source_page: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          source_page?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_conversions: {
        Row: {
          campaign_id: string
          click_id: string | null
          conversion_type: string
          conversion_value: number | null
          converted_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          click_id?: string | null
          conversion_type: string
          conversion_value?: number | null
          converted_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          click_id?: string | null
          conversion_type?: string
          conversion_value?: number | null
          converted_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_conversions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_conversions_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "ads_clicks"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_invoices: {
        Row: {
          amount_euros: number
          campaign_id: string
          created_at: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          payment_date: string | null
          payment_method: string | null
          pdf_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_euros: number
          campaign_id: string
          created_at?: string
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          payment_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_euros?: number
          campaign_id?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          payment_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_invoices_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      advice_articles: {
        Row: {
          author_id: string
          content: string | null
          cover_image_url: string | null
          created_at: string | null
          id: string
          published_at: string | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["advice_type"]
          updated_at: string | null
          video_url: string | null
          visible: boolean | null
        }
        Insert: {
          author_id: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["advice_type"]
          updated_at?: string | null
          video_url?: string | null
          visible?: boolean | null
        }
        Update: {
          author_id?: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["advice_type"]
          updated_at?: string | null
          video_url?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      advice_comment_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advice_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "advice_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      advice_comments: {
        Row: {
          article_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advice_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "advice_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advice_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "advice_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      advice_images: {
        Row: {
          article_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "advice_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "advice_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      advice_products: {
        Row: {
          article_id: string | null
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          is_sponsored: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advice_products_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "advice_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      allergens: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          severity: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          severity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          severity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: Database["public"]["Enums"]["badge_category"]
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      battle_candidates: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          is_selected: boolean | null
          motivation: string
          reference_jam_id: string | null
          user_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          is_selected?: boolean | null
          motivation: string
          reference_jam_id?: string | null
          user_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          is_selected?: boolean | null
          motivation?: string
          reference_jam_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_candidates_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_candidates_reference_jam_id_fkey"
            columns: ["reference_jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_candidates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_criterias: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          weight: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          weight?: number
        }
        Relationships: []
      }
      battle_judges: {
        Row: {
          battle_id: string
          created_at: string
          has_ordered: boolean
          has_received: boolean
          id: string
          is_validated: boolean
          user_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          has_ordered?: boolean
          has_received?: boolean
          id?: string
          is_validated?: boolean
          user_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          has_ordered?: boolean
          has_received?: boolean
          id?: string
          is_validated?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_judges_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_judges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_participants: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          jam_id: string | null
          user_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          jam_id?: string | null
          user_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          jam_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_results: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          participant_a_id: string
          participant_a_score: number | null
          participant_b_id: string
          participant_b_score: number | null
          reward_distributed: boolean
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          participant_a_id: string
          participant_a_score?: number | null
          participant_b_id: string
          participant_b_score?: number | null
          reward_distributed?: boolean
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          participant_a_id?: string
          participant_a_score?: number | null
          participant_b_id?: string
          participant_b_score?: number | null
          reward_distributed?: boolean
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_results_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: true
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_results_participant_a_id_fkey"
            columns: ["participant_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_results_participant_b_id_fkey"
            columns: ["participant_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_results_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_shipments: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
          shipped_at: string | null
          status: string
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
          shipped_at?: string | null
          status?: string
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          shipped_at?: string | null
          status?: string
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_shipments_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_shipments_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_shipments_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_stars: {
        Row: {
          created_at: string
          id: string
          last_battle_date: string | null
          participations: number
          total_score: number
          updated_at: string
          user_id: string
          victories: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_battle_date?: string | null
          participations?: number
          total_score?: number
          updated_at?: string
          user_id: string
          victories?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_battle_date?: string | null
          participations?: number
          total_score?: number
          updated_at?: string
          user_id?: string
          victories?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_stars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_vote_comments: {
        Row: {
          battle_id: string
          comment: string
          created_at: string
          id: string
          is_draft: boolean
          judge_id: string
          participant_id: string
          updated_at: string
        }
        Insert: {
          battle_id: string
          comment: string
          created_at?: string
          id?: string
          is_draft?: boolean
          judge_id: string
          participant_id: string
          updated_at?: string
        }
        Update: {
          battle_id?: string
          comment?: string
          created_at?: string
          id?: string
          is_draft?: boolean
          judge_id?: string
          participant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_vote_comments_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_vote_comments_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_vote_comments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          user_id: string
          voted_for_jam_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          user_id: string
          voted_for_jam_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          user_id?: string
          voted_for_jam_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_voted_for_jam_id_fkey"
            columns: ["voted_for_jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_votes_detailed: {
        Row: {
          battle_id: string
          created_at: string
          criteria_id: string
          id: string
          judge_id: string
          participant_id: string
          score: number
          updated_at: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          criteria_id: string
          id?: string
          judge_id: string
          participant_id: string
          score: number
          updated_at?: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          criteria_id?: string
          id?: string
          judge_id?: string
          participant_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_votes_detailed_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_detailed_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "battle_criterias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_detailed_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_detailed_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          jam_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          jam_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          jam_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          related_order_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          related_order_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          related_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          jam_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jam_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jam_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_battles: {
        Row: {
          end_date: string
          id: string
          is_active: boolean
          jam_a_id: string
          jam_b_id: string
          start_date: string
          votes_for_a: number
          votes_for_b: number
        }
        Insert: {
          end_date: string
          id?: string
          is_active?: boolean
          jam_a_id: string
          jam_b_id: string
          start_date?: string
          votes_for_a?: number
          votes_for_b?: number
        }
        Update: {
          end_date?: string
          id?: string
          is_active?: boolean
          jam_a_id?: string
          jam_b_id?: string
          start_date?: string
          votes_for_a?: number
          votes_for_b?: number
        }
        Relationships: [
          {
            foreignKeyName: "jam_battles_jam_a_id_fkey"
            columns: ["jam_a_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jam_battles_jam_b_id_fkey"
            columns: ["jam_b_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_battles_new: {
        Row: {
          constraints: Json
          created_at: string
          id: string
          is_featured: boolean
          judge_discount_percent: number
          max_judges: number
          max_price_credits: number
          min_jams_required: number
          production_end_date: string
          registration_end_date: string
          registration_start_date: string
          reward_credits: number
          reward_description: string | null
          status: Database["public"]["Enums"]["battle_status"]
          theme: string
          updated_at: string
          voting_end_date: string
        }
        Insert: {
          constraints?: Json
          created_at?: string
          id?: string
          is_featured?: boolean
          judge_discount_percent?: number
          max_judges?: number
          max_price_credits?: number
          min_jams_required?: number
          production_end_date: string
          registration_end_date: string
          registration_start_date?: string
          reward_credits?: number
          reward_description?: string | null
          status?: Database["public"]["Enums"]["battle_status"]
          theme: string
          updated_at?: string
          voting_end_date: string
        }
        Update: {
          constraints?: Json
          created_at?: string
          id?: string
          is_featured?: boolean
          judge_discount_percent?: number
          max_judges?: number
          max_price_credits?: number
          min_jams_required?: number
          production_end_date?: string
          registration_end_date?: string
          registration_start_date?: string
          reward_credits?: number
          reward_description?: string | null
          status?: Database["public"]["Enums"]["battle_status"]
          theme?: string
          updated_at?: string
          voting_end_date?: string
        }
        Relationships: []
      }
      jam_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          jam_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          jam_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          jam_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_images_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_reviews: {
        Row: {
          balance_rating: number
          comment: string | null
          created_at: string
          id: string
          jam_id: string
          originality_rating: number
          reviewer_id: string
          taste_rating: number
          texture_rating: number
          updated_at: string
        }
        Insert: {
          balance_rating: number
          comment?: string | null
          created_at?: string
          id?: string
          jam_id: string
          originality_rating: number
          reviewer_id: string
          taste_rating: number
          texture_rating: number
          updated_at?: string
        }
        Update: {
          balance_rating?: number
          comment?: string | null
          created_at?: string
          id?: string
          jam_id?: string
          originality_rating?: number
          reviewer_id?: string
          taste_rating?: number
          texture_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_reviews_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      jams: {
        Row: {
          allergens: string[] | null
          available_quantity: number
          badges: string[] | null
          created_at: string
          creator_id: string
          description: string
          id: string
          ingredients: string[]
          is_active: boolean
          is_pro: boolean | null
          name: string
          price_credits: number
          price_euros: number | null
          production_date: string | null
          recipe: string | null
          rejection_reason: string | null
          shelf_life_months: number | null
          special_edition: boolean | null
          status: string | null
          sugar_content: number | null
          type: string | null
          updated_at: string
          weight_grams: number
        }
        Insert: {
          allergens?: string[] | null
          available_quantity?: number
          badges?: string[] | null
          created_at?: string
          creator_id: string
          description: string
          id?: string
          ingredients: string[]
          is_active?: boolean
          is_pro?: boolean | null
          name: string
          price_credits: number
          price_euros?: number | null
          production_date?: string | null
          recipe?: string | null
          rejection_reason?: string | null
          shelf_life_months?: number | null
          special_edition?: boolean | null
          status?: string | null
          sugar_content?: number | null
          type?: string | null
          updated_at?: string
          weight_grams: number
        }
        Update: {
          allergens?: string[] | null
          available_quantity?: number
          badges?: string[] | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          ingredients?: string[]
          is_active?: boolean
          is_pro?: boolean | null
          name?: string
          price_credits?: number
          price_euros?: number | null
          production_date?: string | null
          recipe?: string | null
          rejection_reason?: string | null
          shelf_life_months?: number | null
          special_edition?: boolean | null
          status?: string | null
          sugar_content?: number | null
          type?: string | null
          updated_at?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "jams_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          jam_id: string
          quantity: number
          seller_id: string
          shipping_address: string
          status: Database["public"]["Enums"]["order_status"]
          total_credits: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          jam_id: string
          quantity?: number
          seller_id: string
          shipping_address: string
          status?: Database["public"]["Enums"]["order_status"]
          total_credits: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          jam_id?: string
          quantity?: number
          seller_id?: string
          shipping_address?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_credits?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_profiles: {
        Row: {
          billing_address: string | null
          business_email: string
          company_name: string
          created_at: string
          description: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          phone: string | null
          story: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          billing_address?: string | null
          business_email: string
          company_name: string
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          phone?: string | null
          story?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          billing_address?: string | null
          business_email?: string
          company_name?: string
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          phone?: string | null
          story?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      recipe_badge_assignments: {
        Row: {
          badge_id: string
          created_at: string
          id: string
          recipe_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          id?: string
          recipe_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_badge_assignments_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "recipe_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_badge_assignments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_badges: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      recipe_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_helpful: boolean | null
          recipe_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_helpful?: boolean | null
          recipe_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_helpful?: boolean | null
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_favorites: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          base_quantity: number
          created_at: string
          id: string
          is_allergen: boolean
          name: string
          recipe_id: string
          unit: string
        }
        Insert: {
          base_quantity: number
          created_at?: string
          id?: string
          is_allergen?: boolean
          name: string
          recipe_id: string
          unit: string
        }
        Update: {
          base_quantity?: number
          created_at?: string
          id?: string
          is_allergen?: boolean
          name?: string
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          author_id: string
          created_at: string
          difficulty: Database["public"]["Enums"]["recipe_difficulty"]
          id: string
          image_url: string | null
          instructions: Json
          jam_id: string | null
          prep_time_minutes: number
          rejection_reason: string | null
          season: Database["public"]["Enums"]["recipe_season"]
          status: Database["public"]["Enums"]["recipe_status"]
          style: Database["public"]["Enums"]["recipe_style"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          id?: string
          image_url?: string | null
          instructions: Json
          jam_id?: string | null
          prep_time_minutes: number
          rejection_reason?: string | null
          season?: Database["public"]["Enums"]["recipe_season"]
          status?: Database["public"]["Enums"]["recipe_status"]
          style?: Database["public"]["Enums"]["recipe_style"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          id?: string
          image_url?: string | null
          instructions?: Json
          jam_id?: string | null
          prep_time_minutes?: number
          rejection_reason?: string | null
          season?: Database["public"]["Enums"]["recipe_season"]
          status?: Database["public"]["Enums"]["recipe_status"]
          style?: Database["public"]["Enums"]["recipe_style"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          jam_id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          jam_id: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          jam_id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_fruits: {
        Row: {
          apr: boolean
          aug: boolean
          conservation_tips: string | null
          created_at: string
          dec: boolean
          description: string | null
          feb: boolean
          id: string
          image_url: string | null
          jan: boolean
          jul: boolean
          jun: boolean
          mar: boolean
          may: boolean
          name: string
          nov: boolean
          oct: boolean
          sep: boolean
          updated_at: string
        }
        Insert: {
          apr?: boolean
          aug?: boolean
          conservation_tips?: string | null
          created_at?: string
          dec?: boolean
          description?: string | null
          feb?: boolean
          id?: string
          image_url?: string | null
          jan?: boolean
          jul?: boolean
          jun?: boolean
          mar?: boolean
          may?: boolean
          name: string
          nov?: boolean
          oct?: boolean
          sep?: boolean
          updated_at?: string
        }
        Update: {
          apr?: boolean
          aug?: boolean
          conservation_tips?: string | null
          created_at?: string
          dec?: boolean
          description?: string | null
          feb?: boolean
          id?: string
          image_url?: string | null
          jan?: boolean
          jul?: boolean
          jun?: boolean
          mar?: boolean
          may?: boolean
          name?: string
          nov?: boolean
          oct?: boolean
          sep?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_jam_average_rating: {
        Args: { jam_uuid: string }
        Returns: number
      }
      calculate_recipe_average_rating: {
        Args: { recipe_uuid: string }
        Returns: number
      }
      random_date_last_6months: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      advice_type:
        | "fruits"
        | "cuisson"
        | "recette"
        | "conditionnement"
        | "sterilisation"
        | "materiel"
      badge_category: "achievement" | "specialty" | "community"
      battle_status:
        | "inscription"
        | "selection"
        | "production"
        | "envoi"
        | "vote"
        | "termine"
      order_status:
        | "pending"
        | "accepted"
        | "shipped"
        | "delivered"
        | "cancelled"
      recipe_difficulty: "facile" | "moyen" | "avancé"
      recipe_season:
        | "printemps"
        | "été"
        | "automne"
        | "hiver"
        | "toutes_saisons"
      recipe_status: "brouillon" | "pending" | "approved" | "rejected"
      recipe_style:
        | "fruitée"
        | "épicée"
        | "sans_sucre"
        | "traditionnelle"
        | "exotique"
        | "bio"
      user_role: "user" | "pro" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      advice_type: [
        "fruits",
        "cuisson",
        "recette",
        "conditionnement",
        "sterilisation",
        "materiel",
      ],
      badge_category: ["achievement", "specialty", "community"],
      battle_status: [
        "inscription",
        "selection",
        "production",
        "envoi",
        "vote",
        "termine",
      ],
      order_status: [
        "pending",
        "accepted",
        "shipped",
        "delivered",
        "cancelled",
      ],
      recipe_difficulty: ["facile", "moyen", "avancé"],
      recipe_season: ["printemps", "été", "automne", "hiver", "toutes_saisons"],
      recipe_status: ["brouillon", "pending", "approved", "rejected"],
      recipe_style: [
        "fruitée",
        "épicée",
        "sans_sucre",
        "traditionnelle",
        "exotique",
        "bio",
      ],
      user_role: ["user", "pro", "moderator", "admin"],
    },
  },
} as const
