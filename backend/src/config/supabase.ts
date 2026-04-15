import { createClient } from '@supabase/supabase-js';

// Uses SERVICE_ROLE key — bypasses RLS for backend operations
export const supabaseAdmin = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);
