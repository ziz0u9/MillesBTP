import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, Truck, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLogs } from "@/lib/LogContext";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";

interface Order {
  id: string;
  order_number: string;
  supplier: string;
  items: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string | null;
}

export default function Orders() {
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) loadOrders();
  }, [session]);

  async function loadOrders() {
    if (!session?.user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les commandes", variant: "destructive" });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const form = new FormData(e.currentTarget);
    const order_number = form.get("order_number") as string;
    const supplier = form.get("supplier") as string;
    const items = form.get("items") as string;
    const amount = parseFloat((form.get("amount") as string) || "0");
    const status = (form.get("status") as Order["status"]) || "pending";
    const date = form.get("date") as string;

    const { data, error } = await supabase
      .from("orders")
      .insert({ user_id: session.user.id, order_number, supplier, items, amount, status, date })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    addLog("Commande", `Créée ${order_number}`);
    toast({ title: "Commande créée", description: "La commande a été ajoutée." });
    setOpen(false);
    e.currentTarget.reset();
    // Recharger les données pour être sûr
    await loadOrders();
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "delivered": return <CheckCircle className="h-5 w-5 text-[#00ff88]" />;
      case "shipped": return <Truck className="h-5 w-5 text-[#4dabf7]" />;
      case "processing": return <Clock className="h-5 w-5 text-orange-500" />;
      case "pending": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "delivered": return <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">Livrée</Badge>;
      case "shipped": return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Expédiée</Badge>;
      case "processing": return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">En traitement</Badge>;
      case "pending": return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">En attente</Badge>;
      default: return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier.toLowerCase().includes(search.toLowerCase()) ||
    o.items.toLowerCase().includes(search.toLowerCase())
  );

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Commandes</h2>
          <p className="text-gray-400 text-sm">Suivi des commandes fournisseurs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle commande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#262930] border-[#3a3f47]">
            <DialogHeader>
              <DialogTitle className="text-white">Nouvelle commande</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créez une nouvelle commande fournisseur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order_number" className="text-right text-gray-300">N°</Label>
                <Input id="order_number" name="order_number" placeholder="CMD-0001" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right text-gray-300">Fournisseur</Label>
                <Input id="supplier" name="supplier" placeholder="Nom du fournisseur" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="items" className="text-right text-gray-300">Articles</Label>
                <Input id="items" name="items" placeholder="Description" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-gray-300">Montant (€)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right text-gray-300">Statut</Label>
                <select id="status" name="status" className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white">
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right text-gray-300">Date</Label>
                <Input id="date" name="date" type="date" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Liste des commandes</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aucune commande</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[#2f343a]">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">{order.order_number}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm font-medium text-gray-300">{order.supplier}</div>
                    <div className="text-sm text-gray-400 mt-1">{order.items}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{formatAmount(order.amount)}</div>
                    <div className="text-xs text-gray-400">{order.date ? order.date : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
