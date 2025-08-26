export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guest';
  phone?: string;
  password?: string,
  password_confirmation?: string,
  created_at: string;
  updated_at: string;
  profile_url: string;
}

export interface HotelInfo {
  hotel_name: string,
  currency: string,
  currency_symbol: string,
  hotel_address: string,
  phone: string,
  email: string,
  check_in: string,
  check_out: string,
  tax_rate: number,
}

export interface Room {
  id: number;
  number: string;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Presidential';
  price_per_night: number;
  capacity: number;
  amenities: string[];
  description: string;
  images: string[];
  status: 'Available' | 'Occupied' | 'Maintenance';
  floor: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  code: string;
  user_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  tax_amount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  payment_status: 'pending' | 'paid' | 'refund';
  created_at: string;
  updated_at: string;
  user?: User;
  room?: Room;
  payment_date: string;
  refund_date: string;
  payment_reference: string;
  payment_method: string,
  payment_method_account: string,
}

export interface Report {
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  average_daily_rate: number;
  monthly_revenue: { month: string; revenue: number }[];
  room_type_bookings: { type: string; count: number; revenue: number }[];
  booking_status_distribution: { status: string; count: number }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface NavState {
    isShowNav: boolean;
}