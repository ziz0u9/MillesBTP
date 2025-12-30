import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface ClientWorksite {
  id: string;
  name: string;
  code: string | null;
  address: string;
  profitability_status: "profitable" | "watch" | "at_risk";
  budget_initial: string;
  costs_committed: string;
  status: "active" | "completed" | "archived" | "cancelled";
  start_date: string | null;
  planned_end_date: string | null;
}

export default function ClientDetail() {
  const [location] = useLocation();
  const { session } = useSession();
  const clientId = location.split("/").pop();
  const [client, setClient] = useState<Client | null>(null);
  const [worksites, setWorksites] = useState<ClientWorksite[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWorksites, setLoadingWorksites] = useState(true);

  useEffect(() => {
    if (session?.user && clientId) {
      loadClient();
      loadWorksites();
    }
  }, [session, clientId]);

  async function loadClient() {
    if (!session?.user || !clientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error("Erreur lors du chargement du client:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorksites() {
    if (!session?.user || !clientId) return;
    
    setLoadingWorksites(true);
    try {
      const { data, error } = await supabase
        .from("worksites")
        .select("*")
        .eq("client_id", clientId)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorksites(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des chantiers:", error);
    } finally {
      setLoadingWorksites(false);
    }
  }

  const getProfitabilityColor = (status: string) => {
    switch(status) {
      case "profitable": return "text-[#00ff88] bg-[#00ff88]/20 border-[#00ff88]/30";
      case "watch": return "text-orange-500 bg-orange-500/20 border-orange-500/30";
      case "at_risk": return "text-red-500 bg-red-500/20 border-red-500/30";
      default: return "text-gray-500 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getProfitabilityLabel = (status: string) => {
    switch(status) {
      case "profitable": return "🟢 Rentable";
      case "watch": return "🟠 À surveiller";
      case "at_risk": return "🔴 À risque";
      default: return "Inconnu";
    }
  };

  const calculateStats = () => {
    const activeWorksites = worksites.filter(w => w.status === "active");
    const completedWorksites = worksites.filter(w => w.status === "completed");
    
    const totalBudget = worksites.reduce((sum, w) => sum + parseFloat(w.budget_initial || "0"), 0);
    const totalCosts = worksites.reduce((sum, w) => sum + parseFloat(w.costs_committed || "0"), 0);
    const totalMargin = totalBudget - totalCosts;
    const averageMargin = completedWorksites.length > 0 
      ? completedWorksites.reduce((sum, w) => {
          const budget = parseFloat(w.budget_initial || "0");
          const costs = parseFloat(w.costs_committed || "0");
          return sum + (budget - costs);
        }, 0) / completedWorksites.length
      : 0;

    return {
      total: worksites.length,
      active: activeWorksites.length,
      completed: completedWorksites.length,
      totalBudget,
      totalCosts,
      totalMargin,
      averageMargin,
    };
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Client non trouvé</div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{client.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{client.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total chantiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.active} actifs, {stats.completed} terminés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalBudget.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Budget total</p>
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Coûts engagés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalCosts.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total engagé</p>
          </CardContent>
        </Card>

        <Card className={`rounded-lg border-0 shadow-md ${
          stats.totalMargin >= 0 ? "bg-[#00ff88]/10 border-[#00ff88]/30" : "bg-red-500/10 border-red-500/30"
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${stats.totalMargin >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
              Marge totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalMargin >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
              {stats.totalMargin.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0
              })}
            </div>
            {stats.completed > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Moyenne: {stats.averageMargin.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des chantiers */}
      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Chantiers</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWorksites ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : worksites.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>Aucun chantier pour ce client</p>
            </div>
          ) : (
            <div className="space-y-4">
              {worksites.map((worksite) => {
                const budget = parseFloat(worksite.budget_initial || "0");
                const costs = parseFloat(worksite.costs_committed || "0");
                const margin = budget - costs;
                const marginPercentage = budget > 0 ? (margin / budget) * 100 : 0;

                return (
                  <Link key={worksite.id} href={`/dashboard/worksites/${worksite.id}`}>
                    <Card className="bg-[#2f343a] border-[#3a3f47] hover:border-[#00ff88]/30 hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{worksite.name}</h3>
                              <Badge className={getProfitabilityColor(worksite.profitability_status)}>
                                {getProfitabilityLabel(worksite.profitability_status)}
                              </Badge>
                              <Badge className={
                                worksite.status === "active" ? "bg-blue-500/20 text-blue-500 border-blue-500/30" :
                                worksite.status === "completed" ? "bg-gray-500/20 text-gray-500 border-gray-500/30" :
                                "bg-gray-500/20 text-gray-500 border-gray-500/30"
                              }>
                                {worksite.status === "active" ? "Actif" : "Terminé"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{worksite.address}</p>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Budget:</span>
                                <span className="text-white font-semibold ml-2">
                                  {budget.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Coûts:</span>
                                <span className="text-white font-semibold ml-2">
                                  {costs.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Marge:</span>
                                <span className={`font-semibold ml-2 ${margin >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                                  {margin.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Marge %:</span>
                                <span className={`font-semibold ml-2 ${marginPercentage >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                                  {marginPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            {worksite.start_date && worksite.planned_end_date && (
                              <div className="mt-3 text-xs text-gray-500">
                                Du {format(new Date(worksite.start_date), "dd/MM/yyyy")} au {format(new Date(worksite.planned_end_date), "dd/MM/yyyy")}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

