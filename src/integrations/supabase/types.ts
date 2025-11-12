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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      billing: {
        Row: {
          billingid: string
          created_at: string | null
          finalamount: number
          generationdate: string | null
          stayid: string
          tax: number
        }
        Insert: {
          billingid?: string
          created_at?: string | null
          finalamount: number
          generationdate?: string | null
          stayid: string
          tax: number
        }
        Update: {
          billingid?: string
          created_at?: string | null
          finalamount?: number
          generationdate?: string | null
          stayid?: string
          tax?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_stayid_fkey"
            columns: ["stayid"]
            isOneToOne: false
            referencedRelation: "staylog"
            referencedColumns: ["stayid"]
          },
        ]
      }
      digilockerid: {
        Row: {
          created_at: string | null
          documentlink: string | null
          documenttype: string
          expirydate: string | null
          guestid: string
          identityid: string
          issuedate: string | null
          verifiedstatus: boolean | null
          verifiedusing: string | null
        }
        Insert: {
          created_at?: string | null
          documentlink?: string | null
          documenttype: string
          expirydate?: string | null
          guestid: string
          identityid?: string
          issuedate?: string | null
          verifiedstatus?: boolean | null
          verifiedusing?: string | null
        }
        Update: {
          created_at?: string | null
          documentlink?: string | null
          documenttype?: string
          expirydate?: string | null
          guestid?: string
          identityid?: string
          issuedate?: string | null
          verifiedstatus?: boolean | null
          verifiedusing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digilockerid_guestid_fkey"
            columns: ["guestid"]
            isOneToOne: false
            referencedRelation: "guest"
            referencedColumns: ["guestid"]
          },
        ]
      }
      feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          date: string | null
          feedbackid: string
          guestid: string
          rating: number | null
          stayid: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          date?: string | null
          feedbackid?: string
          guestid: string
          rating?: number | null
          stayid: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          date?: string | null
          feedbackid?: string
          guestid?: string
          rating?: number | null
          stayid?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_guestid_fkey"
            columns: ["guestid"]
            isOneToOne: false
            referencedRelation: "guest"
            referencedColumns: ["guestid"]
          },
          {
            foreignKeyName: "feedback_stayid_fkey"
            columns: ["stayid"]
            isOneToOne: false
            referencedRelation: "staylog"
            referencedColumns: ["stayid"]
          },
        ]
      }
      guest: {
        Row: {
          address: string
          age: number | null
          created_at: string | null
          dob: string
          emailid: string
          emergency_contacts: Json | null
          fname: string
          guestid: string
          lname: string
          main_phone: string
          mname: string | null
          nationality: string
          selfie_url: string | null
        }
        Insert: {
          address: string
          age?: number | null
          created_at?: string | null
          dob: string
          emailid: string
          emergency_contacts?: Json | null
          fname: string
          guestid?: string
          lname: string
          main_phone: string
          mname?: string | null
          nationality: string
          selfie_url?: string | null
        }
        Update: {
          address?: string
          age?: number | null
          created_at?: string | null
          dob?: string
          emailid?: string
          emergency_contacts?: Json | null
          fname?: string
          guestid?: string
          lname?: string
          main_phone?: string
          mname?: string | null
          nationality?: string
          selfie_url?: string | null
        }
        Relationships: []
      }
      hotel: {
        Row: {
          contact_number: string
          created_at: string | null
          email: string
          hotelid: string
          location: string
          name: string
          rating: number | null
          total_rooms: number
        }
        Insert: {
          contact_number: string
          created_at?: string | null
          email: string
          hotelid?: string
          location: string
          name: string
          rating?: number | null
          total_rooms: number
        }
        Update: {
          contact_number?: string
          created_at?: string | null
          email?: string
          hotelid?: string
          location?: string
          name?: string
          rating?: number | null
          total_rooms?: number
        }
        Relationships: []
      }
      payment: {
        Row: {
          amount: number
          bank: string | null
          billingid: string
          cardtype: string | null
          created_at: string | null
          method: string
          paymentdate: string | null
          paymentid: string
          status: string | null
          transactionref: string | null
          txnid: string | null
          upi_id: string | null
        }
        Insert: {
          amount: number
          bank?: string | null
          billingid: string
          cardtype?: string | null
          created_at?: string | null
          method: string
          paymentdate?: string | null
          paymentid?: string
          status?: string | null
          transactionref?: string | null
          txnid?: string | null
          upi_id?: string | null
        }
        Update: {
          amount?: number
          bank?: string | null
          billingid?: string
          cardtype?: string | null
          created_at?: string | null
          method?: string
          paymentdate?: string | null
          paymentid?: string
          status?: string | null
          transactionref?: string | null
          txnid?: string | null
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_billingid_fkey"
            columns: ["billingid"]
            isOneToOne: false
            referencedRelation: "billing"
            referencedColumns: ["billingid"]
          },
        ]
      }
      room: {
        Row: {
          availability_status: string | null
          created_at: string | null
          hotelid: string
          occupancy_limit: number
          pricepernight: number
          roomid: string
          roomnumber: string
          roomtype: string
        }
        Insert: {
          availability_status?: string | null
          created_at?: string | null
          hotelid: string
          occupancy_limit: number
          pricepernight: number
          roomid?: string
          roomnumber: string
          roomtype: string
        }
        Update: {
          availability_status?: string | null
          created_at?: string | null
          hotelid?: string
          occupancy_limit?: number
          pricepernight?: number
          roomid?: string
          roomnumber?: string
          roomtype?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_hotelid_fkey"
            columns: ["hotelid"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["hotelid"]
          },
        ]
      }
      staylog: {
        Row: {
          checkintime: string | null
          checkouttime: string | null
          created_at: string | null
          credentialissuedat: string | null
          credentialnonce: string | null
          guestid: string
          hotelid: string
          roomcount: number | null
          roomid: string
          status: string | null
          stayid: string
          totalamount: number | null
        }
        Insert: {
          checkintime?: string | null
          checkouttime?: string | null
          created_at?: string | null
          credentialissuedat?: string | null
          credentialnonce?: string | null
          guestid: string
          hotelid: string
          roomcount?: number | null
          roomid: string
          status?: string | null
          stayid?: string
          totalamount?: number | null
        }
        Update: {
          checkintime?: string | null
          checkouttime?: string | null
          created_at?: string | null
          credentialissuedat?: string | null
          credentialnonce?: string | null
          guestid?: string
          hotelid?: string
          roomcount?: number | null
          roomid?: string
          status?: string | null
          stayid?: string
          totalamount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staylog_guestid_fkey"
            columns: ["guestid"]
            isOneToOne: false
            referencedRelation: "guest"
            referencedColumns: ["guestid"]
          },
          {
            foreignKeyName: "staylog_hotelid_fkey"
            columns: ["hotelid"]
            isOneToOne: false
            referencedRelation: "hotel"
            referencedColumns: ["hotelid"]
          },
          {
            foreignKeyName: "staylog_roomid_fkey"
            columns: ["roomid"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["roomid"]
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
    Enums: {},
  },
} as const
