import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Plus, MoreHorizontal, Download, Send } from "lucide-react";
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

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  status: "draft" | "pending" | "paid" | "overdue";
  date: string | null;
  due_date: string | null;
  paid_at: string | null;
}

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  date: string | null;
  valid_until: string | null;
}

export default function Invoices() {
  const { session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentType, setDocumentType] = useState<"invoice" | "quote">("invoice");
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) {
      loadInvoices();
      loadQuotes();
    }
  }, [session]);

  async function loadInvoices() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des factures:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadQuotes() {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des devis:", error);
    }
  }

  const handleCreateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const clientName = formData.get("client") as string;
    const type = formData.get("type") as string;

    try {
      if (type === "Facture") {
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
        const { data, error } = await supabase
          .from("invoices")
          .insert({
            user_id: session.user.id,
            invoice_number: invoiceNumber,
            client_name: clientName,
            amount: 0,
            status: "draft",
          })
          .select()
          .single();

        if (error) throw error;
        addLog("Nouvelle Facture", `Facture ${invoiceNumber} créée pour ${clientName}`);
        await loadInvoices();
      } else {
        const quoteNumber = `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;
        const { data, error } = await supabase
          .from("quotes")
          .insert({
            user_id: session.user.id,
            quote_number: quoteNumber,
            client_name: clientName,
            amount: 0,
            status: "draft",
          })
          .select()
          .single();

        if (error) throw error;
        addLog("Nouveau Devis", `Devis ${quoteNumber} créé pour ${clientName}`);
        await loadQuotes();
      }

      setOpen(false);
      toast({
        title: "Document créé",
        description: "Le document a été créé avec succès.",
      });
      e.currentTarget.reset();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le document.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, type: "invoice" | "quote") => {
    if (!session?.user) return;

    try {
      const table = type === "invoice" ? "invoices" : "quotes";
      const updateData: any = { status: newStatus };
      
      if (type === "invoice" && newStatus === "paid") {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      if (type === "invoice") {
        setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus as any, paid_at: updateData.paid_at || inv.paid_at } : inv));
      } else {
        setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
      }

      toast({
        title: "Statut mis à jour",
        description: "Le statut a été modifié.",
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid": return <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">Payée</Badge>;
      case "pending": return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">En attente</Badge>;
      case "overdue": return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Impayée</Badge>;
      case "draft": return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Brouillon</Badge>;
      case "sent": return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Envoyé</Badge>;
      case "accepted": return <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">Accepté</Badge>;
      case "rejected": return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Refusé</Badge>;
      case "expired": return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Expiré</Badge>;
      default: return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuotes = quotes.filter(q =>
    q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Facturation</h2>
          <p className="text-gray-400 text-sm">Gestion des devis et factures</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#262930] border-[#3a3f47]">
            <DialogHeader>
              <DialogTitle className="text-white">Créer un document</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créez un nouveau devis ou une nouvelle facture.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDocument} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right text-gray-300">Type</Label>
                <select 
                  id="type" 
                  name="type" 
                  className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white" 
                  required
                  onChange={(e) => setDocumentType(e.target.value === "Facture" ? "invoice" : "quote")}
                >
                  <option>Devis</option>
                  <option>Facture</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right text-gray-300">Client</Label>
                <Input id="client" name="client" placeholder="Nom du client" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="bg-[#262930] rounded-lg p-1 border-[#3a3f47]">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Factures</TabsTrigger>
          <TabsTrigger value="quotes" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Devis</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Factures</CardTitle>
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
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Aucune facture</div>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                    >
                      <FileText className="h-5 w-5 text-[#9775fa]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-white">{invoice.invoice_number}</span>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="text-sm text-gray-300">{invoice.client_name}</div>
                        {invoice.due_date && (
                          <div className="text-xs text-gray-400">Échéance: {formatDate(invoice.due_date)}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(invoice.amount)}</div>
                        {invoice.date && (
                          <div className="text-xs text-gray-400">{formatDate(invoice.date)}</div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#262930] border-[#3a3f47]">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          {invoice.status !== "paid" && (
                            <DropdownMenuItem 
                              className="text-gray-300 hover:bg-[#2f343a] hover:text-white"
                              onClick={() => handleUpdateStatus(invoice.id, "paid", "invoice")}
                            >
                              Marquer comme payée
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">
                            <Download className="mr-2 h-4 w-4" /> Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">
                            <Send className="mr-2 h-4 w-4" /> Envoyer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#3a3f47]" />
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Modifier</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Devis</CardTitle>
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
              ) : filteredQuotes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Aucun devis</div>
              ) : (
                <div className="space-y-3">
                  {filteredQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                    >
                      <FileText className="h-5 w-5 text-[#4dabf7]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-white">{quote.quote_number}</span>
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="text-sm text-gray-300">{quote.client_name}</div>
                        {quote.valid_until && (
                          <div className="text-xs text-gray-400">Valable jusqu'au: {formatDate(quote.valid_until)}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(quote.amount)}</div>
                        {quote.date && (
                          <div className="text-xs text-gray-400">{formatDate(quote.date)}</div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#262930] border-[#3a3f47]">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">
                            <Download className="mr-2 h-4 w-4" /> Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">
                            <Send className="mr-2 h-4 w-4" /> Envoyer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#3a3f47]" />
                          <DropdownMenuItem className="text-gray-300 hover:bg-[#2f343a] hover:text-white">Convertir en facture</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
