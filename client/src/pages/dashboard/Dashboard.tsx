import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  ArrowUpRight, 
  PhoneIncoming, 
  Mail, 
  FileText, 
  CreditCard,
  MoreHorizontal
} from "lucide-react";

const data = [
  { name: "Jan", total: 1200 },
  { name: "Fév", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Avr", total: 3200 },
  { name: "Mai", total: 2800 },
  { name: "Juin", total: 4500 },
  { name: "Juil", total: 3800 },
];

const recentActivity = [
  {
    id: 1,
    type: "invoice",
    title: "Facture #4928 payée",
    desc: "Rénovation Villa K.",
    amount: "+ 4,200.00€",
    time: "Il y a 2h",
    status: "success",
  },
  {
    id: 2,
    type: "call",
    title: "Appel manqué",
    desc: "M. Martin - Chantier rue de la Paix",
    amount: "",
    time: "Il y a 4h",
    status: "danger",
  },
  {
    id: 3,
    type: "mail",
    title: "Nouveau devis demandé",
    desc: "Agence Immo Plus",
    amount: "",
    time: "Il y a 6h",
    status: "warning",
  },
  {
    id: 4,
    type: "order",
    title: "Commande matériaux reçue",
    desc: "Point P - Commande #9921",
    amount: "- 850.00€",
    time: "Hier",
    status: "neutral",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">Télécharger le rapport</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">Nouvelle action</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Chiffre d'affaires", value: "45,231.89€", change: "+20.1% ce mois", icon: CreditCard, color: "text-white" },
          { title: "Appels en attente", value: "12", change: "+4 depuis hier", icon: PhoneIncoming, color: "text-orange-500" },
          { title: "Mails non lus", value: "5", change: "-2 depuis hier", icon: Mail, color: "text-blue-500" },
          { title: "Devis en cours", value: "8", change: "2 à relancer", icon: FileText, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-white/5 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle>Evolution du CA</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}€`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-card border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.amount && (
                      <span className={`text-sm font-medium ${item.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {item.amount}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
