import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface Worksite {
  id: string;
  name: string;
  code: string | null;
  client_id: string;
  address: string;
  type: string | null;
  profitability_status: "profitable" | "watch" | "at_risk";
  budget_initial: string;
  costs_estimated: string;
  costs_committed: string;
  margin_estimated: string | null;
  margin_percentage: string | null;
  status: "active" | "completed" | "archived" | "cancelled";
  has_budget_alert: boolean;
  has_amendment_alert: boolean;
  has_admin_alert: boolean;
  start_date: string | null;
  planned_end_date: string | null;
  clients?: { name: string };
}

interface WorksiteAlert extends Worksite {
  alertType: "budget" | "amendment" | "admin";
  alertMessage: string;
}

export default function Dashboard() {
  const { session } = useSession();
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "profitable" | "watch" | "at_risk">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user) {
      loadWorksites();
    }
  }, [session]);

  async function loadWorksites() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("worksites")
        .select(`
          *,
          clients:client_id (name)
        `)
        .eq("user_id", session.user.id)
        .in("status", ["active", "completed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      const worksitesData = data || [];

      // Calculer et mettre à jour les alertes pour chaque chantier
      await Promise.all(
        worksitesData.map(async (worksite) => {
          await calculateAndUpdateAlerts(worksite);
        })
      );

      // Recharger les données après la mise à jour des alertes
      const { data: updatedData, error: reloadError } = await supabase
        .from("worksites")
        .select(`
          *,
          clients:client_id (name)
        `)
        .eq("user_id", session.user.id)
        .in("status", ["active", "completed"])
        .order("created_at", { ascending: false });

      if (!reloadError) {
        setWorksites(updatedData || []);
      } else {
        setWorksites(worksitesData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des chantiers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function calculateAndUpdateAlerts(worksite: Worksite) {
    if (!session?.user) return;

    const budget = parseFloat(worksite.budget_initial || "0");
    const costsCommitted = parseFloat(worksite.costs_committed || "0");
    
    // Alerte budget : si coûts > 90% du budget ou budget dépassé
    const budgetAlert = costsCommitted > budget * 0.9 || costsCommitted > budget;

    // Alerte avenant : vérifier si avenant en attente > 7 jours
    const { data: pendingAmendments } = await supabase
      .from("amendments")
      .select("requested_at")
      .eq("worksite_id", worksite.id)
      .eq("status", "pending");

    const hasOldPending = pendingAmendments?.some(am => {
      const daysSince = (Date.now() - new Date(am.requested_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    }) || false;

    // Alerte admin : si date de fin prévue dépassée ou chantier actif > 6 mois sans fin
    let adminAlert = false;
    if (worksite.status === "active") {
      if (worksite.planned_end_date) {
        const endDate = new Date(worksite.planned_end_date);
        adminAlert = endDate < new Date();
      } else if (worksite.start_date) {
        const startDate = new Date(worksite.start_date);
        const monthsSince = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        adminAlert = monthsSince > 6;
      }
    }

    // Mettre à jour les alertes si elles ont changé
    if (
      worksite.has_budget_alert !== budgetAlert ||
      worksite.has_amendment_alert !== hasOldPending ||
      worksite.has_admin_alert !== adminAlert
    ) {
      await supabase
        .from("worksites")
        .update({
          has_budget_alert: budgetAlert,
          has_amendment_alert: hasOldPending,
          has_admin_alert: adminAlert,
        })
        .eq("id", worksite.id);
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

  const calculateMargin = (budget: string, costs: string) => {
    const budgetNum = parseFloat(budget) || 0;
    const costsNum = parseFloat(costs) || 0;
    const margin = budgetNum - costsNum;
    const percentage = budgetNum > 0 ? (margin / budgetNum) * 100 : 0;
    return { margin, percentage };
  };

  const getWorksiteAlerts = (worksite: Worksite): WorksiteAlert[] => {
    const alerts: WorksiteAlert[] = [];
    
    if (worksite.has_budget_alert) {
      const budget = parseFloat(worksite.budget_initial || "0");
      const costs = parseFloat(worksite.costs_committed || "0");
      const overrun = costs > budget ? costs - budget : 0;
      const percentage = budget > 0 ? (costs / budget) * 100 : 0;
      
      alerts.push({
        ...worksite,
        alertType: "budget",
        alertMessage: costs > budget 
          ? `Budget dépassé de ${overrun.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`
          : `${percentage.toFixed(0)}% du budget consommé`,
      });
    }
    
    if (worksite.has_amendment_alert) {
      alerts.push({
        ...worksite,
        alertType: "amendment",
        alertMessage: "Avenant(s) en attente depuis plus de 7 jours",
      });
    }
    
    if (worksite.has_admin_alert) {
      alerts.push({
        ...worksite,
        alertType: "admin",
        alertMessage: worksite.planned_end_date && new Date(worksite.planned_end_date) < new Date()
          ? "Date de fin prévue dépassée"
          : "Chantier actif depuis plus de 6 mois",
      });
    }
    
    return alerts;
  };

  const filteredWorksites = worksites.filter(worksite => {
    const matchesFilter = filter === "all" || worksite.profitability_status === filter;
    const matchesSearch = searchTerm === "" || 
      worksite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worksite.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worksite.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worksite.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const allAlerts = worksites.flatMap(w => getWorksiteAlerts(w));

  const stats = {
    total: worksites.length,
    profitable: worksites.filter(w => w.profitability_status === "profitable").length,
    watch: worksites.filter(w => w.profitability_status === "watch").length,
    atRisk: worksites.filter(w => w.profitability_status === "at_risk").length,
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Mes chantiers</h2>
          <p className="text-gray-400 text-sm">Vue d'ensemble de vos chantiers actifs</p>
        </div>
        <Link href="/dashboard/worksites/new">
          <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau chantier
          </Button>
        </Link>
      </div>

      {/* Actions requises - Alertes */}
      {allAlerts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30 rounded-lg border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Actions requises ({allAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAlerts.map((alert, index) => (
                <Link key={`${alert.id}-${alert.alertType}-${index}`} href={`/dashboard/worksites/${alert.id}`}>
                  <div className="flex items-start justify-between p-3 bg-[#2f343a] rounded-lg hover:bg-[#3a3f47] transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{alert.name}</h3>
                        <Badge className={
                          alert.alertType === "budget" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                          alert.alertType === "amendment" ? "bg-orange-500/20 text-orange-500 border-orange-500/30" :
                          "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                        }>
                          {alert.alertType === "budget" ? "Budget" :
                           alert.alertType === "amendment" ? "Avenant" :
                           "Admin"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300">{alert.alertMessage}</p>
                      {alert.clients?.name && (
                        <p className="text-xs text-gray-500 mt-1">Client: {alert.clients.name}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total</CardTitle>
            <Building2 className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-500">Chantiers actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Rentables</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#00ff88]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00ff88]">{stats.profitable}</div>
            <p className="text-xs text-gray-500">🟢 En bonne santé</p>
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">À surveiller</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.watch}</div>
            <p className="text-xs text-gray-500">🟠 Attention requise</p>
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">À risque</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.atRisk}</div>
            <p className="text-xs text-gray-500">🔴 Action urgente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un chantier..."
                className="w-full pl-9 pr-4 py-2 bg-[#2f343a] border border-[#3a3f47] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/20 focus:border-[#00ff88]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                className={filter === "all" ? "bg-[#00ff88] text-black" : "border-[#3a3f47] text-gray-300"}
                onClick={() => setFilter("all")}
              >
                Tous
              </Button>
              <Button
                variant={filter === "profitable" ? "default" : "outline"}
                size="sm"
                className={filter === "profitable" ? "bg-[#00ff88] text-black" : "border-[#3a3f47] text-gray-300"}
                onClick={() => setFilter("profitable")}
              >
                🟢 Rentables
              </Button>
              <Button
                variant={filter === "watch" ? "default" : "outline"}
                size="sm"
                className={filter === "watch" ? "bg-orange-500 text-white" : "border-[#3a3f47] text-gray-300"}
                onClick={() => setFilter("watch")}
              >
                🟠 À surveiller
              </Button>
              <Button
                variant={filter === "at_risk" ? "default" : "outline"}
                size="sm"
                className={filter === "at_risk" ? "bg-red-500 text-white" : "border-[#3a3f47] text-gray-300"}
                onClick={() => setFilter("at_risk")}
              >
                🔴 À risque
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worksites List */}
      {filteredWorksites.length === 0 ? (
        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun chantier</h3>
            <p className="text-gray-400 mb-6">Commencez par créer votre premier chantier</p>
            <Link href="/dashboard/worksites/new">
              <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
                <Plus className="mr-2 h-4 w-4" />
                Créer un chantier
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorksites.map((worksite) => {
            const { margin, percentage } = calculateMargin(
              worksite.budget_initial, 
              worksite.costs_committed
            );
            const hasAlerts = worksite.has_budget_alert || worksite.has_amendment_alert || worksite.has_admin_alert;
            
            return (
              <Link key={worksite.id} href={`/dashboard/worksites/${worksite.id}`}>
                <Card className="bg-[#262930] rounded-lg border-0 shadow-md hover:border-[#00ff88]/30 hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-white">{worksite.name}</h3>
                          <Badge className={getProfitabilityColor(worksite.profitability_status)}>
                            {getProfitabilityLabel(worksite.profitability_status)}
                          </Badge>
                          {hasAlerts && (
                            <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Alertes
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-400">
                            <span className="text-gray-500">Client:</span> {worksite.clients?.name || "Non renseigné"}
                          </p>
                          <p className="text-sm text-gray-400">
                            <span className="text-gray-500">Adresse:</span> {worksite.address}
                          </p>
                          {worksite.code && (
                            <p className="text-sm text-gray-400">
                              <span className="text-gray-500">Code:</span> {worksite.code}
                            </p>
                          )}
                        </div>

                        {/* Financial Summary */}
                        <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-[#3a3f47]">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Budget initial</p>
                            <p className="text-sm font-semibold text-white">
                              {parseFloat(worksite.budget_initial || "0").toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Coûts engagés</p>
                            <p className="text-sm font-semibold text-white">
                              {parseFloat(worksite.costs_committed || "0").toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Marge</p>
                            <p className={`text-sm font-semibold ${margin >= 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
                              {margin.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Marge %</p>
                            <p className={`text-sm font-semibold ${percentage >= 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
