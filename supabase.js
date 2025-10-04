// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://yxpvnshgtrmuzjybbwwt.supabase.co'
const supabaseKey = 'eyJhbGci0iJIUZI1NiIsInR5cCI'
export const supabase = createClient(supabaseUrl, supabaseKey)