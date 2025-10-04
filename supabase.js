// supabase.js - SIMPLER VERSION
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://yxpvnshgtrmuzjybbwwt.supabase.co'
const supabaseKey = 'eyJhbGci0iJIUZI1NiIsInR5cCI'
const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Supabase connected!")
export { supabase }