-- =====================================================
-- 20260616000000_security_rls_hardening.sql
-- Security hardening (audit 2026-06-16):
--   1. Centralized is_admin() helper covering BOTH admin emails
--   2. Enable RLS on booking_rate_limits (was exposed via PostgREST)
--   3. Enable RLS on gallery (was exposed)
--   4. Grant both admins access on all core tables (was single-email)
--
-- NON-DESTRUCTIVE: only adds policies / enables RLS. Existing single-email
-- admin policies stay (Postgres OR-s permissive policies together). The app
-- itself uses the service_role key which bypasses RLS, so these policies only
-- affect direct (Supabase Studio / anon key) access.
--
-- Idempotent: safe to re-run.
-- =====================================================

-- 1) Centralized admin check ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') IN (
    'mtosic0450@gmail.com',
    'apartmanijovca@gmail.com'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'True when the current JWT email is one of the configured admin accounts.';

-- 2) booking_rate_limits: enable RLS (lock direct anon/authenticated access) ---
--    The check_booking_rate_limit() function is SECURITY DEFINER and the app
--    uses the service_role key, so both continue to work past RLS. With RLS on
--    and no permissive policy, anon/authenticated callers can no longer read or
--    delete rate-limit rows via the REST API.
ALTER TABLE booking_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view rate limits" ON booking_rate_limits;
CREATE POLICY "Admins can view rate limits"
  ON booking_rate_limits
  FOR SELECT
  USING (public.is_admin());

-- 3) gallery: enable RLS (public read, admin manage) ---------------------------
DO $$
BEGIN
  IF to_regclass('public.gallery') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery';
    EXECUTE 'CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (TRUE)';

    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery';
    EXECUTE 'CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (public.is_admin())';
  END IF;
END $$;

-- 4) Multi-admin coverage on all core tables -----------------------------------
--    Adds a permissive "FOR ALL" policy keyed on is_admin() so that
--    apartmanijovca@gmail.com (previously uncovered) also has access.

DROP POLICY IF EXISTS "Admins can manage apartments" ON apartments;
CREATE POLICY "Admins can manage apartments" ON apartments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage guests" ON guests;
CREATE POLICY "Admins can manage guests" ON guests FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;
CREATE POLICY "Admins can manage bookings" ON bookings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage availability" ON availability;
CREATE POLICY "Admins can manage availability" ON availability FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage booking messages" ON booking_messages;
CREATE POLICY "Admins can manage booking messages" ON booking_messages FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage messages" ON messages;
CREATE POLICY "Admins can manage messages" ON messages FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage content" ON content;
CREATE POLICY "Admins can manage content" ON content FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage analytics" ON analytics_events;
CREATE POLICY "Admins can manage analytics" ON analytics_events FOR ALL USING (public.is_admin());

-- email_events previously granted SELECT only to apartmanijovca@gmail.com;
-- this adds full access for BOTH admins.
DROP POLICY IF EXISTS "Admins can manage email events" ON email_events;
CREATE POLICY "Admins can manage email events" ON email_events FOR ALL USING (public.is_admin());
