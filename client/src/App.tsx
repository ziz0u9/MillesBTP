import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
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
      <Route path="/" component={LandingPage} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      {/* Dashboard Routes wrapped in Layout */}
      <Route path="/dashboard*">
        <Layout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/dashboard/calls" component={Calls} />
            <Route path="/dashboard/mails" component={Mails} />
            <Route path="/dashboard/invoices" component={Invoices} />
            <Route path="/dashboard/orders" component={Orders} />
            <Route path="/dashboard/tasks" component={Tasks} />
            <Route path="/dashboard/clients" component={Clients} />
            <Route path="/dashboard/settings" component={Settings} />
          </Switch>
        </Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
