import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PhoneIncoming, 
  Mail, 
  FileText, 
  CreditCard,
  ShoppingCart,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from "lucide-react";
import { 
  Line, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";

interface DashboardStats {
  revenue: number;
  pendingCalls: number;
  unreadMails: number;
  activeQuotes: number;
  pendingInvoices: number;
  activeTasks: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  desc: string;
  amount: string;
  time: string;
  status: string;
}

export default function Dashboard() {
  const { session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    pendingCalls: 0,
    unreadMails: 0,
    activeQuotes: 0,
    pendingInvoices: 0,
    activeTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    loadDashboardData();
  }, [session]);

  async function loadDashboardData() {
    if (!session?.user) return;
    
    setLoading(true);
    const userId = session.user.id;

    try {
      // Calcul du chiffre d'affaires (somme des factures payées)
      const { data: paidInvoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("amount")
        .eq("user_id", userId)
        .eq("status", "paid");

      const revenue = paidInvoices?.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;

      // Appels en attente (nouveau ou à rappeler)
      const { count: pendingCallsCount } = await supabase
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["new", "to_recall"]);

      // Mails non lus
      const { count: unreadMailsCount } = await supabase
        .from("mails")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)
        .eq("folder", "inbox");

      // Devis en cours (sent ou draft)
      const { count: activeQuotesCount } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["draft", "sent"]);

      // Factures impayées
      const { count: pendingInvoicesCount } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["pending", "overdue"]);

      // Tâches non terminées
      const { count: activeTasksCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", false);

      setStats({
        revenue,
        pendingCalls: pendingCallsCount || 0,
        unreadMails: unreadMailsCount || 0,
        activeQuotes: activeQuotesCount || 0,
        pendingInvoices: pendingInvoicesCount || 0,
        activeTasks: activeTasksCount || 0,
      });

      // Charger les données du graphique (4 dernières semaines)
      await loadChartData(userId);

      // Charger l'activité récente
      await loadRecentActivity(userId);

    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadChartData(userId: string) {
    // Calculer les 4 dernières semaines
    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: subWeeks(now, 3),
      end: now,
    });

    const chartDataPromises = weeks.map(async (weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const weekLabel = format(weekStart, "S1");

      const { data: invoices } = await supabase
        .from("invoices")
        .select("amount")
        .eq("user_id", userId)
        .eq("status", "paid")
        .gte("paid_at", weekStart.toISOString())
        .lte("paid_at", weekEnd.toISOString());

      const weekRevenue = invoices?.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;

      return { name: weekLabel, value: Math.round(weekRevenue) };
    });

    const chartData = await Promise.all(chartDataPromises);
    setChartData(chartData);
  }

  async function loadRecentActivity(userId: string) {
    const activities: RecentActivity[] = [];

    // Dernières factures payées
    const { data: recentInvoices } = await supabase
      .from("invoices")
      .select("invoice_number, client_name, amount, paid_at")
      .eq("user_id", userId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(2);

    recentInvoices?.forEach((inv) => {
      activities.push({
        id: inv.invoice_number,
        type: "invoice",
        title: `Facture ${inv.invoice_number} payée`,
        desc: inv.client_name,
        amount: `+ ${parseFloat(inv.amount.toString()).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`,
        time: format(new Date(inv.paid_at), "Il y a H'h'"),
        status: "success",
      });
    });

    // Appels à rappeler récents
    const { data: callsToRecall } = await supabase
      .from("calls")
      .select("client_name, reason, created_at")
      .eq("user_id", userId)
      .eq("status", "to_recall")
      .order("created_at", { ascending: false })
      .limit(1);

    callsToRecall?.forEach((call) => {
      activities.push({
        id: call.client_name,
        type: "call",
        title: "Appel à rappeler",
        desc: `${call.client_name} - ${call.reason || ""}`,
        amount: "",
        time: format(new Date(call.created_at), "Il y a H'h'"),
        status: "danger",
      });
    });

    // Mails récents non lus
    const { data: recentMails } = await supabase
      .from("mails")
      .select("sender, subject, created_at")
      .eq("user_id", userId)
      .eq("read", false)
      .eq("folder", "inbox")
      .order("created_at", { ascending: false })
      .limit(1);

    recentMails?.forEach((mail) => {
      activities.push({
        id: mail.sender,
        type: "mail",
        title: "Nouveau mail",
        desc: mail.sender,
        amount: "",
        time: format(new Date(mail.created_at), "Il y a H'h'"),
        status: "warning",
      });
    });

    // Trier par date et prendre les 4 plus récents
    activities.sort((a, b) => {
      const timeA = parseInt(a.time.match(/\d+/)?.[0] || "0");
      const timeB = parseInt(b.time.match(/\d+/)?.[0] || "0");
      return timeA - timeB;
    });

    setRecentActivity(activities.slice(0, 4));
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
          <p className="text-gray-400 text-sm">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Chiffre d'affaires", 
            value: formatCurrency(stats.revenue), 
            change: "Total factures payées", 
            changeType: "neutral" as const,
            icon: CreditCard, 
            color: "#00ff88"
          },
          { 
            title: "Appels en attente", 
            value: stats.pendingCalls.toString(), 
            change: "À traiter", 
            changeType: "neutral" as const,
            icon: PhoneIncoming, 
            color: "#ff6b6b"
          },
          { 
            title: "Mails non lus", 
            value: stats.unreadMails.toString(), 
            change: "Dans la boîte de réception", 
            changeType: "neutral" as const,
            icon: Mail, 
            color: "#4dabf7"
          },
          { 
            title: "Devis en cours", 
            value: stats.activeQuotes.toString(), 
            change: "À suivre", 
            changeType: "neutral" as const,
            icon: FileText, 
            color: "#9775fa"
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart Card */}
        <Card className="lg:col-span-2 bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Évolution du chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3f47" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `${value}€`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#262930',
                        border: '1px solid #3a3f47',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00ff88" 
                      strokeWidth={3}
                      dot={{ fill: '#00ff88', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-[#3a3f47] last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {item.amount && (
                        <span className={`text-sm font-semibold ${item.amount.startsWith('+') ? 'text-[#00ff88]' : 'text-red-500'}`}>
                          {item.amount}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 text-center py-4">Aucune activité récente</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: FileText, label: "Nouveau devis", color: "#9775fa" },
                { icon: ShoppingCart, label: "Nouvelle commande", color: "#4dabf7" },
                { icon: CheckSquare, label: "Nouvelle tâche", color: "#00ff88" },
                { icon: PhoneIncoming, label: "Enregistrer un appel", color: "#ff6b6b" },
              ].map((action, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#2f343a] transition-colors text-left"
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${action.color}15` }}>
                    <action.icon className="h-5 w-5" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card className="lg:col-span-2 bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Éléments en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#2f343a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <PhoneIncoming className="h-5 w-5 text-[#ff6b6b]" />
                    <span className="text-sm font-medium text-gray-300">Appels à traiter</span>
                  </div>
                  <span className="text-lg font-bold text-white">{stats.pendingCalls}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2f343a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#4dabf7]" />
                    <span className="text-sm font-medium text-gray-300">Mails non lus</span>
                  </div>
                  <span className="text-lg font-bold text-white">{stats.unreadMails}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#2f343a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#9775fa]" />
                    <span className="text-sm font-medium text-gray-300">Factures impayées</span>
                  </div>
                  <span className="text-lg font-bold text-white">{stats.pendingInvoices}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2f343a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-[#00ff88]" />
                    <span className="text-sm font-medium text-gray-300">Tâches en cours</span>
                  </div>
                  <span className="text-lg font-bold text-white">{stats.activeTasks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
