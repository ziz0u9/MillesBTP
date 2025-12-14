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
import { Phone, Search, Plus, MoreHorizontal, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
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

const initialCalls = [
  { id: 1, type: "incoming", contact: "M. Martin", phone: "06 12 34 56 78", date: "Auj. 10:30", status: "missed", subject: "Urgence fuite d'eau" },
  { id: 2, type: "incoming", contact: "Agence Immo", phone: "01 45 67 89 10", date: "Auj. 09:15", status: "processed", subject: "Nouveau projet rénovation" },
  { id: 3, type: "outgoing", contact: "Fournisseur Bois", phone: "04 78 90 12 34", date: "Hier 16:45", status: "processed", subject: "Commande #9921" },
  { id: 4, type: "incoming", contact: "Mme Dubois", phone: "06 98 76 54 32", date: "Hier 14:20", status: "pending", subject: "Question devis" },
  { id: 5, type: "missed", contact: "Inconnu", phone: "06 00 00 00 00", date: "Hier 11:00", status: "missed", subject: "-" },
];

export default function Calls() {
  const [calls, setCalls] = useState(initialCalls);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLogs();

  const handleCreateCall = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast({
      title: "Appel enregistré",
      description: "Le nouvel appel a été ajouté à la liste.",
    });
    addLog("Nouvel Appel", "Appel enregistré manuellement");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "processed": return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20">Traité</Badge>;
      case "pending": return <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/20">En attente</Badge>;
      case "missed": return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20">Manqué</Badge>;
      default: return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "incoming": return <PhoneIncoming className="h-4 w-4 text-blue-400" />;
      case "outgoing": return <PhoneOutgoing className="h-4 w-4 text-green-400" />;
      case "missed": return <PhoneMissed className="h-4 w-4 text-red-400" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight">Suivi des appels</h2>
          <p className="text-muted-foreground">Gérez votre standard téléphonique et ne ratez aucune opportunité.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel appel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enregistrer un appel</DialogTitle>
              <DialogDescription>
                Créez une fiche pour un appel entrant ou sortant.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCall} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">
                  Contact
                </Label>
                <Input id="contact" placeholder="Nom du contact" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Téléphone
                </Label>
                <Input id="phone" placeholder="06..." className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Sujet
                </Label>
                <Input id="subject" placeholder="Objet de l'appel" className="col-span-3" required />
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un numéro ou un nom..." 
            className="pl-9 bg-background/50 border-white/10"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="text-xs">Tous</Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Manqués</Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">A traiter</Button>
        </div>
      </div>

      <div className="rounded-md border border-white/5 bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id} className="border-white/5 hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="p-2 rounded-full bg-background/50 border border-white/5 w-fit">
                    {getIcon(call.type)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{call.contact}</div>
                  <div className="text-xs text-muted-foreground">{call.phone}</div>
                </TableCell>
                <TableCell>{call.subject}</TableCell>
                <TableCell className="text-muted-foreground">{call.date}</TableCell>
                <TableCell>{getStatusBadge(call.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        toast({ title: "Appel", description: "Rappel programmé" });
                        addLog("Rappel programmé", `Pour ${call.contact}`);
                      }}>
                        Rappeler
                      </DropdownMenuItem>
                      <DropdownMenuItem>Marquer comme traité</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Créer un contact</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
