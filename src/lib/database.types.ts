export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
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
          status: Database['public']['Enums']['booking_status'];
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
          status?: Database['public']['Enums']['booking_status'];
          bay?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          vehicle_id?: string;
          service_id?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          price?: number;
          status?: Database['public']['Enums']['booking_status'];
          bay?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
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
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          notes?: string | null;
        };
        Relationships: [];
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
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          base_price?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          booking_id: string | null;
          vehicle_id: string | null;
          storage_path: string;
          image_url: string;
          type: 'Before' | 'After' | 'WIP' | 'Finished' | null;
          is_featured: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          vehicle_id?: string | null;
          storage_path: string;
          image_url: string;
          type?: 'Before' | 'After' | 'WIP' | 'Finished' | null;
          is_featured?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          vehicle_id?: string | null;
          storage_path?: string;
          image_url?: string;
          type?: 'Before' | 'After' | 'WIP' | 'Finished' | null;
          is_featured?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_images_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_images_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
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
          featured_image_url: string | null;
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
          featured_image_url?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          make?: string;
          model?: string;
          registration?: string;
          production_year?: number | null;
          color?: string | null;
          featured_image_url?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'vehicles_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      booking_status:
        | 'Nowa'
        | 'Potwierdzona'
        | 'W realizacji'
        | 'Gotowa do odbioru'
        | 'Anulowana';
    };
    CompositeTypes: Record<string, never>;
  };
};
