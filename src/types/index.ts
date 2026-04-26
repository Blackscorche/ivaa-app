export type UserRole = 'admin' | 'owner' | 'sales' | 'design';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  shopId?: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

export interface Shop {
  id: number;
  name: string;
  address?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  shop_type?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  payment_status: 'active' | 'inactive' | 'suspended';
  credit_balance: number;
  created_at: string;
}

export interface Screen {
  id: number;
  name: string;
  location?: string;
  status: 'online' | 'offline' | 'active';
  last_heartbeat?: string;
  monthly_cost: number;
}

export interface Content {
  id: number;
  original_filename: string;
  file_url: string;
  file_type: 'image' | 'video' | 'pdf';
  status: 'pending' | 'in_design' | 'designed' | 'approved' | 'rejected' | 'published';
  rejection_reason?: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  charge_amount: number;
  was_free_upload: boolean;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
