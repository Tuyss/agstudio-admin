import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Supabase env vars não configuradas. Crie o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(url, key)
