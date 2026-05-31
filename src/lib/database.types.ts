export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          name: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          name: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          product_id?: string
          quantity?: number
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
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          status: string
          updated_at: string
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          group_name: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          group_name?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          id: number
          path: string | null
          product_id: string | null
          type: string
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          path?: string | null
          product_id?: string | null
          type: string
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: never
          path?: string | null
          product_id?: string | null
          type?: string
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          line_total: number
          name: string
          order_id: string
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          id?: string
          line_total?: number
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_status: string
          pincode: string | null
          shipping_fee: number
          state: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          pincode?: string | null
          shipping_fee?: number
          state?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          pincode?: string | null
          shipping_fee?: number
          state?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          category: string
          compare_at_price: number | null
          created_at: string
          description: string | null
          hover_image: string | null
          id: string
          image: string | null
          images: string[]
          is_hidden: boolean
          material: string | null
          name: string
          price: number
          slug: string
          sort_order: number
          status: string
          stock_quantity: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          hover_image?: string | null
          id?: string
          image?: string | null
          images?: string[]
          is_hidden?: boolean
          material?: string | null
          name: string
          price?: number
          slug: string
          sort_order?: number
          status?: string
          stock_quantity?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          hover_image?: string | null
          id?: string
          image?: string | null
          images?: string[]
          is_hidden?: boolean
          material?: string | null
          name?: string
          price?: number
          slug?: string
          sort_order?: number
          status?: string
          stock_quantity?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          shopify_product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shopify_product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shopify_product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      customer_signup: {
        Args: {
          p_email: string
          p_full_name?: string
          p_password: string
          p_phone?: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      place_order: {
        Args: {
          p_city: string
          p_email: string
          p_items: Json
          p_line1: string
          p_line2: string
          p_name: string
          p_notes?: string
          p_phone: string
          p_pincode: string
          p_state: string
          p_visitor: string
        }
        Returns: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_status: string
          pincode: string | null
          shipping_fee: number
          state: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          visitor_id: string | null
        }
      }
      sync_cart: {
        Args: { p_email: string; p_items: Json; p_visitor: string }
        Returns: undefined
      }
      track_event: {
        Args: {
          p_path?: string
          p_product?: string
          p_type: string
          p_visitor: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
