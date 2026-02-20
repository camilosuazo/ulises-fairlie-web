export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  free_class_used: boolean;
  classes_remaining: number;
  current_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  classes_per_month: number;
  features: string[];
  popular: boolean;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

export interface ScheduledClass {
  id: string;
  user_id: string;
  scheduled_date: string;
  scheduled_time: string;
  meet_link: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
}

export interface Availability {
  id: string;
  day_of_week: number;
  time_slot: string;
  is_available: boolean;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string | null;
  plan_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  provider: string | null;
  provider_preference_id: string | null;
  provider_payment_id: string | null;
  payment_method: string | null;
  external_reference: string | null;
  external_id: string | null;
  status_detail: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string | null;
  resource_type: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResource {
  id: string;
  student_id: string;
  resource_id: string;
  assigned_at: string;
  // Joined data
  resources?: Resource;
  profiles?: Profile;
}
