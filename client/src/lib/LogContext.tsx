import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface LogEntry {
  id: number;
  action: string;
  detail: string;
  date: string;
  ip: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (action: string, detail: string) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, action: "Connexion", detail: "Connexion réussie depuis Chrome / Windows", date: "Aujourd'hui, 08:30", ip: "192.168.1.1" },
    { id: 2, action: "Création Facture", detail: "Facture #FAC-2024-004 créée pour RénovPlus", date: "Hier, 16:45", ip: "192.168.1.1" },
    { id: 3, action: "Modification Client", detail: "Mise à jour adresse M. Dubois", date: "Hier, 14:20", ip: "192.168.1.1" },
  ]);

  const addLog = (action: string, detail: string) => {
    const newLog: LogEntry = {
      id: Date.now(),
      action,
      detail,
      date: new Date().toLocaleString('fr-FR', { 
        weekday: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      ip: "192.168.1.1"
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <LogContext.Provider value={{ logs, addLog }}>
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
