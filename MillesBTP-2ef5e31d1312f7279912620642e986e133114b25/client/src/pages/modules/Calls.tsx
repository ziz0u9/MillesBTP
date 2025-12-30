import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Search, Plus, PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreHorizontal } from "lucide-react";
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
import { format } from "date-fns";

interface Call {
  id: string;
  type: "incoming" | "outgoing" | "missed";
  contact: string;
  phone: string;
  subject: string | null;
  status: "pending" | "processed" | "missed";
  created_at: string;
}

export default function Calls() {
  const { session } = useSession();
  const [calls, setCalls] = useState<Call[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) {
      loadCalls();
    }
  }, [session]);

  async function loadCalls() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des appels:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les appels.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCall = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const contact = formData.get("contact") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const type = formData.get("type") as "incoming" | "outgoing" | "missed";

    try {
      const { data, error } = await supabase
        .from("calls")
        .insert({
          user_id: session.user.id,
          contact,
          phone,
          subject: subject || null,
          type: type || "incoming",
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setOpen(false);
      toast({
        title: "Appel enregistré",
        description: "Le nouvel appel a été ajouté à la liste.",
      });
      addLog("Nouvel Appel", `Appel enregistré pour ${contact}`);
      
      // Reset form
      e.currentTarget.reset();
      // Recharger les données
      await loadCalls();
    } catch (error: any) {
      console.error("Erreur lors de la création de l'appel:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer l'appel.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (callId: string, newStatus: "pending" | "processed" | "missed") => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("calls")
        .update({ status: newStatus })
        .eq("id", callId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setCalls(calls.map(call => call.id === callId ? { ...call, status: newStatus } : call));
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'appel a été modifié.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "processed": return <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">Traité</Badge>;
      case "pending": return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">En attente</Badge>;
      case "missed": return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Manqué</Badge>;
      default: return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "incoming": return <PhoneIncoming className="h-5 w-5 text-[#4dabf7]" />;
      case "outgoing": return <PhoneOutgoing className="h-5 w-5 text-[#00ff88]" />;
      case "missed": return <PhoneMissed className="h-5 w-5 text-red-500" />;
      default: return <Phone className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (hours < 48) return "Hier";
    return format(date, "dd/MM/yyyy");
  };

  const filteredCalls = calls.filter(call =>
    (call.contact && call.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (call.phone && call.phone.includes(searchTerm)) ||
    (call.subject && call.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Appels</h2>
          <p className="text-gray-400 text-sm">Gestion de votre standard téléphonique</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel appel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#262930] border-[#3a3f47]">
            <DialogHeader>
              <DialogTitle className="text-white">Enregistrer un appel</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créez une fiche pour un appel entrant ou sortant.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCall} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right text-gray-300">Type</Label>
                <select id="type" name="type" className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white" required>
                  <option value="incoming">Entrant</option>
                  <option value="outgoing">Sortant</option>
                  <option value="missed">Manqué</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right text-gray-300">
                  Contact
                </Label>
                <Input id="contact" name="contact" placeholder="Nom du contact" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right text-gray-300">
                  Téléphone
                </Label>
                <Input id="phone" name="phone" placeholder="06..." className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right text-gray-300">
                  Sujet
                </Label>
                <Input id="subject" name="subject" placeholder="Objet de l'appel" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher un numéro ou un nom..." 
                className="pl-9 bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-[#3a3f47] text-gray-300 hover:bg-[#2f343a]"
                onClick={() => setSearchTerm("")}
              >
                Tous
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSearchTerm("missed")}
              >
                Manqués
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSearchTerm("pending")}
              >
                À traiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calls List */}
      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Liste des appels</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aucun appel enregistré</div>
          ) : (
            <div className="space-y-3">
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[#2f343a]">
                    {getIcon(call.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white">{call.contact}</span>
                      {getStatusBadge(call.status)}
                    </div>
                    <div className="text-sm text-gray-400">{call.phone}</div>
                    {call.subject && (
                      <div className="text-sm text-gray-300 mt-1">{call.subject}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{formatDate(call.created_at)}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#262930] border-[#3a3f47]">
                      <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                      {call.status === "pending" && (
                        <DropdownMenuItem 
                          className="text-gray-300 hover:bg-[#2f343a] hover:text-white"
                          onClick={() => handleUpdateStatus(call.id, "processed")}
                        >
                          Marquer comme traité
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">
                        Créer un contact
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#3a3f47]" />
                      <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">
                        Supprimer
                      </DropdownMenuItem>
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
