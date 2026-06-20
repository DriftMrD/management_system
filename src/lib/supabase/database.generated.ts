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
      products: {
        Row: {
          id: string;
          name: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "product" | "project_manager";
          product_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: "product" | "project_manager";
          product_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "product" | "project_manager";
          product_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      requirements: {
        Row: {
          id: string;
          sr_number: string | null;
          title: string;
          description: string;
          product_id: string;
          priority: "P0" | "P1" | "P2";
          status:
            | "not_started"
            | "in_progress"
            | "scheduled"
            | "completed"
            | "cancelled";
          schedule_type: "tos" | "agile" | null;
          target_delivery_month: string | null;
          rat_status: "not_reviewed" | "passed" | "not_applicable";
          rat_notes: string;
          supplementary_notes: string;
          needs_data_analysis: boolean;
          related_files: Json;
          product_manager_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sr_number?: string | null;
          title: string;
          description?: string;
          product_id: string;
          priority?: "P0" | "P1" | "P2";
          status?:
            | "not_started"
            | "in_progress"
            | "scheduled"
            | "completed"
            | "cancelled";
          schedule_type?: "tos" | "agile" | null;
          target_delivery_month?: string | null;
          rat_status?: "not_reviewed" | "passed" | "not_applicable";
          rat_notes?: string;
          supplementary_notes?: string;
          needs_data_analysis?: boolean;
          related_files?: Json;
          product_manager_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sr_number?: string | null;
          title?: string;
          description?: string;
          product_id?: string;
          priority?: "P0" | "P1" | "P2";
          status?:
            | "not_started"
            | "in_progress"
            | "scheduled"
            | "completed"
            | "cancelled";
          schedule_type?: "tos" | "agile" | null;
          target_delivery_month?: string | null;
          rat_status?: "not_reviewed" | "passed" | "not_applicable";
          rat_notes?: string;
          supplementary_notes?: string;
          needs_data_analysis?: boolean;
          related_files?: Json;
          product_manager_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      schedule_tasks: {
        Row: {
          id: string;
          requirement_id: string;
          phase:
            | "prd"
            | "interaction"
            | "visual"
            | "development"
            | "testing"
            | "acceptance";
          schedule_type: "tos" | "agile";
          version_label: string | null;
          start_date: string | null;
          end_date: string | null;
          assignee_id: string | null;
          milestone_notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requirement_id: string;
          phase:
            | "prd"
            | "interaction"
            | "visual"
            | "development"
            | "testing"
            | "acceptance";
          schedule_type: "tos" | "agile";
          version_label?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          assignee_id?: string | null;
          milestone_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requirement_id?: string;
          phase?:
            | "prd"
            | "interaction"
            | "visual"
            | "development"
            | "testing"
            | "acceptance";
          schedule_type?: "tos" | "agile";
          version_label?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          assignee_id?: string | null;
          milestone_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_project_manager: { Args: Record<string, never>; Returns: boolean };
      current_user_product_id: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
}
