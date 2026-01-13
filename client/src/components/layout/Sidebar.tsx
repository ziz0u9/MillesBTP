import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2,
  AlertTriangle,
  FileText,
  Camera,
  TrendingUp,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mes chantiers", href: "/dashboard/chantiers", icon: Building2 },
  { name: "Alertes & décisions", href: "/dashboard/alertes", icon: AlertTriangle },
  { name: "Écarts & avenants", href: "/dashboard/ecarts", icon: FileText },
  { name: "Journal terrain", href: "/dashboard/journal", icon: Camera },
  { name: "Rapports financiers", href: "/dashboard/rapports", icon: TrendingUp },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-800 bg-[#111111] text-white relative overflow-hidden">
      {/* Texture de points subtile en arrière-plan */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative z-10 flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-heading font-bold text-xl text-[#00ff88] tracking-tight">
          <Building2 className="h-6 w-6" />
          <span>MillesBTP</span>
        </Link>
      </div>
      
      <div className="relative z-10 flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-300"
                  )}
                >
                  {/* Dégradé horizontal vert sombre qui part de la droite (trait) vers la gauche */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-l from-[#00cc6a]/20 via-[#00cc6a]/10 to-transparent" />
                  )}
                  
                  {/* Trait vertical vert à droite */}
                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00cc6a] via-[#00a855] to-[#008844]" />
                  )}
                  
                  {/* Texture subtile pour l'onglet actif */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)
                        `
                      }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      "relative z-10 mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                    )}
                  />
                  <span className="relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Système
          </h3>
          <nav className="space-y-2">
            <Link href="/dashboard/settings">
              <div className={cn(
                "group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                location === "/dashboard/settings"
                  ? "text-white"
                  : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-300"
              )}>
                {location === "/dashboard/settings" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-l from-[#00cc6a]/20 via-[#00cc6a]/10 to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00cc6a] via-[#00a855] to-[#008844]" />
                    <div 
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)
                        `
                      }}
                    />
                  </>
                )}
                <Settings className={cn(
                  "relative z-10 mr-3 h-5 w-5",
                  location === "/dashboard/settings" ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                )} />
                <span className="relative z-10">Paramètres</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      <div className="relative z-10 border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">Jean Dupont</p>
            <p className="truncate text-xs text-gray-400">Ent. Dupont BTP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
