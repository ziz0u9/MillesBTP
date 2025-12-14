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

// Simple placeholder for other modules to avoid errors before they are built
const PlaceholderModule = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
    <div className="p-4 rounded-full bg-primary/10 text-primary">
      <span className="text-2xl font-bold">{title.charAt(0)}</span>
    </div>
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-muted-foreground max-w-md">
      Ce module est en cours de développement. Il sera disponible dans la prochaine version.
    </p>
  </div>
);

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
            <Route path="/dashboard/clients">
              <PlaceholderModule title="Fichier Clients" />
            </Route>
            <Route path="/dashboard/settings">
              <PlaceholderModule title="Paramètres" />
            </Route>
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
