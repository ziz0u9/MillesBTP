import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const initialInvoices = [
  { id: "FAC-2024-001", client: "M. Martin", date: "12/05/2024", amount: "4,200.00€", status: "paid", dueDate: "12/06/2024" },
  { id: "FAC-2024-002", client: "Agence Immo Plus", date: "15/05/2024", amount: "1,850.50€", status: "pending", dueDate: "15/06/2024" },
  { id: "FAC-2024-003", client: "SARL Batipro", date: "18/05/2024", amount: "12,400.00€", status: "overdue", dueDate: "01/05/2024" },
];

const initialQuotes = [
  { id: "DEV-2024-045", client: "Mme Dubois", date: "20/05/2024", amount: "8,500.00€", status: "draft", validUntil: "20/06/2024" },
  { id: "DEV-2024-046", client: "Copropriété Les Lilas", date: "22/05/2024", amount: "24,000.00€", status: "sent", validUntil: "22/06/2024" },
];

export default function Invoices() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLogs();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast({
      title: "Document créé",
      description: "Le nouveau document a été généré avec succès.",
    });
    addLog("Création Document", "Nouveau devis/facture créé");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid": return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20">Payée</Badge>;
      case "pending": return <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/20">En attente</Badge>;
      case "overdue": return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20">En retard</Badge>;
      case "draft": return <Badge variant="secondary">Brouillon</Badge>;
      case "sent": return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/20">Envoyé</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight">Facturation</h2>
          <p className="text-muted-foreground">Gérez vos devis et factures en un seul endroit.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Exporter</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Créer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouveau document</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle facture ou un nouveau devis.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <select className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Facture</option>
                    <option>Devis</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Input id="client" placeholder="Nom du client" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Montant
                  </Label>
                  <Input id="amount" placeholder="0.00€" className="col-span-3" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Générer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="quotes">Devis</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-white/5 mt-6 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un client ou un n°..." 
              className="pl-9 bg-background/50 border-white/10"
            />
          </div>
        </div>

        <TabsContent value="invoices">
          <div className="rounded-md border border-white/5 bg-card/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-white/5 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium font-mono">{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                    <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Télécharger PDF</DropdownMenuItem>
                          <DropdownMenuItem><Send className="mr-2 h-4 w-4" /> Envoyer par email</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Annuler</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="quotes">
          <div className="rounded-md border border-white/5 bg-card/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialQuotes.map((quote) => (
                  <TableRow key={quote.id} className="border-white/5 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium font-mono">{quote.id}</TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell className="text-muted-foreground">{quote.date}</TableCell>
                    <TableCell className="text-muted-foreground">{quote.validUntil}</TableCell>
                    <TableCell className="text-right font-medium">{quote.amount}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Convertir en facture</DropdownMenuItem>
                          <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Télécharger PDF</DropdownMenuItem>
                          <DropdownMenuItem><Send className="mr-2 h-4 w-4" /> Envoyer par email</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
