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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_name: string
          cat_id: string | null
          created_at: string
          email: string
          home_type: string | null
          id: string
          message: string | null
          other_pets: string | null
          phone: string | null
          shelter_id: string
          status: string
        }
        Insert: {
          applicant_name: string
          cat_id?: string | null
          created_at?: string
          email: string
          home_type?: string | null
          id?: string
          message?: string | null
          other_pets?: string | null
          phone?: string | null
          shelter_id: string
          status?: string
        }
        Update: {
          applicant_name?: string
          cat_id?: string | null
          created_at?: string
          email?: string
          home_type?: string | null
          id?: string
          message?: string | null
          other_pets?: string | null
          phone?: string | null
          shelter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_same_shelter"
            columns: ["cat_id", "shelter_id"]
            isOneToOne: false
            referencedRelation: "cats"
            referencedColumns: ["id", "shelter_id"]
          },
          {
            foreignKeyName: "applications_cat_id_fkey"
            columns: ["cat_id"]
            isOneToOne: false
            referencedRelation: "cats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      cats: {
        Row: {
          age_years: number | null
          bio: string | null
          breed: string | null
          caption: string | null
          color: string | null
          created_at: string
          diet: string | null
          health_notes: string | null
          id: string
          intake_date: string
          intake_location: string | null
          medications: string | null
          microchip_id: string | null
          name: string
          photo_url: string | null
          priority: boolean
          sex: string | null
          shelter_id: string
          spay_neuter: boolean
          stage: string
          tags: string[]
          temperament: string | null
          vaccinations: string | null
        }
        Insert: {
          age_years?: number | null
          bio?: string | null
          breed?: string | null
          caption?: string | null
          color?: string | null
          created_at?: string
          diet?: string | null
          health_notes?: string | null
          id?: string
          intake_date?: string
          intake_location?: string | null
          medications?: string | null
          microchip_id?: string | null
          name: string
          photo_url?: string | null
          priority?: boolean
          sex?: string | null
          shelter_id: string
          spay_neuter?: boolean
          stage?: string
          tags?: string[]
          temperament?: string | null
          vaccinations?: string | null
        }
        Update: {
          age_years?: number | null
          bio?: string | null
          breed?: string | null
          caption?: string | null
          color?: string | null
          created_at?: string
          diet?: string | null
          health_notes?: string | null
          id?: string
          intake_date?: string
          intake_location?: string | null
          medications?: string | null
          microchip_id?: string | null
          name?: string
          photo_url?: string | null
          priority?: boolean
          sex?: string | null
          shelter_id?: string
          spay_neuter?: boolean
          stage?: string
          tags?: string[]
          temperament?: string | null
          vaccinations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cats_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          capacity: number
          id: number
          staff_email: string | null
        }
        Insert: {
          capacity?: number
          id?: number
          staff_email?: string | null
        }
        Update: {
          capacity?: number
          id?: number
          staff_email?: string | null
        }
        Relationships: []
      }
      shelter_invites: {
        Row: {
          email: string
          expires_at: string
          id: string
          shelter_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          email: string
          expires_at?: string
          id?: string
          shelter_id: string
          token?: string
          used_at?: string | null
        }
        Update: {
          email?: string
          expires_at?: string
          id?: string
          shelter_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shelter_invites_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      shelter_members: {
        Row: {
          email: string
          id: string
          role: string
          shelter_id: string
          user_id: string
        }
        Insert: {
          email?: string
          id?: string
          role?: string
          shelter_id: string
          user_id: string
        }
        Update: {
          email?: string
          id?: string
          role?: string
          shelter_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shelter_members_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      shelter_settings: {
        Row: {
          capacity: number
          shelter_id: string
          staff_email: string | null
        }
        Insert: {
          capacity?: number
          shelter_id: string
          staff_email?: string | null
        }
        Update: {
          capacity?: number
          shelter_id?: string
          staff_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shelter_settings_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: true
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      shelters: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          created_at: string
          done: boolean
          id: string
          shelter_id: string
          time_slot: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          done?: boolean
          id?: string
          shelter_id: string
          time_slot?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          done?: boolean
          id?: string
          shelter_id?: string
          time_slot?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vet_logs: {
        Row: {
          cat_id: string
          created_at: string
          id: string
          note: string
          shelter_id: string
          visit_date: string
        }
        Insert: {
          cat_id: string
          created_at?: string
          id?: string
          note: string
          shelter_id: string
          visit_date?: string
        }
        Update: {
          cat_id?: string
          created_at?: string
          id?: string
          note?: string
          shelter_id?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "vet_logs_cat_id_fkey"
            columns: ["cat_id"]
            isOneToOne: false
            referencedRelation: "cats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vet_logs_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vet_same_shelter"
            columns: ["cat_id", "shelter_id"]
            isOneToOne: false
            referencedRelation: "cats"
            referencedColumns: ["id", "shelter_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_shelter_invite: { Args: { _token: string }; Returns: undefined }
      create_my_shelter: { Args: { _name: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_shelter_owner: { Args: { _shelter: string }; Returns: boolean }
      my_shelter_id: { Args: never; Returns: string }
      public_adoption_page: { Args: { _slug: string }; Returns: Json }
      remove_shelter_staff: { Args: { _member: string }; Returns: undefined }
      submit_public_application: {
        Args: {
          _cat: string
          _email: string
          _home: string
          _message: string
          _name: string
          _pets: string
          _phone: string
          _slug: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["staff"],
    },
  },
} as const
