import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => {
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => { }
                        }
                    }
                };
            },
            signInWithPassword: () => Promise.reject(new Error("Supabase not configured")),
            signOut: () => Promise.resolve(),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null })
                })
            })
        }),
        rpc: () => Promise.reject(new Error("Supabase not configured"))
    };
