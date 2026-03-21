import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxcefkxylwiijnmqpunv.supabase.co'
const supabaseKey = 'sb_publishable_IcmXj7Qg8x2K9qOlezNYlw_6NTZWDZJ'

export const supabase = createClient(supabaseUrl, supabaseKey)