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
import Calls from "@/pages/modules/Calls";
import Mails from "@/pages/modules/Mails";
import Invoices from "@/pages/modules/Invoices";
import Orders from "@/pages/modules/Orders";
import Tasks from "@/pages/modules/Tasks";
import Clients from "@/pages/modules/Clients";
import Settings from "@/pages/modules/Settings";
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";

function RouterGuard() {
  const { session, loading } = useSession();
  const [location, setLocation] = useLocation();

  // Protéger toutes les routes /dashboard si non authentifié
  // Et rediriger les utilisateurs connectés qui tentent d'accéder à login/register
  useEffect(() => {
    if (!loading) {
      if (!session && location.startsWith("/dashboard")) {
        setLocation("/auth/login");
      } else if (session && (location === "/auth/login" || location === "/auth/register")) {
        // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
        setLocation("/dashboard");
      }
    }
  }, [location, session, loading, setLocation]);

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      {/* Dashboard Routes protégées */}
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/dashboard/calls">
        <Layout>
          <Calls />
        </Layout>
      </Route>
      <Route path="/dashboard/mails">
        <Layout>
          <Mails />
        </Layout>
      </Route>
      <Route path="/dashboard/invoices">
        <Layout>
          <Invoices />
        </Layout>
      </Route>
      <Route path="/dashboard/orders">
        <Layout>
          <Orders />
        </Layout>
      </Route>
      <Route path="/dashboard/tasks">
        <Layout>
          <Tasks />
        </Layout>
      </Route>
      <Route path="/dashboard/clients">
        <Layout>
          <Clients />
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
