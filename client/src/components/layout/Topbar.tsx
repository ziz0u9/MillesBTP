import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/hooks/useSession";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLogs } from "@/lib/LogContext";

export function Topbar() {
  const { session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const { addLog } = useLogs();

  useEffect(() => {
    async function getProfile() {
      if (session?.user) {
        // On va chercher les infos du profile dans la table "profiles" si existe sinon use metadata
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("full_name, company")
          .eq("id", session.user.id)
          .single();
        
        // Si le profil existe dans la table, on l'utilise, sinon on utilise les metadata
        if (!error && profileData) {
          setProfile(profileData);
        } else {
          // Fallback sur les user_metadata pour les utilisateurs créés avant la mise à jour
          setProfile(session.user.user_metadata ?? {});
        }
      } else {
        setProfile(null);
      }
    }
    getProfile();
  }, [session]);

  async function handleLogout() {
    // Enregistrer le log de déconnexion avant de déconnecter
    if (session?.user?.email) {
      addLog("Déconnexion", `Déconnexion de ${session.user.email}`);
    }
    
    // D'abord, vider le localStorage et sessionStorage AVANT signOut
    // pour éviter que Supabase ne restaure la session
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('lqcqmcnrkmozafvhjimm')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('lqcqmcnrkmozafvhjimm')) {
        sessionStorage.removeItem(key);
      }
    });
    
    try {
      // Ensuite, déconnexion côté Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    
    // Forcer la redirection vers la page de login avec rechargement complet
    // Utiliser replace pour éviter de pouvoir revenir en arrière
    window.location.replace("/auth/login");
  }

  const displayName = profile?.full_name || profile?.name || "Utilisateur";
  const displayEmail = session?.user?.email || "";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-sidebar-border/50 bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="-ml-2">
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-heading font-bold text-lg">MillesBTP</span>
      </div>

      <div className="hidden lg:flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher (commandes, factures, clients)..."
            className="w-full bg-sidebar-accent/50 border-sidebar-border pl-9 focus:bg-sidebar-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="/avatars/01.png" alt={displayName} />
                <AvatarFallback className="bg-primary/20 text-primary font-medium">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Abonnement</DropdownMenuItem>
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogout}>
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
