import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: () => {
        throw new Error(
          'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables. ' +
          'You can find these in your Supabase Project Settings > API.'
        );
      }
    });

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'seller' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'seller' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'seller' | 'admin'
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          description: string | null
          price: number
          discount_price: number | null
          stock_quantity: number
          category: string
          images: string[]
          video_url: string | null
          variants: Json | null
          specifications: Json | null
          shipping_fee: number
          is_verified_seller: boolean
          created_at: string
          updated_at: string
        }
      }
      china_orders: {
        Row: {
          id: string
          user_id: string
          product_url: string | null
          image_url: string | null
          description: string | null
          quantity: number
          preferences: Json | null
          shipping_method: string
          destination: string
          budget: number | null
          status: string
          quotation_price: number | null
          shipping_fee: number | null
          estimated_delivery: string | null
          tracking_number: string | null
          shipment_proof_url: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
