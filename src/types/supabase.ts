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
      case_evidence: {
        Row: {
          case_id: string
          chain_of_custody: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          evidence_type: string
          found_date: string | null
          id: string
          location_found: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          chain_of_custody?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_type: string
          found_date?: string | null
          id?: string
          location_found?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          chain_of_custody?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_type?: string
          found_date?: string | null
          id?: string
          location_found?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_evidence_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      case_files: {
        Row: {
          case_id: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_officers: Json
          created_at: string | null
          date_created: string
          description: string
          id: string
          last_updated: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_officers: Json
          created_at?: string | null
          date_created: string
          description: string
          id?: string
          last_updated: string
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_officers?: Json
          created_at?: string | null
          date_created?: string
          description?: string
          id?: string
          last_updated?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crime_statistics: {
        Row: {
          category: string
          count: number
          created_at: string | null
          date: string
          id: string
          region: string
          time_of_day: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          count: number
          created_at?: string | null
          date: string
          id?: string
          region: string
          time_of_day?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          count?: number
          created_at?: string | null
          date?: string
          id?: string
          region?: string
          time_of_day?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      datasets: {
        Row: {
          created_at: string | null
          description: string | null
          format: string | null
          id: string
          last_updated: string
          name: string
          size: string
          source: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string
          last_updated: string
          name: string
          size: string
          source?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string
          last_updated?: string
          name?: string
          size?: string
          source?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      emergency_calls: {
        Row: {
          caller_name: string
          created_at: string | null
          description: string
          id: string
          location: string
          phone_number: string
          priority: string
          resolved_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          caller_name: string
          created_at?: string | null
          description: string
          id?: string
          location: string
          phone_number: string
          priority: string
          resolved_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          caller_name?: string
          created_at?: string | null
          description?: string
          id?: string
          location?: string
          phone_number?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      emergency_units: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          location: string
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          location: string
          name: string
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          location?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      evidence: {
        Row: {
          case_id: string | null
          created_at: string | null
          date_collected: string
          description: string | null
          id: string
          location: string
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          date_collected: string
          description?: string | null
          id?: string
          location: string
          name: string
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          date_collected?: string
          description?: string | null
          id?: string
          location?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      officers: {
        Row: {
          badge: string
          created_at: string | null
          department: string
          id: string
          join_date: string
          name: string
          performance: number
          rank: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          badge: string
          created_at?: string | null
          department: string
          id?: string
          join_date: string
          name: string
          performance: number
          rank: string
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          badge?: string
          created_at?: string | null
          department?: string
          id?: string
          join_date?: string
          name?: string
          performance?: number
          rank?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      persons: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          id_number: string | null
          id_type: string | null
          last_name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          department_id: string
          description: string
          evidence_refs: string | null
          id: string
          incident_date: string
          involved_parties: string | null
          location: string
          officer_id: string
          status: string
          submitted_date: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          description: string
          evidence_refs?: string | null
          id?: string
          incident_date: string
          involved_parties?: string | null
          location: string
          officer_id: string
          status: string
          submitted_date: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          description?: string
          evidence_refs?: string | null
          id?: string
          incident_date?: string
          involved_parties?: string | null
          location?: string
          officer_id?: string
          status?: string
          submitted_date?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      statements: {
        Row: {
          case_id: string
          created_at: string | null
          created_by: string | null
          id: string
          person_id: string | null
          person_type: string
          recording_filename: string | null
          recording_url: string | null
          statement_text: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          person_id?: string | null
          person_type: string
          recording_filename?: string | null
          recording_url?: string | null
          statement_text?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          person_id?: string | null
          person_type?: string
          recording_filename?: string | null
          recording_url?: string | null
          statement_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "statements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          address: string
          created_at: string | null
          district: string
          id: string
          name: string
          officers: number
          status: string
          updated_at: string | null
          vehicles: number
        }
        Insert: {
          address: string
          created_at?: string | null
          district: string
          id?: string
          name: string
          officers: number
          status: string
          updated_at?: string | null
          vehicles: number
        }
        Update: {
          address?: string
          created_at?: string | null
          district?: string
          id?: string
          name?: string
          officers?: number
          status?: string
          updated_at?: string | null
          vehicles?: number
        }
        Relationships: []
      }
      suspects: {
        Row: {
          age: number | null
          case_id: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          last_known_location: string | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          last_known_location?: string | null
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          last_known_location?: string | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suspects_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
