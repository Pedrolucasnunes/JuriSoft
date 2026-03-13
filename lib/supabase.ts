import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://yremcialyhfwybmedgfz.supabase.co"

const supabaseKey =
  "sb_publishable_IGo3R93Q8aBT0HOkamvLsg_EbK_cAST"

export const supabase = createClient(supabaseUrl, supabaseKey)