import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Search, Plus, PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreHorizontal, Edit2, Trash2, UserPlus, ShoppingCart, CheckSquare, FileText } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLogs } from "@/lib/LogContext";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

type CallStatus = "new" | "to_recall" | "in_progress" | "processed" | "closed";
type CallType = "incoming" | "outgoing" | "missed";

interface Call {
  id: string;
  type: CallType;
  client_name: string;
  phone: string;
  reason: string | null;
  status: CallStatus;
  notes: string | null;
  assigned_user_id: string | null;
  call_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function Calls() {
  const { session } = useSession();
  const [calls, setCalls] = useState<Call[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CallStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) {
      loadCalls();
    }
  }, [session, statusFilter, dateFilter]);

  async function loadCalls() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("calls")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      // Filtre par statut
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Filtre par date
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;

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
    const clientName = formData.get("client_name") as string;
    const phone = formData.get("phone") as string;
    const reason = formData.get("reason") as string;
    const notes = formData.get("notes") as string;
    const type = formData.get("type") as CallType;
    const callDate = formData.get("call_date") as string;

    try {
      const callData: any = {
        user_id: session.user.id,
        client_name: clientName,
        phone,
        reason: reason || null,
        notes: notes || null,
        type: type || "incoming",
        status: "new" as CallStatus,
      };

      if (callDate) {
        callData.call_date = new Date(callDate).toISOString();
      }

      const { data, error } = await supabase
        .from("calls")
        .insert(callData)
        .select()
        .single();

      if (error) throw error;

      // Réinitialiser le formulaire AVANT de fermer le dialog
      e.currentTarget.reset();
      
      setOpenCreate(false);
      toast({
        title: "Appel enregistré",
        description: "Le nouvel appel a été ajouté à la liste.",
      });
      
      const typeLabels: Record<CallType, string> = {
        incoming: "entrant",
        outgoing: "sortant",
        missed: "manqué"
      };
      addLog("Nouvel Appel", `Appel ${typeLabels[type || "incoming"]} enregistré pour ${clientName} (${phone})`);
      
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

  const handleEditCall = (call: Call) => {
    setEditingCall(call);
    setOpenEdit(true);
  };

  const handleUpdateCall = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !editingCall) return;

    const formData = new FormData(e.currentTarget);
    const clientName = formData.get("client_name") as string;
    const phone = formData.get("phone") as string;
    const reason = formData.get("reason") as string;
    const notes = formData.get("notes") as string;
    const status = formData.get("status") as CallStatus;
    const type = formData.get("type") as CallType;
    const callDate = formData.get("call_date") as string;

    try {
      const updateData: any = {
        client_name: clientName,
        phone,
        reason: reason || null,
        notes: notes || null,
        status,
        type,
        updated_at: new Date().toISOString(),
      };

      if (callDate) {
        updateData.call_date = new Date(callDate).toISOString();
      }

      const { error } = await supabase
        .from("calls")
        .update(updateData)
        .eq("id", editingCall.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setOpenEdit(false);
      setEditingCall(null);
      toast({
        title: "Appel modifié",
        description: "L'appel a été mis à jour avec succès.",
      });
      
      addLog("Modification Appel", `Appel de ${clientName} (${phone}) modifié`);
      await loadCalls();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'appel.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (callId: string, newStatus: CallStatus) => {
    if (!session?.user) return;

    const call = calls.find(c => c.id === callId);
    if (!call) return;

    try {
      const { error } = await supabase
        .from("calls")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", callId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      const statusLabels: Record<CallStatus, string> = {
        new: "Nouveau",
        to_recall: "À rappeler",
        in_progress: "En cours",
        processed: "Traité",
        closed: "Clos"
      };

      toast({
        title: "Statut mis à jour",
        description: `Le statut a été changé en "${statusLabels[newStatus]}".`,
      });
      
      addLog("Modification Appel", `Statut de l'appel ${call.client_name} (${call.phone}) changé en "${statusLabels[newStatus]}"`);
      await loadCalls();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCall = async (callId: string) => {
    if (!session?.user) return;

    const call = calls.find(c => c.id === callId);
    if (!call) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'appel de ${call.client_name} ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("calls")
        .delete()
        .eq("id", callId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast({
        title: "Appel supprimé",
        description: "L'appel a été supprimé avec succès.",
      });
      
      addLog("Suppression Appel", `Appel de ${call.client_name} (${call.phone}) supprimé`);
      await loadCalls();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'appel.",
        variant: "destructive",
      });
    }
  };

  const handleCreateClient = async (call: Call) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("clients")
        .insert({
          user_id: session.user.id,
          name: call.client_name,
          phone: call.phone,
          type: "individual",
          status: "active",
          projects_count: 0,
        });

      if (error) throw error;

      toast({
        title: "Client créé",
        description: `Le client ${call.client_name} a été créé avec succès.`,
      });
      
      addLog("Nouveau Client", `Client ${call.client_name} créé depuis un appel`);
    } catch (error: any) {
      console.error("Erreur lors de la création du client:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le client.",
        variant: "destructive",
      });
    }
  };

  const handleCreateOrder = async (call: Call) => {
    if (!session?.user) return;

    const orderNumber = `CMD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    try {
      const { error } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          order_number: orderNumber,
          supplier: call.client_name,
          items: call.reason || "Commande créée depuis un appel",
          amount: 0,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Commande créée",
        description: `La commande ${orderNumber} a été créée avec succès.`,
      });
      
      addLog("Commande", `Commande ${orderNumber} créée depuis un appel`);
    } catch (error: any) {
      console.error("Erreur lors de la création de la commande:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la commande.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (call: Call) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          user_id: session.user.id,
          title: `Rappeler ${call.client_name} - ${call.reason || "Appel"}`,
          description: `Tâche créée depuis un appel. Numéro: ${call.phone}`,
          tag: "Admin",
          completed: false,
          priority: "medium",
        });

      if (error) throw error;

      toast({
        title: "Tâche créée",
        description: "La tâche a été créée avec succès.",
      });
      
      addLog("Nouvelle Tâche", `Tâche créée depuis un appel pour ${call.client_name}`);
    } catch (error: any) {
      console.error("Erreur lors de la création de la tâche:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la tâche.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: CallStatus) => {
    const statusConfig: Record<CallStatus, { label: string; className: string }> = {
      new: { label: "Nouveau", className: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
      to_recall: { label: "À rappeler", className: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
      in_progress: { label: "En cours", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
      processed: { label: "Traité", className: "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30" },
      closed: { label: "Clos", className: "bg-gray-500/20 text-gray-500 border-gray-500/30" },
    };

    const config = statusConfig[status] || statusConfig.new;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getIcon = (type: CallType) => {
    switch(type) {
      case "incoming": return <PhoneIncoming className="h-5 w-5 text-[#4dabf7]" />;
      case "outgoing": return <PhoneOutgoing className="h-5 w-5 text-[#00ff88]" />;
      case "missed": return <PhoneMissed className="h-5 w-5 text-red-500" />;
      default: return <Phone className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    return format(date, "dd/MM/yyyy HH:mm");
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phone.includes(searchTerm) ||
      (call.reason && call.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Appels</h2>
          <p className="text-gray-400 text-sm">Centraliser, suivre et traiter tous les appels clients</p>
        </div>
        
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel appel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#262930] border-[#3a3f47] max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="client_name" className="text-right text-gray-300">Client</Label>
                <Input id="client_name" name="client_name" placeholder="Nom du client" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right text-gray-300">Téléphone</Label>
                <Input id="phone" name="phone" placeholder="06..." className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="call_date" className="text-right text-gray-300">Date/Heure</Label>
                <Input id="call_date" name="call_date" type="datetime-local" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right text-gray-300">Motif</Label>
                <Input id="reason" name="reason" placeholder="Raison de l'appel" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right text-gray-300 pt-2">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Notes supplémentaires..." className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white min-h-[100px]" />
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher un numéro ou un nom..." 
                className="pl-9 bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CallStatus | "all")}>
              <SelectTrigger className="w-[180px] bg-[#2f343a] border-[#3a3f47] text-white">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent className="bg-[#262930] border-[#3a3f47]">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="to_recall">À rappeler</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="processed">Traité</SelectItem>
                <SelectItem value="closed">Clos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px] bg-[#2f343a] border-[#3a3f47] text-white">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent className="bg-[#262930] border-[#3a3f47]">
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calls List */}
      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Liste des appels ({filteredCalls.length})
          </CardTitle>
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
                  className="flex items-start gap-4 p-4 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[#2f343a] mt-1">
                    {getIcon(call.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-medium text-white">{call.client_name}</span>
                      {getStatusBadge(call.status)}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{call.phone}</div>
                    {call.reason && (
                      <div className="text-sm text-gray-300 mb-1">{call.reason}</div>
                    )}
                    {call.notes && (
                      <div className="text-sm text-gray-400 italic mt-2 p-2 bg-[#1f2329] rounded border border-[#3a3f47]">
                        {call.notes}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(call.call_date || call.created_at)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#262930] border-[#3a3f47] w-56">
                      <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#3a3f47]" />
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleEditCall(call)}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleUpdateStatus(call.id, "to_recall")}
                      >
                        Marquer à rappeler
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleUpdateStatus(call.id, "in_progress")}
                      >
                        Marquer en cours
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleUpdateStatus(call.id, "processed")}
                      >
                        Marquer comme traité
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleUpdateStatus(call.id, "closed")}
                      >
                        Fermer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#3a3f47]" />
                      <DropdownMenuLabel className="text-gray-300">Créer depuis cet appel</DropdownMenuLabel>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleCreateClient(call)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Créer un client
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleCreateOrder(call)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Créer une commande
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-300 hover:bg-[#2f343a] hover:text-white cursor-pointer"
                        onClick={() => handleCreateTask(call)}
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Créer une tâche
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#3a3f47]" />
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        onClick={() => handleDeleteCall(call.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px] bg-[#262930] border-[#3a3f47] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier l'appel</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les informations de l'appel.
            </DialogDescription>
          </DialogHeader>
          {editingCall && (
            <form onSubmit={handleUpdateCall} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_type" className="text-right text-gray-300">Type</Label>
                <select id="edit_type" name="type" defaultValue={editingCall.type} className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white" required>
                  <option value="incoming">Entrant</option>
                  <option value="outgoing">Sortant</option>
                  <option value="missed">Manqué</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_client_name" className="text-right text-gray-300">Client</Label>
                <Input id="edit_client_name" name="client_name" defaultValue={editingCall.client_name} className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_phone" className="text-right text-gray-300">Téléphone</Label>
                <Input id="edit_phone" name="phone" defaultValue={editingCall.phone} className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_call_date" className="text-right text-gray-300">Date/Heure</Label>
                <Input 
                  id="edit_call_date" 
                  name="call_date" 
                  type="datetime-local" 
                  defaultValue={editingCall.call_date ? format(new Date(editingCall.call_date), "yyyy-MM-dd'T'HH:mm") : ""}
                  className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_reason" className="text-right text-gray-300">Motif</Label>
                <Input id="edit_reason" name="reason" defaultValue={editingCall.reason || ""} className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_status" className="text-right text-gray-300">Statut</Label>
                <select id="edit_status" name="status" defaultValue={editingCall.status} className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white" required>
                  <option value="new">Nouveau</option>
                  <option value="to_recall">À rappeler</option>
                  <option value="in_progress">En cours</option>
                  <option value="processed">Traité</option>
                  <option value="closed">Clos</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit_notes" className="text-right text-gray-300 pt-2">Notes</Label>
                <Textarea id="edit_notes" name="notes" defaultValue={editingCall.notes || ""} className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white min-h-[100px]" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} className="border-[#3a3f47] text-gray-300">
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">Enregistrer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
