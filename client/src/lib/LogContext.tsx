import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './supabaseClient';

export interface LogEntry {
  id: string;
  action: string;
  detail: string;
  date: string;
  ip: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (action: string, detail: string) => void;
  loading: boolean;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Récupérer la session et charger les logs
  useEffect(() => {
    async function initializeLogs() {
      // Récupérer la session actuelle
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUserId(session.user.id);
        await loadLogs(session.user.id);
      } else {
        setLoading(false);
      }

      // Écouter les changements d'authentification
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (newSession?.user) {
          setCurrentUserId(newSession.user.id);
          await loadLogs(newSession.user.id);
        } else {
          setCurrentUserId(null);
          setLogs([]);
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initializeLogs();
  }, []);

  async function loadLogs(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100); // Limiter à 100 logs les plus récents

      if (error) throw error;

      // Formater les logs pour l'affichage
      const formattedLogs: LogEntry[] = (data || []).map(log => ({
        id: log.id,
        action: log.action,
        detail: log.detail || '',
        date: formatLogDate(log.created_at),
        ip: log.ip || 'N/A'
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  function formatLogDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const addLog = async (action: string, detail: string) => {
    // Si pas d'utilisateur connecté, on ne sauvegarde pas mais on ajoute en mémoire
    if (!currentUserId) {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        action,
        detail,
        date: "À l'instant",
        ip: "N/A"
      };
      setLogs(prev => [newLog, ...prev]);
      return;
    }

    try {
      // Sauvegarder dans Supabase
      const { data, error } = await supabase
        .from('logs')
        .insert({
          user_id: currentUserId,
          action,
          detail,
          ip: 'N/A' // Pour l'instant, on ne récupère pas l'IP réelle
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter le log dans l'état local
      const newLog: LogEntry = {
        id: data.id,
        action: data.action,
        detail: data.detail || '',
        date: formatLogDate(data.created_at),
        ip: data.ip || 'N/A'
      };
      
      setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Garder max 100 logs
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log:', error);
      // En cas d'erreur, on ajoute quand même en mémoire
      const newLog: LogEntry = {
        id: Date.now().toString(),
        action,
        detail,
        date: "À l'instant",
        ip: "N/A"
      };
      setLogs(prev => [newLog, ...prev]);
    }
  };

  return (
    <LogContext.Provider value={{ logs, addLog, loading }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
}
