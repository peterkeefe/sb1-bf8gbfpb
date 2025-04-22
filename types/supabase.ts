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
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as we create them
    }
  }
}