-- =============================================
-- AWS Petroleum Admin Dashboard Database Schema
-- =============================================

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- 2. Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Create profiles table for admin users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create hero_section table
CREATE TABLE public.hero_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'شريكك الموثوق على الطريق',
    subtitle TEXT NOT NULL DEFAULT 'منذ 1998',
    description TEXT,
    background_image_url TEXT,
    cta_text TEXT DEFAULT 'تواصل معنا',
    cta_link TEXT DEFAULT '#contact',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 5. Create about_section table
CREATE TABLE public.about_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'من نحن',
    content TEXT NOT NULL,
    image_url TEXT,
    stats JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 6. Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Create stations table
CREATE TABLE public.stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    services TEXT[],
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Create partners table
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Create contact_messages table for receiving messages
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Create Security Definer Functions
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;

-- =============================================
-- RLS Policies
-- =============================================

-- User Roles Policies
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Hero Section Policies (Public read, Admin/Editor write)
CREATE POLICY "Public can view active hero" ON public.hero_section
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and editors can manage hero" ON public.hero_section
    FOR ALL TO authenticated
    USING (public.is_admin_or_editor(auth.uid()))
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- About Section Policies
CREATE POLICY "Public can view about section" ON public.about_section
    FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage about" ON public.about_section
    FOR ALL TO authenticated
    USING (public.is_admin_or_editor(auth.uid()))
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Services Policies
CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and editors can manage services" ON public.services
    FOR ALL TO authenticated
    USING (public.is_admin_or_editor(auth.uid()))
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Stations Policies
CREATE POLICY "Public can view active stations" ON public.stations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and editors can manage stations" ON public.stations
    FOR ALL TO authenticated
    USING (public.is_admin_or_editor(auth.uid()))
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Partners Policies
CREATE POLICY "Public can view active partners" ON public.partners
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and editors can manage partners" ON public.partners
    FOR ALL TO authenticated
    USING (public.is_admin_or_editor(auth.uid()))
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Contact Messages Policies
CREATE POLICY "Anyone can send messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and editors can view messages" ON public.contact_messages
    FOR SELECT TO authenticated
    USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update messages" ON public.contact_messages
    FOR UPDATE TO authenticated
    USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- Create Storage Bucket for uploads
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage Policies
CREATE POLICY "Public can view uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'uploads' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Authenticated users can update uploads" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'uploads' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Authenticated users can delete uploads" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'uploads' AND public.is_admin_or_editor(auth.uid()));

-- =============================================
-- Trigger for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON public.hero_section
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON public.about_section
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON public.stations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();