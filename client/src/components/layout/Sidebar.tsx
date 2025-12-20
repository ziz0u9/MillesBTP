import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Phone, 
  Mail, 
  FileText, 
  ShoppingCart, 
  CheckSquare, 
  Users, 
  Settings, 
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appels", href: "/dashboard/calls", icon: Phone },
  { name: "Mails", href: "/dashboard/mails", icon: Mail },
  { name: "Facturation", href: "/dashboard/invoices", icon: FileText },
  { name: "Commandes", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Tâches", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 font-heading font-bold text-xl text-primary tracking-tight">
          <Building2 className="h-6 w-6" />
          <span>MillesBTP</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_0_hsl(var(--primary))]"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Système
          </h3>
          <nav className="space-y-1">
            <Link href="/dashboard/settings">
              <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-white transition-colors cursor-pointer">
                <Settings className="mr-3 h-5 w-5" />
                Paramètres
              </div>
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">Jean Dupont</p>
            <p className="truncate text-xs text-muted-foreground">Ent. Dupont BTP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
