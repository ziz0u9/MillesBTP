import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const orders = [
  { id: "CMD-9921", supplier: "Point P", items: "Planches de chêne (x50), Vis (x200)", amount: "850.00€", status: "delivered", date: "12/05/2024" },
  { id: "CMD-9922", supplier: "Rexel", items: "Câbles électriques 100m, Prises (x20)", amount: "420.00€", status: "shipped", date: "14/05/2024" },
  { id: "CMD-9923", supplier: "La Plateforme", items: "Peinture Blanche 10L (x5)", amount: "350.00€", status: "processing", date: "15/05/2024" },
  { id: "CMD-9924", supplier: "Würth", items: "Outillage divers", amount: "1,200.00€", status: "pending", date: "15/05/2024" },
];

export default function Orders() {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "delivered": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "shipped": return <Truck className="h-5 w-5 text-blue-500" />;
      case "processing": return <Clock className="h-5 w-5 text-orange-500" />;
      case "pending": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "delivered": return "Livrée";
      case "shipped": return "Expédiée";
      case "processing": return "En préparation";
      case "pending": return "En attente";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight">Suivi des commandes</h2>
          <p className="text-muted-foreground">Suivez vos approvisionnements et livraisons fournisseurs.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une commande..." 
            className="pl-9 bg-background/50 border-white/10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="bg-card/50 border-white/5 hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                {order.supplier}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {order.date}
                {getStatusIcon(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{order.amount}</div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {order.items}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                <Badge variant="outline" className="bg-background/50">
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add new card placeholder */}
        <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors h-full min-h-[180px]">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <span className="font-medium">Passer une commande</span>
        </button>
      </div>
    </div>
  );
}
