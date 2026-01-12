import { createClient } from '@supabase/supabase-js';

// Paramètres de connexion Supabase (remplacés par tes valeurs)
const supabaseUrl = 'https://lqcqmcnrkmozafvhjimm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3FtY25ya21vemFmdmhqaW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTgyMzcsImV4cCI6MjA4MTI5NDIzN30.Pr6UDgGAAkN7B1-DzJmZ6dn_Is_xRUZJ6S-92c3hlAg';

// Configuration avec retry et timeout améliorés
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Utiliser localStorage pour persister la session
    storageKey: 'millesbtp-auth-token', // Clé personnalisée
    flowType: 'pkce', // Plus sécurisé
  },
  global: {
    headers: {
      'x-application-name': 'MillesBTP',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Écouter les erreurs d'authentification globales
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log("[Supabase] Déconnexion globale détectée");
  } else if (event === 'TOKEN_REFRESHED') {
    console.log("[Supabase] Token rafraîchi globalement");
  } else if (event === 'USER_UPDATED') {
    console.log("[Supabase] Utilisateur mis à jour");
  }
});

// Fonction helper pour retry automatique des requêtes
export async function supabaseWithRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3,
  delayMs = 1000
): Promise<{ data: T | null; error: any }> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Supabase] Tentative ${attempt}/${maxRetries}`);
      const result = await operation();
      
      if (!result.error) {
        console.log(`[Supabase] Succès à la tentative ${attempt}`);
        return result;
      }
      
      lastError = result.error;
      
      // Ne pas retry sur certaines erreurs (authentification, permissions)
      if (result.error.code === 'PGRST301' || result.error.code === '42501') {
        console.error(`[Supabase] Erreur non retriable:`, result.error);
        return result;
      }
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1); // Délai exponentiel
        console.warn(`[Supabase] Erreur, nouvelle tentative dans ${delay}ms:`, result.error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error;
      console.error(`[Supabase] Exception à la tentative ${attempt}:`, error);
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`[Supabase] Échec après ${maxRetries} tentatives`);
  return { data: null, error: lastError };
}

