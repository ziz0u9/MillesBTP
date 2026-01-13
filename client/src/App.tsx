import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { LogProvider } from "@/lib/LogContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/dashboard/Dashboard";
import Chantiers from "@/pages/modules/Chantiers";
import ChantierDetail from "@/pages/modules/ChantierDetail";
import Alertes from "@/pages/modules/Alertes";
import Ecarts from "@/pages/modules/Ecarts";
import Journal from "@/pages/modules/Journal";
import Rapports from "@/pages/modules/Rapports";
import Settings from "@/pages/modules/Settings";
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";

function RouterGuard() {
  const { session, loading } = useSession();
  const [location, setLocation] = useLocation();

  // MODE DÉMO : Rediriger automatiquement vers le dashboard
  useEffect(() => {
    if (!loading) {
      // Rediriger la page d'accueil et les pages d'auth vers le dashboard
      if (location === "/" || location === "/auth/login" || location === "/auth/register") {
        setLocation("/dashboard");
      }
    }
  }, [location, loading, setLocation]);

  // Recharger les données quand la session change
  useEffect(() => {
    if (session?.user) {
      console.log("[App] Session utilisateur détectée, invalidation du cache");
      // Invalider toutes les requêtes pour forcer un rechargement avec la nouvelle session
      queryClient.invalidateQueries();
    }
  }, [session?.user?.id]);

  // Détecter la perte de connexion et recharger quand elle revient
  useEffect(() => {
    const handleOnline = () => {
      console.log("[App] Connexion rétablie, rechargement des données");
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      console.warn("[App] Connexion perdue");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Recharger les données quand l'onglet redevient visible après longue absence
  useEffect(() => {
    let lastVisibilityChange = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeSinceLastChange = now - lastVisibilityChange;
        const fiveMinutes = 5 * 60 * 1000;

        // Si l'onglet était caché depuis plus de 5 minutes, recharger
        if (timeSinceLastChange > fiveMinutes) {
          console.log("[App] Onglet visible après longue absence, rechargement des données");
          queryClient.invalidateQueries();
        }
      }
      lastVisibilityChange = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Switch>
      {/* Mode Démo : Redirection automatique vers dashboard */}
      <Route path="/">
        {() => {
          setLocation("/dashboard");
          return null;
        }}
      </Route>
      {/* Dashboard Routes - Accès direct sans authentification */}
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/dashboard/chantiers">
        <Layout>
          <Chantiers />
        </Layout>
      </Route>
      <Route path="/dashboard/chantiers/:id">
        <Layout>
          <ChantierDetail />
        </Layout>
      </Route>
      <Route path="/dashboard/alertes">
        <Layout>
          <Alertes />
        </Layout>
      </Route>
      <Route path="/dashboard/ecarts">
        <Layout>
          <Ecarts />
        </Layout>
      </Route>
      <Route path="/dashboard/journal">
        <Layout>
          <Journal />
        </Layout>
      </Route>
      <Route path="/dashboard/rapports">
        <Layout>
          <Rapports />
        </Layout>
      </Route>
      <Route path="/dashboard/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LogProvider>
        <RouterGuard />
        <Toaster />
      </LogProvider>
    </QueryClientProvider>
  );
}

export default App;
