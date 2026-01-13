import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Building, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Client {
  id: string;
  type: "individual" | "company";
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  projects_count: number;
  status: "active" | "inactive";
}

export default function Clients() {
  const { session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) {
      loadClients();
    }
  }, [session]);

  async function loadClients() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des clients:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const type = formData.get("type") as "individual" | "company";
    const contact = formData.get("contact") as string;

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: session.user.id,
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          type,
          contact: contact || null,
          status: "active",
          projects_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setOpen(false);
      toast({
        title: "Client créé",
        description: "Le nouveau client a été ajouté.",
      });
      addLog("Nouveau Client", `Client ${name} créé`);
      e.currentTarget.reset();
      // Recharger les données
      await loadClients();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le client.",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Clients</h2>
          <p className="text-gray-400 text-sm">Gestion de votre portefeuille clients</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#262930] border-[#3a3f47]">
            <DialogHeader>
              <DialogTitle className="text-white">Nouveau client</DialogTitle>
              <DialogDescription className="text-gray-400">
                Ajoutez un nouveau client à votre portefeuille.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right text-gray-300">Type</Label>
                <select id="type" name="type" className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white" required>
                  <option value="individual">Particulier</option>
                  <option value="company">Entreprise</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-gray-300">Nom</Label>
                <Input id="name" name="name" placeholder="Nom du client" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right text-gray-300">Contact</Label>
                <Input id="contact" name="contact" placeholder="Nom du contact" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-gray-300">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@exemple.com" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right text-gray-300">Téléphone</Label>
                <Input id="phone" name="phone" placeholder="06..." className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right text-gray-300">Adresse</Label>
                <Input id="address" name="address" placeholder="Adresse complète" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
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
            <CardTitle className="text-lg font-semibold text-white">Liste des clients</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aucun client</div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                >
                  <Avatar className="h-12 w-12 border-2 border-[#3a3f47]">
                    <AvatarFallback className="bg-[#00ff88]/20 text-[#00ff88] font-bold">
                      {client.type === "company" ? (
                        <Building className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">{client.name}</span>
                      {client.type === "company" && (
                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs">Entreprise</Badge>
                      )}
                      {client.status === "active" ? (
                        <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">Actif</Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Inactif</Badge>
                      )}
                    </div>
                    {client.contact && (
                      <div className="text-sm text-gray-300 mb-1">{client.contact}</div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{client.projects_count}</div>
                    <div className="text-xs text-gray-400">Projets</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#262930] border-[#3a3f47]">
                      <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Voir les projets</DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Modifier</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#3a3f47]" />
                      <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Créer un devis</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
