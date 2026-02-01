// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          status: 'waiting' | 'playing' | 'finished';
          current_turn: number;
          current_phase: string;
          current_year: number;
          current_player_id: string | null;
          host_player_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          status?: 'waiting' | 'playing' | 'finished';
          current_turn?: number;
          current_phase?: string;
          current_year?: number;
          current_player_id?: string | null;
          host_player_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          status?: 'waiting' | 'playing' | 'finished';
          current_turn?: number;
          current_phase?: string;
          current_year?: number;
          current_player_id?: string | null;
          host_player_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          role: string | null;
          position: number;
          budget: number;
          rank: number;
          is_ready: boolean;
          is_online: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          role?: string | null;
          position?: number;
          budget?: number;
          rank?: number;
          is_ready?: boolean;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          role?: string | null;
          position?: number;
          budget?: number;
          rank?: number;
          is_ready?: boolean;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_states: {
        Row: {
          id: string;
          room_id: string;
          happiness_connection: number;
          happiness_culture: number;
          happiness_safety: number;
          happiness_health: number;
          happiness_environment: number;
          population: number;
          related_population: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          happiness_connection?: number;
          happiness_culture?: number;
          happiness_safety?: number;
          happiness_health?: number;
          happiness_environment?: number;
          population?: number;
          related_population?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          happiness_connection?: number;
          happiness_culture?: number;
          happiness_safety?: number;
          happiness_health?: number;
          happiness_environment?: number;
          population?: number;
          related_population?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      player_hands: {
        Row: {
          id: string;
          player_id: string;
          card_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          card_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          card_id?: string;
          created_at?: string;
        };
      };
      game_logs: {
        Row: {
          id: string;
          room_id: string;
          player_id: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string | null;
          message?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
