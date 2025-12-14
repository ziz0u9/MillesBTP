import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      {/* Dashboard Routes - Explicitly defined to ensure reliable matching */}
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
      
      {/* Global Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LogProvider>
        <Router />
        <Toaster />
      </LogProvider>
    </QueryClientProvider>
  );
}

export default App;
