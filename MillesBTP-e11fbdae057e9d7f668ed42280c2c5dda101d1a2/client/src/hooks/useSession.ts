import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSession() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout;
    
    // Récupérer la session actuelle immédiatement
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error) {
            console.error("[Session] Erreur récupération session:", error);
          }
          
          if (data.session) {
            console.log("[Session] Session active, expiration:", new Date(data.session.expires_at! * 1000).toLocaleString());
          } else {
            console.warn("[Session] Aucune session active");
          }
          
          setSession(data.session);
          setLoading(false);
        }
      } catch (error) {
        console.error("[Session] Erreur lors de l'initialisation de la session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initSession();
    
    // Vérifier et rafraîchir la session toutes les 5 minutes
    refreshInterval = setInterval(async () => {
      if (!mounted) return;
      
      try {
        console.log("[Session] Vérification de la session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[Session] Erreur lors de la vérification:", error);
          return;
        }
        
        if (!data.session) {
          console.warn("[Session] Session expirée, redirection vers login");
          window.location.href = "/auth/login";
          return;
        }
        
        // Vérifier si le token expire bientôt (dans moins de 10 minutes)
        const expiresAt = data.session.expires_at! * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        const tenMinutes = 10 * 60 * 1000;
        
        if (timeUntilExpiry < tenMinutes) {
          console.log("[Session] Token expire bientôt, rafraîchissement...");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("[Session] Erreur rafraîchissement:", refreshError);
          } else if (refreshData.session) {
            console.log("[Session] Token rafraîchi avec succès");
            setSession(refreshData.session);
          }
        } else {
          console.log("[Session] Token valide, expire dans", Math.floor(timeUntilExpiry / 60000), "minutes");
        }
      } catch (error) {
        console.error("[Session] Erreur vérification périodique:", error);
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes
    
    // Écouter les changements d'authentification (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (mounted) {
        console.log("[Session] Changement d'état:", event);
        
        if (event === 'SIGNED_OUT') {
          console.log("[Session] Déconnexion détectée");
          setSession(null);
          window.location.href = "/auth/login";
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("[Session] Token rafraîchi automatiquement");
          setSession(newSession);
        } else if (event === 'SIGNED_IN') {
          console.log("[Session] Connexion détectée");
          setSession(newSession);
        } else {
          setSession(newSession);
        }
        
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

