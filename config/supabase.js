// config/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cwuvuhrakhnwndrnaavs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dXZ1aHJha2hud25kcm5hYXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjU4MDksImV4cCI6MjA4MTIwMTgwOX0.L8szQGZ4fqy7hOWCME4dII_eL8LZD8PdOBrqDqean4Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});