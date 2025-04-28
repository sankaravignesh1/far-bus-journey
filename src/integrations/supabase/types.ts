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
      boarding_points: {
        Row: {
          b_address: string | null
          b_contact: string | null
          b_landmark: string | null
          b_location: unknown | null
          b_point_name: string
          b_time: string
          bp_id: string
          bus_id: string
          created_at: string | null
          id: string
          op_bp_id: string
          op_bus_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          route_id: string
          updated_at: string | null
        }
        Insert: {
          b_address?: string | null
          b_contact?: string | null
          b_landmark?: string | null
          b_location?: unknown | null
          b_point_name: string
          b_time: string
          bp_id: string
          bus_id: string
          created_at?: string | null
          id?: string
          op_bp_id: string
          op_bus_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          route_id: string
          updated_at?: string | null
        }
        Update: {
          b_address?: string | null
          b_contact?: string | null
          b_landmark?: string | null
          b_location?: unknown | null
          b_point_name?: string
          b_time?: string
          bp_id?: string
          bus_id?: string
          created_at?: string | null
          id?: string
          op_bp_id?: string
          op_bus_id?: string
          op_route_id?: string
          operator_id?: string
          operator_name?: string
          route_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boarding_points_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "bus_list"
            referencedColumns: ["bus_id"]
          },
          {
            foreignKeyName: "boarding_points_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "boarding_points_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["route_id"]
          },
        ]
      }
      booking_seats: {
        Row: {
          age: number
          boarding_point: string
          booking_id: string
          bus_id: string
          bus_type: string | null
          created_at: string | null
          date_of_journey: string
          dropping_point: string
          gender: string
          id: string
          mobile: string
          op_bus_id: string
          op_route_id: string
          op_seat_id: string
          operator_id: string
          operator_name: string
          passenger_name: string
          route_id: string
          seat_id: string
          seat_name: string
          seat_type: string | null
          status: string
          total_fare: number
          updated_at: string | null
        }
        Insert: {
          age: number
          boarding_point: string
          booking_id: string
          bus_id: string
          bus_type?: string | null
          created_at?: string | null
          date_of_journey: string
          dropping_point: string
          gender: string
          id?: string
          mobile: string
          op_bus_id: string
          op_route_id: string
          op_seat_id: string
          operator_id: string
          operator_name: string
          passenger_name: string
          route_id: string
          seat_id: string
          seat_name: string
          seat_type?: string | null
          status?: string
          total_fare: number
          updated_at?: string | null
        }
        Update: {
          age?: number
          boarding_point?: string
          booking_id?: string
          bus_id?: string
          bus_type?: string | null
          created_at?: string | null
          date_of_journey?: string
          dropping_point?: string
          gender?: string
          id?: string
          mobile?: string
          op_bus_id?: string
          op_route_id?: string
          op_seat_id?: string
          operator_id?: string
          operator_name?: string
          passenger_name?: string
          route_id?: string
          seat_id?: string
          seat_name?: string
          seat_type?: string | null
          status?: string
          total_fare?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_seats_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "bus_list"
            referencedColumns: ["bus_id"]
          },
          {
            foreignKeyName: "booking_seats_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "booking_seats_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "booking_seats_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "bus_layout"
            referencedColumns: ["seat_id"]
          },
        ]
      }
      bookings: {
        Row: {
          boarding_point: string
          booking_ids: string
          bus_id: string
          created_at: string | null
          date_of_journey: string
          dropping_point: string
          email: string
          from_city: string
          gst: number
          id: string
          mobile: string
          op_bus_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          passenger_names: string
          pnr: string
          route_id: string
          seat_names: string
          status: string
          to_city: string
          total_base_fare: number
          total_fare: number
        }
        Insert: {
          boarding_point: string
          booking_ids: string
          bus_id: string
          created_at?: string | null
          date_of_journey: string
          dropping_point: string
          email: string
          from_city: string
          gst: number
          id?: string
          mobile: string
          op_bus_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          passenger_names: string
          pnr: string
          route_id: string
          seat_names: string
          status?: string
          to_city: string
          total_base_fare: number
          total_fare: number
        }
        Update: {
          boarding_point?: string
          booking_ids?: string
          bus_id?: string
          created_at?: string | null
          date_of_journey?: string
          dropping_point?: string
          email?: string
          from_city?: string
          gst?: number
          id?: string
          mobile?: string
          op_bus_id?: string
          op_route_id?: string
          operator_id?: string
          operator_name?: string
          passenger_names?: string
          pnr?: string
          route_id?: string
          seat_names?: string
          status?: string
          to_city?: string
          total_base_fare?: number
          total_fare?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "bus_list"
            referencedColumns: ["bus_id"]
          },
          {
            foreignKeyName: "bookings_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["route_id"]
          },
        ]
      }
      bus_layout: {
        Row: {
          available: boolean | null
          bus_id: string
          created_at: string | null
          date_of_journey: string
          deck: string | null
          discounted_price: number | null
          height: number
          id: string
          is_double_berth: boolean | null
          is_ladies_seat: boolean | null
          last_fetched_at: string | null
          max_lower_column: number | null
          max_lower_row: number | null
          max_upper_column: number | null
          max_upper_row: number | null
          op_bus_id: string
          op_route_id: string
          op_seat_id: string
          operator_id: string
          operator_name: string
          original_price: number
          route_id: string
          seat_id: string
          seat_name: string
          seat_res_type: string | null
          seat_type: string | null
          updated_at: string | null
          width: number
          x_pos: number
          y_pos: number
          z_pos: number
        }
        Insert: {
          available?: boolean | null
          bus_id: string
          created_at?: string | null
          date_of_journey: string
          deck?: string | null
          discounted_price?: number | null
          height?: number
          id?: string
          is_double_berth?: boolean | null
          is_ladies_seat?: boolean | null
          last_fetched_at?: string | null
          max_lower_column?: number | null
          max_lower_row?: number | null
          max_upper_column?: number | null
          max_upper_row?: number | null
          op_bus_id: string
          op_route_id: string
          op_seat_id: string
          operator_id: string
          operator_name: string
          original_price: number
          route_id: string
          seat_id: string
          seat_name: string
          seat_res_type?: string | null
          seat_type?: string | null
          updated_at?: string | null
          width?: number
          x_pos: number
          y_pos: number
          z_pos: number
        }
        Update: {
          available?: boolean | null
          bus_id?: string
          created_at?: string | null
          date_of_journey?: string
          deck?: string | null
          discounted_price?: number | null
          height?: number
          id?: string
          is_double_berth?: boolean | null
          is_ladies_seat?: boolean | null
          last_fetched_at?: string | null
          max_lower_column?: number | null
          max_lower_row?: number | null
          max_upper_column?: number | null
          max_upper_row?: number | null
          op_bus_id?: string
          op_route_id?: string
          op_seat_id?: string
          operator_id?: string
          operator_name?: string
          original_price?: number
          route_id?: string
          seat_id?: string
          seat_name?: string
          seat_res_type?: string | null
          seat_type?: string | null
          updated_at?: string | null
          width?: number
          x_pos?: number
          y_pos?: number
          z_pos?: number
        }
        Relationships: [
          {
            foreignKeyName: "bus_layout_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "bus_list"
            referencedColumns: ["bus_id"]
          },
          {
            foreignKeyName: "bus_layout_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "bus_layout_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["route_id"]
          },
        ]
      }
      bus_list: {
        Row: {
          amenities: Json | null
          arrival_time: string
          available_seats: number | null
          bus_category: string | null
          bus_id: string
          bus_type: string | null
          created_at: string | null
          departure_time: string
          duration: string | null
          from_city: string
          id: string
          journey_date: string
          last_fetched_at: string | null
          max_lower_column: number | null
          max_lower_row: number | null
          max_upper_column: number | null
          max_upper_row: number | null
          op_bus_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          route_id: string
          singleseats_available: number | null
          starting_fare: number
          to_city: string
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          arrival_time: string
          available_seats?: number | null
          bus_category?: string | null
          bus_id: string
          bus_type?: string | null
          created_at?: string | null
          departure_time: string
          duration?: string | null
          from_city: string
          id?: string
          journey_date: string
          last_fetched_at?: string | null
          max_lower_column?: number | null
          max_lower_row?: number | null
          max_upper_column?: number | null
          max_upper_row?: number | null
          op_bus_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          route_id: string
          singleseats_available?: number | null
          starting_fare: number
          to_city: string
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          arrival_time?: string
          available_seats?: number | null
          bus_category?: string | null
          bus_id?: string
          bus_type?: string | null
          created_at?: string | null
          departure_time?: string
          duration?: string | null
          from_city?: string
          id?: string
          journey_date?: string
          last_fetched_at?: string | null
          max_lower_column?: number | null
          max_lower_row?: number | null
          max_upper_column?: number | null
          max_upper_row?: number | null
          op_bus_id?: string
          op_route_id?: string
          operator_id?: string
          operator_name?: string
          route_id?: string
          singleseats_available?: number | null
          starting_fare?: number
          to_city?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_list_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "bus_list_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["route_id"]
          },
        ]
      }
      cancellation_policy: {
        Row: {
          before_12hrs: number | null
          before_24hrs: number | null
          before_48hrs: number | null
          before_6hrs: number | null
          before_two_weeks: number | null
          before_week: number | null
          created_at: string | null
          id: string
          lessthan_6hrs: number | null
          operator_id: string
          operator_name: string
          updated_at: string | null
        }
        Insert: {
          before_12hrs?: number | null
          before_24hrs?: number | null
          before_48hrs?: number | null
          before_6hrs?: number | null
          before_two_weeks?: number | null
          before_week?: number | null
          created_at?: string | null
          id?: string
          lessthan_6hrs?: number | null
          operator_id: string
          operator_name: string
          updated_at?: string | null
        }
        Update: {
          before_12hrs?: number | null
          before_24hrs?: number | null
          before_48hrs?: number | null
          before_6hrs?: number | null
          before_two_weeks?: number | null
          before_week?: number | null
          created_at?: string | null
          id?: string
          lessthan_6hrs?: number | null
          operator_id?: string
          operator_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_policy_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: true
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
        ]
      }
      cities: {
        Row: {
          city_id: string
          country: string | null
          created_at: string | null
          id: number
          is_popular: boolean | null
          name: string
          state: string | null
          updated_at: string | null
        }
        Insert: {
          city_id: string
          country?: string | null
          created_at?: string | null
          id?: number
          is_popular?: boolean | null
          name: string
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          country?: string | null
          created_at?: string | null
          id?: number
          is_popular?: boolean | null
          name?: string
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          coupon_code: string
          created_at: string | null
          discount: number
          from_city: string | null
          from_city_id: string | null
          id: string
          max_discount: number | null
          min_fare: number | null
          updated_at: string | null
          valid_from: string
          valid_to: string
        }
        Insert: {
          coupon_code: string
          created_at?: string | null
          discount: number
          from_city?: string | null
          from_city_id?: string | null
          id?: string
          max_discount?: number | null
          min_fare?: number | null
          updated_at?: string | null
          valid_from: string
          valid_to: string
        }
        Update: {
          coupon_code?: string
          created_at?: string | null
          discount?: number
          from_city?: string | null
          from_city_id?: string | null
          id?: string
          max_discount?: number | null
          min_fare?: number | null
          updated_at?: string | null
          valid_from?: string
          valid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_from_city_id_fkey"
            columns: ["from_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["city_id"]
          },
        ]
      }
      dropping_points: {
        Row: {
          bus_id: string
          created_at: string | null
          d_address: string | null
          d_contact: string | null
          d_landmark: string | null
          d_location: unknown | null
          d_point_name: string
          d_time: string
          dp_id: string
          id: string
          op_bus_id: string
          op_dp_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          route_id: string
          updated_at: string | null
        }
        Insert: {
          bus_id: string
          created_at?: string | null
          d_address?: string | null
          d_contact?: string | null
          d_landmark?: string | null
          d_location?: unknown | null
          d_point_name: string
          d_time: string
          dp_id: string
          id?: string
          op_bus_id: string
          op_dp_id: string
          op_route_id: string
          operator_id: string
          operator_name: string
          route_id: string
          updated_at?: string | null
        }
        Update: {
          bus_id?: string
          created_at?: string | null
          d_address?: string | null
          d_contact?: string | null
          d_landmark?: string | null
          d_location?: unknown | null
          d_point_name?: string
          d_time?: string
          dp_id?: string
          id?: string
          op_bus_id?: string
          op_dp_id?: string
          op_route_id?: string
          operator_id?: string
          operator_name?: string
          route_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dropping_points_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "bus_list"
            referencedColumns: ["bus_id"]
          },
          {
            foreignKeyName: "dropping_points_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "dropping_points_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["route_id"]
          },
        ]
      }
      gst_rates: {
        Row: {
          created_at: string | null
          gst_percent: number
          id: string
          operator_id: string
          operator_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gst_percent?: number
          id?: string
          operator_id: string
          operator_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gst_percent?: number
          id?: string
          operator_id?: string
          operator_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gst_rates_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: true
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
        ]
      }
      operator_apis: {
        Row: {
          additional_params: Json | null
          api_key: string
          api_password: string | null
          api_url: string
          api_username: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          operator_id: string
          operator_name: string
          updated_at: string | null
        }
        Insert: {
          additional_params?: Json | null
          api_key: string
          api_password?: string | null
          api_url: string
          api_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          operator_id: string
          operator_name: string
          updated_at?: string | null
        }
        Update: {
          additional_params?: Json | null
          api_key?: string
          api_password?: string | null
          api_url?: string
          api_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          operator_id?: string
          operator_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          avg_review: number | null
          cleanliness: number | null
          created_at: string | null
          driving: number | null
          five_star: number | null
          four_star: number | null
          id: string
          live_tracking: number | null
          one_star: number | null
          operator_id: string
          operator_name: string
          punctual: number | null
          rest_stop_hygiene: number | null
          reviewer_count: number | null
          seat_comfort: number | null
          staff_behaviour: number | null
          three_star: number | null
          two_star: number | null
          updated_at: string | null
        }
        Insert: {
          avg_review?: number | null
          cleanliness?: number | null
          created_at?: string | null
          driving?: number | null
          five_star?: number | null
          four_star?: number | null
          id?: string
          live_tracking?: number | null
          one_star?: number | null
          operator_id: string
          operator_name: string
          punctual?: number | null
          rest_stop_hygiene?: number | null
          reviewer_count?: number | null
          seat_comfort?: number | null
          staff_behaviour?: number | null
          three_star?: number | null
          two_star?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_review?: number | null
          cleanliness?: number | null
          created_at?: string | null
          driving?: number | null
          five_star?: number | null
          four_star?: number | null
          id?: string
          live_tracking?: number | null
          one_star?: number | null
          operator_id?: string
          operator_name?: string
          punctual?: number | null
          rest_stop_hygiene?: number | null
          reviewer_count?: number | null
          seat_comfort?: number | null
          staff_behaviour?: number | null
          three_star?: number | null
          two_star?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: true
            referencedRelation: "operator_apis"
            referencedColumns: ["operator_id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string | null
          from_city_id: string
          from_city_name: string
          id: string
          is_popular: boolean | null
          route_id: string
          to_city_id: string
          to_city_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_city_id: string
          from_city_name: string
          id?: string
          is_popular?: boolean | null
          route_id: string
          to_city_id: string
          to_city_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_city_id?: string
          from_city_name?: string
          id?: string
          is_popular?: boolean | null
          route_id?: string
          to_city_id?: string
          to_city_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_from_city_id_fkey"
            columns: ["from_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "routes_to_city_id_fkey"
            columns: ["to_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["city_id"]
          },
        ]
      }
      transactions: {
        Row: {
          booking_ids: string
          created_at: string | null
          discounts: number | null
          email: string
          gst: number
          id: string
          mobile: string
          payment_gateway_order_id: string | null
          payment_gateway_payment_id: string | null
          payment_gateway_status: string | null
          payment_method: string | null
          payment_provider: string | null
          remarks: string | null
          status: string
          total_base_fare: number
          total_fare: number
          updated_at: string | null
        }
        Insert: {
          booking_ids: string
          created_at?: string | null
          discounts?: number | null
          email: string
          gst: number
          id?: string
          mobile: string
          payment_gateway_order_id?: string | null
          payment_gateway_payment_id?: string | null
          payment_gateway_status?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          remarks?: string | null
          status?: string
          total_base_fare: number
          total_fare: number
          updated_at?: string | null
        }
        Update: {
          booking_ids?: string
          created_at?: string | null
          discounts?: number | null
          email?: string
          gst?: number
          id?: string
          mobile?: string
          payment_gateway_order_id?: string | null
          payment_gateway_payment_id?: string | null
          payment_gateway_status?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          remarks?: string | null
          status?: string
          total_base_fare?: number
          total_fare?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_policy: {
        Row: {
          id: number
          policy_text: string
        }
        Insert: {
          id?: number
          policy_text: string
        }
        Update: {
          id?: number
          policy_text?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_locked_seats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_pnr: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
