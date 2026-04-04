export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Enums: {
      booking_status:
        | "Nowa"
        | "Potwierdzona"
        | "W realizacji"
        | "Gotowa do odbioru"
        | "Anulowana";
    };
    Tables: {
      bookings: {
        Row: {
          id: string;
          client_id: string;
          vehicle_id: string;
          service_id: string;
          scheduled_at: string;
          duration_minutes: number;
          price: number;
          status: Database["public"]["Enums"]["booking_status"];
          bay: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          vehicle_id: string;
          service_id: string;
          scheduled_at: string;
          duration_minutes?: number;
          price?: number;
          status?: Database["public"]["Enums"]["booking_status"];
          bay?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          base_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          base_price?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      vehicles: {
        Row: {
          id: string;
          client_id: string;
          make: string;
          model: string;
          registration: string;
          production_year: number | null;
          color: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          make: string;
          model: string;
          registration: string;
          production_year?: number | null;
          color?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
      };
    };
  };
};
