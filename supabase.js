// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://eyezopdaykvlrekbwblj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZXpvcGRheWt2bHJla2J3YmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzE5OTksImV4cCI6MjA3NTE0Nzk5OX0.lwFr0uX9_kvanbN0UzEMW3-Nb8wEynO8_Z7qAcMoIJ8'
export const supabase = createClient(supabaseUrl, supabaseKey)