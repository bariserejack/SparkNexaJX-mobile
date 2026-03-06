import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = "https://fknmdiajmerksiostpes.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbm1kaWFqbWVya3Npb3N0cGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTg0ODMsImV4cCI6MjA4NTYzNDQ4M30.3iTOl5XliUsISe7KXrSCbQYC9C__h-1z9pn893rviBo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
