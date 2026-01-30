/**
 * API Types for PHP Backend
 */

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "editor";
}

export interface UserWithProfile extends User {
  full_name: string | null;
  is_banned: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

// Auth responses
export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface CheckSessionResponse {
  authenticated: boolean;
  user: User | null;
}

// Hero section
export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  background_image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

// About section
export interface AboutSection {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  stats: { label: string; value: string }[] | null;
  updated_at: string;
  updated_by: string | null;
}

// Service
export interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Region
export interface Region {
  id: string;
  name: string;
  slug: string;
  map_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

// Station
export interface Station {
  id: string;
  name: string;
  region: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  services: string[] | null;
  products: string[] | null;
  google_maps_url: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Partner
export interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Contact message
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  type: string | null;
  service_type: string | null;
  attachment_url: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

// Dashboard stats
export interface DashboardStats {
  services: number;
  stations: number;
  partners: number;
  messages: number;
  unreadMessages: number;
}

// Site Settings
export interface SiteSettings {
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  phone: string;
  email: string;
  address: string;
}

// Generic responses
export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface CreateResponse extends SuccessResponse {
  id: string;
}

export interface UsersListResponse {
  users: UserWithProfile[];
}

export interface MessageStats {
  total: number;
  unread: number;
}
