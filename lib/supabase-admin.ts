import { createClient } from "@supabase/supabase-js"

// ✅ Service role key — ignora RLS, usar APENAS em rotas admin no servidor
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)