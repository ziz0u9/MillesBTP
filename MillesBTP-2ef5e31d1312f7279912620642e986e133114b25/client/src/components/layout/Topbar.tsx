import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, X, FileText, ShoppingCart, Users, Mail, Phone, CheckSquare } from "lucide-react";
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
import { supabase } from "@/lib/supabaseClient";
import { useLogs } from "@/lib/LogContext";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: string;
  type: "client" | "order" | "invoice" | "quote" | "mail" | "call" | "task";
  title: string;
  subtitle: string;
  href: string;
  icon: any;
}

export function Topbar() {
  const { session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { addLog } = useLogs();

  useEffect(() => {
    async function getProfile() {
      if (session?.user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("full_name, company")
          .eq("id", session.user.id)
          .single();
        
        if (!error && profileData) {
          setProfile(profileData);
        } else {
          setProfile(session.user.user_metadata ?? {});
        }
      } else {
        setProfile(null);
      }
    }
    getProfile();
  }, [session]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function performSearch() {
    if (!session?.user || searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    try {
      // Recherche dans les clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, email, phone, type")
        .eq("user_id", session.user.id)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,contact.ilike.%${query}%`)
        .limit(5);

      clients?.forEach(client => {
        results.push({
          id: client.id,
          type: "client",
          title: client.name,
          subtitle: client.email || client.phone || "",
          href: "/dashboard/clients",
          icon: Users,
        });
      });

      // Recherche dans les commandes
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, supplier, items")
        .eq("user_id", session.user.id)
        .or(`order_number.ilike.%${query}%,supplier.ilike.%${query}%,items.ilike.%${query}%`)
        .limit(5);

      orders?.forEach(order => {
        results.push({
          id: order.id,
          type: "order",
          title: order.order_number,
          subtitle: `${order.supplier} - ${order.items.substring(0, 50)}`,
          href: "/dashboard/orders",
          icon: ShoppingCart,
        });
      });

      // Recherche dans les factures
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, client_name, amount")
        .eq("user_id", session.user.id)
        .or(`invoice_number.ilike.%${query}%,client_name.ilike.%${query}%`)
        .limit(5);

      invoices?.forEach(invoice => {
        results.push({
          id: invoice.id,
          type: "invoice",
          title: invoice.invoice_number,
          subtitle: `${invoice.client_name} - ${invoice.amount}€`,
          href: "/dashboard/invoices",
          icon: FileText,
        });
      });

      // Recherche dans les devis
      const { data: quotes } = await supabase
        .from("quotes")
        .select("id, quote_number, client_name, amount")
        .eq("user_id", session.user.id)
        .or(`quote_number.ilike.%${query}%,client_name.ilike.%${query}%`)
        .limit(5);

      quotes?.forEach(quote => {
        results.push({
          id: quote.id,
          type: "quote",
          title: quote.quote_number,
          subtitle: `${quote.client_name} - ${quote.amount}€`,
          href: "/dashboard/invoices",
          icon: FileText,
        });
      });

      // Recherche dans les mails
      const { data: mails } = await supabase
        .from("mails")
        .select("id, subject, sender, email")
        .eq("user_id", session.user.id)
        .or(`subject.ilike.%${query}%,sender.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      mails?.forEach(mail => {
        results.push({
          id: mail.id,
          type: "mail",
          title: mail.subject,
          subtitle: `${mail.sender} (${mail.email})`,
          href: "/dashboard/mails",
          icon: Mail,
        });
      });

      // Recherche dans les appels
      const { data: calls } = await supabase
        .from("calls")
        .select("id, contact, phone, subject")
        .eq("user_id", session.user.id)
        .or(`contact.ilike.%${query}%,phone.ilike.%${query}%,subject.ilike.%${query}%`)
        .limit(5);

      calls?.forEach(call => {
        results.push({
          id: call.id,
          type: "call",
          title: call.contact,
          subtitle: `${call.phone} - ${call.subject || ""}`,
          href: "/dashboard/calls",
          icon: Phone,
        });
      });

      // Recherche dans les tâches
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, tag")
        .eq("user_id", session.user.id)
        .or(`title.ilike.%${query}%,tag.ilike.%${query}%`)
        .limit(5);

      tasks?.forEach(task => {
        results.push({
          id: task.id,
          type: "task",
          title: task.title,
          subtitle: task.tag || "Tâche",
          href: "/dashboard/tasks",
          icon: CheckSquare,
        });
      });

      setSearchResults(results.slice(0, 10)); // Limiter à 10 résultats
      setIsSearchOpen(results.length > 0);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleResultClick(result: SearchResult) {
    setLocation(result.href);
    setIsSearchOpen(false);
    setSearchQuery("");
    addLog("Recherche", `Navigation vers ${result.type}: ${result.title}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  }

  async function handleLogout() {
    if (session?.user?.email) {
      addLog("Déconnexion", `Déconnexion de ${session.user.email}`);
    }
    
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    
    window.location.replace("/auth/login");
  }

  const displayName = profile?.full_name || profile?.name || "Utilisateur";
  const displayEmail = session?.user?.email || "";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-800 bg-[#111111]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="-ml-2">
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-heading font-bold text-lg">MillesBTP</span>
      </div>

      <div className="hidden lg:flex flex-1 items-center max-w-md">
        <div className="relative w-full" ref={searchRef}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher (commandes, factures, clients)..."
            className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 pl-9 focus:bg-gray-800 transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length > 0) {
                setIsSearchOpen(true);
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setIsSearchOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setIsSearchOpen(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Dropdown des résultats */}
          {isSearchOpen && (
            <Card className="absolute top-full mt-2 w-full bg-[#262930] border-[#3a3f47] shadow-xl max-h-[400px] overflow-y-auto z-50">
              <div className="p-2">
                {isSearching ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">Recherche en cours...</div>
                ) : searchResults.length === 0 && searchQuery.length > 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">Aucun résultat trouvé</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Résultats ({searchResults.length})
                    </div>
                    {searchResults.map((result) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2f343a] transition-colors text-left group"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="mt-0.5 p-1.5 rounded-md bg-[#2f343a] group-hover:bg-[#00cc6a]/20">
                            <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#00cc6a]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{result.title}</div>
                            <div className="text-xs text-gray-400 truncate">{result.subtitle}</div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase">
                              {result.type === "order" ? "Commande" : 
                               result.type === "invoice" ? "Facture" :
                               result.type === "quote" ? "Devis" :
                               result.type === "client" ? "Client" :
                               result.type === "mail" ? "Mail" :
                               result.type === "call" ? "Appel" :
                               result.type === "task" ? "Tâche" : result.type}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : null}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#00ff88] ring-2 ring-[#111111] animate-pulse" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-gray-700">
                <AvatarImage src="/avatars/01.png" alt={displayName} />
                <AvatarFallback className="bg-[#00ff88]/20 text-[#00ff88] font-medium">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#262930] border-[#3a3f47]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{displayName}</p>
                <p className="text-xs leading-none text-gray-400">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#3a3f47]" />
            <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Profil</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#3a3f47]" />
            <DropdownMenuItem className="text-red-500 focus:text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
