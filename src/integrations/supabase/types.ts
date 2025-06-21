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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      agreements: {
        Row: {
          base_price: number
          contract_html: string | null
          contract_pdf_url: string | null
          created_at: string | null
          discount_percent: number
          final_price: number
          id: string
          lead_id: string | null
          plan: string
          signed_at: string | null
          signed_full_name: string
          term_months: number
          updated_at: string | null
        }
        Insert: {
          base_price: number
          contract_html?: string | null
          contract_pdf_url?: string | null
          created_at?: string | null
          discount_percent: number
          final_price: number
          id?: string
          lead_id?: string | null
          plan: string
          signed_at?: string | null
          signed_full_name: string
          term_months: number
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          contract_html?: string | null
          contract_pdf_url?: string | null
          created_at?: string | null
          discount_percent?: number
          final_price?: number
          id?: string
          lead_id?: string | null
          plan?: string
          signed_at?: string | null
          signed_full_name?: string
          term_months?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_fresh"
            referencedColumns: ["id"]
          },
        ]
      }
      anchor_address: {
        Row: {
          address_line1: string
          address_line2: string | null
          cb_qualification_data: Json | null
          city: string
          created_at: string | null
          first_lead_id: string | null
          id: string
          is_cb_valid: boolean | null
          last_qualified_at: string | null
          latitude: number | null
          longitude: number | null
          map_snapshot_url: string | null
          qualification_source: string | null
          qualified_at: string | null
          qualified_cband: boolean | null
          raw_bot_data: Json | null
          raw_verizon_data: Json | null
          site_coverage: string[] | null
          site_coverage_checked_at: string | null
          site_coverage_source: string | null
          state: string
          status: string | null
          zip_code: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          cb_qualification_data?: Json | null
          city: string
          created_at?: string | null
          first_lead_id?: string | null
          id?: string
          is_cb_valid?: boolean | null
          last_qualified_at?: string | null
          latitude?: number | null
          longitude?: number | null
          map_snapshot_url?: string | null
          qualification_source?: string | null
          qualified_at?: string | null
          qualified_cband?: boolean | null
          raw_bot_data?: Json | null
          raw_verizon_data?: Json | null
          site_coverage?: string[] | null
          site_coverage_checked_at?: string | null
          site_coverage_source?: string | null
          state: string
          status?: string | null
          zip_code: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          cb_qualification_data?: Json | null
          city?: string
          created_at?: string | null
          first_lead_id?: string | null
          id?: string
          is_cb_valid?: boolean | null
          last_qualified_at?: string | null
          latitude?: number | null
          longitude?: number | null
          map_snapshot_url?: string | null
          qualification_source?: string | null
          qualified_at?: string | null
          qualified_cband?: boolean | null
          raw_bot_data?: Json | null
          raw_verizon_data?: Json | null
          site_coverage?: string[] | null
          site_coverage_checked_at?: string | null
          site_coverage_source?: string | null
          state?: string
          status?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "anchor_address_first_lead_id_fkey"
            columns: ["first_lead_id"]
            isOneToOne: false
            referencedRelation: "leads_fresh"
            referencedColumns: ["id"]
          },
        ]
      }
      anchor_qualification: {
        Row: {
          anchor_address_id: string | null
          created_at: string | null
          id: string
          network_type: string | null
          qualified: boolean | null
          raw_data: Json | null
          raw_text: string | null
          source: string
        }
        Insert: {
          anchor_address_id?: string | null
          created_at?: string | null
          id?: string
          network_type?: string | null
          qualified?: boolean | null
          raw_data?: Json | null
          raw_text?: string | null
          source: string
        }
        Update: {
          anchor_address_id?: string | null
          created_at?: string | null
          id?: string
          network_type?: string | null
          qualified?: boolean | null
          raw_data?: Json | null
          raw_text?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "anchor_qualification_anchor_address_id_fkey"
            columns: ["anchor_address_id"]
            isOneToOne: false
            referencedRelation: "anchor_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anchor_qualification_anchor_address_id_fkey"
            columns: ["anchor_address_id"]
            isOneToOne: false
            referencedRelation: "lead_qualification_view"
            referencedColumns: ["anchor_address_id"]
          },
          {
            foreignKeyName: "fk_anchor_address"
            columns: ["anchor_address_id"]
            isOneToOne: false
            referencedRelation: "anchor_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_anchor_address"
            columns: ["anchor_address_id"]
            isOneToOne: false
            referencedRelation: "lead_qualification_view"
            referencedColumns: ["anchor_address_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changed_by_initials: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changed_by_initials?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changed_by_initials?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      batches: {
        Row: {
          batch_code_barcode: string | null
          closed_at: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          delivered_units: number | null
          id: string
          status: string | null
          total_units: number | null
        }
        Insert: {
          batch_code_barcode?: string | null
          closed_at?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_units?: number | null
          id?: string
          status?: string | null
          total_units?: number | null
        }
        Update: {
          batch_code_barcode?: string | null
          closed_at?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_units?: number | null
          id?: string
          status?: string | null
          total_units?: number | null
        }
        Relationships: []
      }
      billing_log: {
        Row: {
          amount: number | null
          created_at: string
          customer_id: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          performed_by: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_id: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_id?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_sends: {
        Row: {
          bounced: boolean | null
          campaign_id: string | null
          clicked: boolean | null
          delivered: boolean | null
          event_log: Json | null
          id: string
          lead_id: string | null
          notes: string | null
          opened: boolean | null
          replied: boolean | null
          sent_at: string | null
          spamreported: boolean | null
          unsubscribed: boolean | null
          variant_id: string | null
        }
        Insert: {
          bounced?: boolean | null
          campaign_id?: string | null
          clicked?: boolean | null
          delivered?: boolean | null
          event_log?: Json | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          opened?: boolean | null
          replied?: boolean | null
          sent_at?: string | null
          spamreported?: boolean | null
          unsubscribed?: boolean | null
          variant_id?: string | null
        }
        Update: {
          bounced?: boolean | null
          campaign_id?: string | null
          clicked?: boolean | null
          delivered?: boolean | null
          event_log?: Json | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          opened?: boolean | null
          replied?: boolean | null
          sent_at?: string | null
          spamreported?: boolean | null
          unsubscribed?: boolean | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_stats"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_sends_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_fresh"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_sends_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "template_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_sends_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variant_stats"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      campaigns: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          rotate_variants: boolean | null
          template_id: string
          type: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          rotate_variants?: boolean | null
          template_id: string
          type?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          rotate_variants?: boolean | null
          template_id?: string
          type?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      customer_credits: {
        Row: {
          amount: number
          applied_to_invoice: string | null
          created_at: string
          created_by: string | null
          credit_type: string
          customer_id: string
          description: string | null
          id: string
        }
        Insert: {
          amount: number
          applied_to_invoice?: string | null
          created_at?: string
          created_by?: string | null
          credit_type: string
          customer_id: string
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number
          applied_to_invoice?: string | null
          created_at?: string
          created_by?: string | null
          credit_type?: string
          customer_id?: string
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_subscriptions: {
        Row: {
          contract_term: number | null
          created_at: string
          customer_id: string
          device_activated_at: string | null
          id: string
          locked_rate: boolean
          monthly_price: number
          next_charge_date: string | null
          plan_name: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          contract_term?: number | null
          created_at?: string
          customer_id: string
          device_activated_at?: string | null
          id?: string
          locked_rate?: boolean
          monthly_price: number
          next_charge_date?: string | null
          plan_name: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          contract_term?: number | null
          created_at?: string
          customer_id?: string
          device_activated_at?: string | null
          id?: string
          locked_rate?: boolean
          monthly_price?: number
          next_charge_date?: string | null
          plan_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          agreement_length: number | null
          base_price: number | null
          created_at: string | null
          discount_applied: number | null
          email: string | null
          id: string
          industry: string | null
          plan_selected: string | null
          wfh: boolean | null
        }
        Insert: {
          address?: string | null
          agreement_length?: number | null
          base_price?: number | null
          created_at?: string | null
          discount_applied?: number | null
          email?: string | null
          id?: string
          industry?: string | null
          plan_selected?: string | null
          wfh?: boolean | null
        }
        Update: {
          address?: string | null
          agreement_length?: number | null
          base_price?: number | null
          created_at?: string | null
          discount_applied?: number | null
          email?: string | null
          id?: string
          industry?: string | null
          plan_selected?: string | null
          wfh?: boolean | null
        }
        Relationships: []
      }
      drip_marketing: {
        Row: {
          added_at: string | null
          address: string | null
          email: string
          id: string
          last_email_sent_at: string | null
          last_seen_at: string | null
          lead_id: string | null
          name: string | null
          notes: string | null
          qualified: boolean | null
          status: string | null
        }
        Insert: {
          added_at?: string | null
          address?: string | null
          email: string
          id?: string
          last_email_sent_at?: string | null
          last_seen_at?: string | null
          lead_id?: string | null
          name?: string | null
          notes?: string | null
          qualified?: boolean | null
          status?: string | null
        }
        Update: {
          added_at?: string | null
          address?: string | null
          email?: string
          id?: string
          last_email_sent_at?: string | null
          last_seen_at?: string | null
          lead_id?: string | null
          name?: string | null
          notes?: string | null
          qualified?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drip_marketing_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          clicked_at: string | null
          email_type: string | null
          id: string
          lead_id: string | null
          opened_at: string | null
          sent_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          email_type?: string | null
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          email_type?: string | null
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "plan_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_tracking: {
        Row: {
          clicked_at: string | null
          drip_marketing_id: string | null
          email_type: string
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          clicked_at?: string | null
          drip_marketing_id?: string | null
          email_type: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          clicked_at?: string | null
          drip_marketing_id?: string | null
          email_type?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_drip_marketing_id_fkey"
            columns: ["drip_marketing_id"]
            isOneToOne: false
            referencedRelation: "drip_marketing"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          code: string
          created_at: string | null
          email: string
          id: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          id?: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          location: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          technician_id: string | null
          technician_name: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          location: string
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          technician_id?: string | null
          technician_name?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          location?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          technician_id?: string | null
          technician_name?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "service_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          note: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          note: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "plan_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_qualifications: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          network_type: string | null
          qualified: boolean | null
          raw_data: Json | null
          received_at: string | null
          request_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          lead_id?: string | null
          network_type?: string | null
          qualified?: boolean | null
          raw_data?: Json | null
          received_at?: string | null
          request_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          network_type?: string | null
          qualified?: boolean | null
          raw_data?: Json | null
          received_at?: string | null
          request_id?: string | null
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          description: string | null
          source_key: string
          source_name: string
        }
        Insert: {
          description?: string | null
          source_key: string
          source_name: string
        }
        Update: {
          description?: string | null
          source_key?: string
          source_name?: string
        }
        Relationships: []
      }
      lead_tags: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          tag: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          tag?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "plan_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_usage_map: {
        Row: {
          lead_id: string
          usage_key: string
        }
        Insert: {
          lead_id: string
          usage_key: string
        }
        Update: {
          lead_id?: string
          usage_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_usage_map_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "plan_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_usage_map_usage_key_fkey"
            columns: ["usage_key"]
            isOneToOne: false
            referencedRelation: "usage_type_options"
            referencedColumns: ["key"]
          },
        ]
      }
      leads: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          qualification_checked_at: string | null
          qualified: boolean | null
          state: string
          updated_at: string | null
          usage_types: string[] | null
          zip_code: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          qualification_checked_at?: string | null
          qualified?: boolean | null
          state: string
          updated_at?: string | null
          usage_types?: string[] | null
          zip_code: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          qualification_checked_at?: string | null
          qualified?: boolean | null
          state?: string
          updated_at?: string | null
          usage_types?: string[] | null
          zip_code?: string
        }
        Relationships: []
      }
      leads_fresh: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          email: string | null
          fallback_used: boolean | null
          first_name: string | null
          household_size: number | null
          id: string
          is_test: boolean | null
          last_emailed_at: string | null
          last_name: string | null
          lead_type: string | null
          phone: string | null
          qualification_checked_at: string | null
          qualification_result: string | null
          qualified: boolean | null
          reason: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          usage_type: string | null
          usage_types: string[] | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          fallback_used?: boolean | null
          first_name?: string | null
          household_size?: number | null
          id?: string
          is_test?: boolean | null
          last_emailed_at?: string | null
          last_name?: string | null
          lead_type?: string | null
          phone?: string | null
          qualification_checked_at?: string | null
          qualification_result?: string | null
          qualified?: boolean | null
          reason?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          usage_type?: string | null
          usage_types?: string[] | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          fallback_used?: boolean | null
          first_name?: string | null
          household_size?: number | null
          id?: string
          is_test?: boolean | null
          last_emailed_at?: string | null
          last_name?: string | null
          lead_type?: string | null
          phone?: string | null
          qualification_checked_at?: string | null
          qualification_result?: string | null
          qualified?: boolean | null
          reason?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          usage_type?: string | null
          usage_types?: string[] | null
          zip_code?: string | null
        }
        Relationships: []
      }
      leads_qualifications: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          network_type: string | null
          qualified: boolean | null
          raw_data: Json | null
          request_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          network_type?: string | null
          qualified?: boolean | null
          raw_data?: Json | null
          request_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          network_type?: string | null
          qualified?: boolean | null
          raw_data?: Json | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lead_id"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_fresh"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_leads: {
        Row: {
          cleaned_at: string | null
          file_hash: string | null
          full_row: Json
          id: string
          lat: number | null
          lng: number | null
          record_hash: string | null
          source_file: string | null
          status: string | null
        }
        Insert: {
          cleaned_at?: string | null
          file_hash?: string | null
          full_row: Json
          id?: string
          lat?: number | null
          lng?: number | null
          record_hash?: string | null
          source_file?: string | null
          status?: string | null
        }
        Update: {
          cleaned_at?: string | null
          file_hash?: string | null
          full_row?: Json
          id?: string
          lat?: number | null
          lng?: number | null
          record_hash?: string | null
          source_file?: string | null
          status?: string | null
        }
        Relationships: []
      }
      onboarding_events: {
        Row: {
          customer_id: string | null
          event_type: string | null
          id: string
          timestamp: string | null
          value: string | null
        }
        Insert: {
          customer_id?: string | null
          event_type?: string | null
          id?: string
          timestamp?: string | null
          value?: string | null
        }
        Update: {
          customer_id?: string | null
          event_type?: string | null
          id?: string
          timestamp?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_sessions: {
        Row: {
          agreements: Json | null
          auto_generated: boolean | null
          code_expires_at: string | null
          created_at: string | null
          current_step: number | null
          device_count: string | null
          discount_total: number | null
          email_address: string | null
          email_verified: boolean | null
          id: string
          lead_id: string | null
          monthly_price: number | null
          plan_recommended: string | null
          referrer_id: string | null
          referrer_name: string | null
          secure_mode: string | null
          social_platform: string | null
          social_post_url: string | null
          ssid: string | null
          term_length: number | null
          updated_at: string | null
          usage_types: string[] | null
          verification_code: string | null
          wifi_password: string | null
          works_from_home: boolean | null
        }
        Insert: {
          agreements?: Json | null
          auto_generated?: boolean | null
          code_expires_at?: string | null
          created_at?: string | null
          current_step?: number | null
          device_count?: string | null
          discount_total?: number | null
          email_address?: string | null
          email_verified?: boolean | null
          id?: string
          lead_id?: string | null
          monthly_price?: number | null
          plan_recommended?: string | null
          referrer_id?: string | null
          referrer_name?: string | null
          secure_mode?: string | null
          social_platform?: string | null
          social_post_url?: string | null
          ssid?: string | null
          term_length?: number | null
          updated_at?: string | null
          usage_types?: string[] | null
          verification_code?: string | null
          wifi_password?: string | null
          works_from_home?: boolean | null
        }
        Update: {
          agreements?: Json | null
          auto_generated?: boolean | null
          code_expires_at?: string | null
          created_at?: string | null
          current_step?: number | null
          device_count?: string | null
          discount_total?: number | null
          email_address?: string | null
          email_verified?: boolean | null
          id?: string
          lead_id?: string | null
          monthly_price?: number | null
          plan_recommended?: string | null
          referrer_id?: string | null
          referrer_name?: string | null
          secure_mode?: string | null
          social_platform?: string | null
          social_post_url?: string | null
          ssid?: string | null
          term_length?: number | null
          updated_at?: string | null
          usage_types?: string[] | null
          verification_code?: string | null
          wifi_password?: string | null
          works_from_home?: boolean | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          fulfillment_status: string
          id: string
          payment_status: string
          plan_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          fulfillment_status?: string
          id?: string
          payment_status?: string
          plan_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          fulfillment_status?: string
          id?: string
          payment_status?: string
          plan_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "service_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_leads: {
        Row: {
          address: string
          city: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          lead_source: string | null
          recommended_plan: string | null
          status: string | null
          usage_score: number | null
          usage_type: string | null
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          lead_source?: string | null
          recommended_plan?: string | null
          status?: string | null
          usage_score?: number | null
          usage_type?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          lead_source?: string | null
          recommended_plan?: string | null
          status?: string | null
          usage_score?: number | null
          usage_type?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          retail_price: number | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          retail_price?: number | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          retail_price?: number | null
        }
        Relationships: []
      }
      processed_files: {
        Row: {
          file_hash: string
          file_name: string
          id: string
          processed_at: string | null
          processed_by: string | null
          record_count: number
        }
        Insert: {
          file_hash: string
          file_name: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          record_count?: number
        }
        Update: {
          file_hash?: string
          file_name?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          record_count?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          taxable: boolean
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          taxable?: boolean
          type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          taxable?: boolean
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_percent: number
          is_active: boolean | null
          offer_type: string | null
          plan_override: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_percent?: number
          is_active?: boolean | null
          offer_type?: string | null
          plan_override?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_percent?: number
          is_active?: boolean | null
          offer_type?: string | null
          plan_override?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_until?: string | null
        }
        Relationships: []
      }
      provisioning_events: {
        Row: {
          action: string
          id: string
          notes: string | null
          performed_by: string | null
          router_id: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          router_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          router_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_events_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      provisioning_sessions: {
        Row: {
          assemble_option: string | null
          assembled: boolean | null
          assembled_at: string | null
          assembled_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          current_step: string | null
          customer_id: string | null
          id: string
          last_updated_at: string | null
          last_updated_by: string | null
          passkey: string | null
          plan_added: boolean | null
          router_id: string | null
          ssid: string | null
          ssid_confirmed: boolean | null
          ssid_confirmed_at: string | null
          ssid_printed: boolean | null
          status: string | null
          verizon_added_at: string | null
          verizon_added_by: string | null
          verizon_plan_name: string | null
        }
        Insert: {
          assemble_option?: string | null
          assembled?: boolean | null
          assembled_at?: string | null
          assembled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: string | null
          customer_id?: string | null
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          passkey?: string | null
          plan_added?: boolean | null
          router_id?: string | null
          ssid?: string | null
          ssid_confirmed?: boolean | null
          ssid_confirmed_at?: string | null
          ssid_printed?: boolean | null
          status?: string | null
          verizon_added_at?: string | null
          verizon_added_by?: string | null
          verizon_plan_name?: string | null
        }
        Update: {
          assemble_option?: string | null
          assembled?: boolean | null
          assembled_at?: string | null
          assembled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: string | null
          customer_id?: string | null
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          passkey?: string | null
          plan_added?: boolean | null
          router_id?: string | null
          ssid?: string | null
          ssid_confirmed?: boolean | null
          ssid_confirmed_at?: string | null
          ssid_printed?: boolean | null
          status?: string | null
          verizon_added_at?: string | null
          verizon_added_by?: string | null
          verizon_plan_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provisioning_sessions_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_applied: boolean | null
          created_at: string | null
          id: string
          referred_lead_id: string
          referrer_id: string
        }
        Insert: {
          bonus_applied?: boolean | null
          created_at?: string | null
          id?: string
          referred_lead_id: string
          referrer_id: string
        }
        Update: {
          bonus_applied?: boolean | null
          created_at?: string | null
          id?: string
          referred_lead_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      request_lookup: {
        Row: {
          anchor_address_id: string | null
          created_at: string | null
          extended_search_started: boolean | null
          form_data: Json | null
          request_id: string
          source: string | null
          verizon_request_id: string | null
        }
        Insert: {
          anchor_address_id?: string | null
          created_at?: string | null
          extended_search_started?: boolean | null
          form_data?: Json | null
          request_id: string
          source?: string | null
          verizon_request_id?: string | null
        }
        Update: {
          anchor_address_id?: string | null
          created_at?: string | null
          extended_search_started?: boolean | null
          form_data?: Json | null
          request_id?: string
          source?: string | null
          verizon_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_lookup_anchor_address_id_fkey"
            columns: ["anchor_address_id"]
            isOneToOne: false
            referencedRelation: "anchor_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_lookup_anchor_address_id_fkey"
            columns: ["anchor_address_id"]
            isOneToOne: false
            referencedRelation: "lead_qualification_view"
            referencedColumns: ["anchor_address_id"]
          },
        ]
      }
      router_shipments: {
        Row: {
          batch_id: string | null
          carrier: string | null
          confirmed_by: string | null
          cost: number | null
          delivered: boolean | null
          delivered_at: string | null
          id: string
          router_id: string | null
          shipped_at: string | null
          shipping_label_printed: boolean | null
          tracking_barcode: string | null
          tracking_number: string | null
        }
        Insert: {
          batch_id?: string | null
          carrier?: string | null
          confirmed_by?: string | null
          cost?: number | null
          delivered?: boolean | null
          delivered_at?: string | null
          id?: string
          router_id?: string | null
          shipped_at?: string | null
          shipping_label_printed?: boolean | null
          tracking_barcode?: string | null
          tracking_number?: string | null
        }
        Update: {
          batch_id?: string | null
          carrier?: string | null
          confirmed_by?: string | null
          cost?: number | null
          delivered?: boolean | null
          delivered_at?: string | null
          id?: string
          router_id?: string | null
          shipped_at?: string | null
          shipping_label_printed?: boolean | null
          tracking_barcode?: string | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "router_shipments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "router_shipments_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      routers: {
        Row: {
          asset_tag: string | null
          assigned_client_id: string | null
          barcode: string | null
          billing_cycles: number | null
          country_of_origin: string | null
          created_at: string | null
          created_by: string | null
          iccid: string
          id: string
          imei: string
          model: string
          network_password: string
          notes: string | null
          ownership_flag: boolean | null
          serial_number: string
          service_status: string | null
          shipping_label_printed: boolean | null
          sim_sku: string | null
          status: string | null
          status_qr_last_printed_at: string | null
          status_qr_note: string | null
          status_qr_printed_by: string | null
          sw_version: string | null
          upc: string | null
        }
        Insert: {
          asset_tag?: string | null
          assigned_client_id?: string | null
          barcode?: string | null
          billing_cycles?: number | null
          country_of_origin?: string | null
          created_at?: string | null
          created_by?: string | null
          iccid: string
          id?: string
          imei: string
          model: string
          network_password?: string
          notes?: string | null
          ownership_flag?: boolean | null
          serial_number: string
          service_status?: string | null
          shipping_label_printed?: boolean | null
          sim_sku?: string | null
          status?: string | null
          status_qr_last_printed_at?: string | null
          status_qr_note?: string | null
          status_qr_printed_by?: string | null
          sw_version?: string | null
          upc?: string | null
        }
        Update: {
          asset_tag?: string | null
          assigned_client_id?: string | null
          barcode?: string | null
          billing_cycles?: number | null
          country_of_origin?: string | null
          created_at?: string | null
          created_by?: string | null
          iccid?: string
          id?: string
          imei?: string
          model?: string
          network_password?: string
          notes?: string | null
          ownership_flag?: boolean | null
          serial_number?: string
          service_status?: string | null
          shipping_label_printed?: boolean | null
          sim_sku?: string | null
          status?: string | null
          status_qr_last_printed_at?: string | null
          status_qr_note?: string | null
          status_qr_printed_by?: string | null
          sw_version?: string | null
          upc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routers_assigned_client_id_fkey"
            columns: ["assigned_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          city: string
          created_at: string
          id: string
          is_serviceable: boolean
          max_speed_mbps: number | null
          notes: string | null
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_serviceable?: boolean
          max_speed_mbps?: number | null
          notes?: string | null
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_serviceable?: boolean
          max_speed_mbps?: number | null
          notes?: string | null
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      service_inquiries: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_qualified: boolean | null
          message: string | null
          phone: string
          plan_id: string | null
          state: string
          status: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_qualified?: boolean | null
          message?: string | null
          phone: string
          plan_id?: string | null
          state: string
          status?: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_qualified?: boolean | null
          message?: string | null
          phone?: string
          plan_id?: string | null
          state?: string
          status?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_inquiries_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          created_at: string
          description: string
          download_speed: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          updated_at: string
          upload_speed: number
        }
        Insert: {
          created_at?: string
          description: string
          download_speed: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price_monthly: number
          updated_at?: string
          upload_speed: number
        }
        Update: {
          created_at?: string
          description?: string
          download_speed?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          updated_at?: string
          upload_speed?: number
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      shipping_scan_logs: {
        Row: {
          batch_id: string | null
          carrier: string | null
          id: string
          lat: number | null
          lng: number | null
          location_city: string | null
          location_state: string | null
          router_id: string | null
          scan_time: string | null
          status: string | null
          tracking_number: string | null
        }
        Insert: {
          batch_id?: string | null
          carrier?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_city?: string | null
          location_state?: string | null
          router_id?: string | null
          scan_time?: string | null
          status?: string | null
          tracking_number?: string | null
        }
        Update: {
          batch_id?: string | null
          carrier?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_city?: string | null
          location_state?: string | null
          router_id?: string | null
          scan_time?: string | null
          status?: string | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_scan_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_scan_logs_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      social_mentions: {
        Row: {
          credit_applied: boolean | null
          customer_id: string | null
          id: string
          platform: string | null
          post_url: string | null
          submitted_at: string | null
          verified: boolean | null
        }
        Insert: {
          credit_applied?: boolean | null
          customer_id?: string | null
          id?: string
          platform?: string | null
          post_url?: string | null
          submitted_at?: string | null
          verified?: boolean | null
        }
        Update: {
          credit_applied?: boolean | null
          customer_id?: string | null
          id?: string
          platform?: string | null
          post_url?: string | null
          submitted_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "social_mentions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          created_at: string | null
          credit_amount: number | null
          customer_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          platform: string
          post_timestamp: string | null
          post_url: string
          status: string | null
          verified_timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          credit_amount?: number | null
          customer_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          platform: string
          post_timestamp?: string | null
          post_url: string
          status?: string | null
          verified_timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          credit_amount?: number | null
          customer_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          platform?: string
          post_timestamp?: string | null
          post_url?: string
          status?: string | null
          verified_timestamp?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          must_reset_password: boolean | null
          password_hash: string | null
          role: string
          temp_password: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          must_reset_password?: boolean | null
          password_hash?: string | null
          role: string
          temp_password?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          must_reset_password?: boolean | null
          password_hash?: string | null
          role?: string
          temp_password?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      template_variants: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          label: string
          last_used_at: string | null
          template_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          label: string
          last_used_at?: string | null
          template_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          label?: string
          last_used_at?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_stats"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "template_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_type_options: {
        Row: {
          key: string
          label: string | null
        }
        Insert: {
          key: string
          label?: string | null
        }
        Update: {
          key?: string
          label?: string | null
        }
        Relationships: []
      }
      user_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
          target_email: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          target_email: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          target_email?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          first_name: string
          id: string
          last_name: string
          role: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          first_name: string
          id?: string
          last_name: string
          role?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          first_name: string
          id: string
          initials: string
          is_active: boolean
          last_name: string
          role: string
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          first_name: string
          id?: string
          initials: string
          is_active?: boolean
          last_name: string
          role?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          first_name?: string
          id?: string
          initials?: string
          is_active?: boolean
          last_name?: string
          role?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          must_reset_password: boolean | null
          role: string
          temp_password: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          must_reset_password?: boolean | null
          role: string
          temp_password?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          must_reset_password?: boolean | null
          role?: string
          temp_password?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verizon_addresses: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          request_id: string | null
          response: Json | null
          status: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          request_id?: string | null
          response?: Json | null
          status?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          request_id?: string | null
          response?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          email: string
          id: string
          source: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      zip_codes: {
        Row: {
          city: string
          created_at: string | null
          state: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string | null
          state: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string | null
          state?: string
          zip_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_stats: {
        Row: {
          active: boolean | null
          campaign_id: string | null
          campaign_name: string | null
          click_rate: number | null
          open_rate: number | null
          total_sends: number | null
          type: string | null
          variant_count: number | null
        }
        Relationships: []
      }
      customer_orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          fulfillment_status: string | null
          id: string | null
          payment_status: string | null
          plan_id: string | null
          plan_name: string | null
          status: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "service_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_qualification_view: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          anchor_address_id: string | null
          city: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          qualified: boolean | null
          qualified_at: string | null
          request_id: string | null
          source: string | null
          state: string | null
          submitted_at: string | null
          usage_types: string | null
          zip_code: string | null
        }
        Relationships: []
      }
      variant_stats: {
        Row: {
          campaign_id: string | null
          click_rate: number | null
          label: string | null
          last_used_at: string | null
          open_rate: number | null
          template_id: string | null
          total_sent: number | null
          variant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_stats"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "template_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      backfill_city_state_from_zip: {
        Args: { zip: string }
        Returns: {
          city: string
          state: string
        }[]
      }
      calculate_social_credit_amount: {
        Args: { p_platform: string; p_customer_id?: string; p_lead_id?: string }
        Returns: number
      }
      create_user_invitation: {
        Args: {
          invitation_email: string
          invitation_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      get_records_with_missing_city_state: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          zip: string
          city: string
          state: string
        }[]
      }
      get_source_file_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          source_file: string
          count: number
        }[]
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role_from_jwt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_file_already_processed: {
        Args: { file_hash: string }
        Returns: boolean
      }
      update_drip_last_seen: {
        Args: { user_email: string }
        Returns: undefined
      }
      update_leads_with_backfilled_city_state: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      user_role: "admin" | "office" | "customer"
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
      user_role: ["admin", "office", "customer"],
    },
  },
} as const
