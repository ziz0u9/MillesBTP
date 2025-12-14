import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Search, 
  Inbox, 
  Send, 
  Trash2, 
  Archive, 
  Star,
  MoreVertical,
  Reply,
  Forward
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useToast } from "@/hooks/use-toast";
import { useLogs } from "@/lib/LogContext";

const mails = [
  {
    id: 1,
    sender: "Jean Dupont",
    email: "jean.dupont@client.fr",
    subject: "Demande de devis - Rénovation salle de bain",
    preview: "Bonjour, je souhaiterais obtenir un devis pour la rénovation complète de ma salle de bain...",
    date: "10:30",
    read: false,
    starred: true,
    labels: ["Devis", "Urgent"]
  },
  {
    id: 2,
    sender: "Fournisseur Bois",
    email: "contact@bois-materiaux.fr",
    subject: "Votre commande #9921 est disponible",
    preview: "Bonjour, votre commande de planches de chêne est prête à être retirée au dépôt...",
    date: "Hier",
    read: true,
    starred: false,
    labels: ["Commande"]
  },
  {
    id: 3,
    sender: "Marie Martin",
    email: "m.martin@gmail.com",
    subject: "Question sur la facture #4928",
    preview: "Pourriez-vous me confirmer que le virement a bien été reçu ? Merci d'avance...",
    date: "Hier",
    read: true,
    starred: false,
    labels: ["Facturation"]
  },
  {
    id: 4,
    sender: "Cabinet Comptable",
    email: "expert@compta-btp.fr",
    subject: "Rappel déclaration TVA",
    preview: "N'oubliez pas de nous transmettre vos factures d'achat avant le 15 du mois...",
    date: "Lun",
    read: true,
    starred: true,
    labels: ["Admin"]
  }
];

export default function Mails() {
  const [selectedMail, setSelectedMail] = useState(mails[0]);
  const [activeTab, setActiveTab] = useState("inbox");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLogs();

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast({
      title: "Email envoyé",
      description: "Votre message a bien été expédié.",
    });
    addLog("Envoi Email", "Nouveau message envoyé");
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start gap-2 bg-primary text-white hover:bg-primary/90">
              <Mail className="h-4 w-4" /> Nouveau message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau message</DialogTitle>
              <DialogDescription>
                Rédigez votre email à envoyer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendMail} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="to" className="text-right">
                  À
                </Label>
                <Input id="to" placeholder="destinataire@email.com" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Sujet
                </Label>
                <Input id="subject" placeholder="Sujet du message" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="message" className="text-right mt-2">
                  Message
                </Label>
                <Textarea id="message" placeholder="Votre message..." className="col-span-3 h-32" required />
              </div>
              <DialogFooter>
                <Button type="submit">Envoyer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <nav className="space-y-1">
          {[
            { id: "inbox", icon: Inbox, label: "Boîte de réception", count: 2 },
            { id: "sent", icon: Send, label: "Envoyés", count: 0 },
            { id: "starred", icon: Star, label: "Favoris", count: 2 },
            { id: "archive", icon: Archive, label: "Archives", count: 0 },
            { id: "trash", icon: Trash2, label: "Corbeille", count: 0 },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeTab === item.id ? "bg-sidebar-accent text-white" : "text-muted-foreground"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
                <span className="text-xs font-medium">{item.count}</span>
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row bg-card/50 rounded-xl border border-white/5 overflow-hidden h-full">
        {/* Mail List */}
        <div className="w-full md:w-80 border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 bg-background/50 border-white/10"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-white/5">
              {mails.map((mail) => (
                <div
                  key={mail.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-white/5 transition-colors",
                    selectedMail?.id === mail.id ? "bg-white/5" : "",
                    !mail.read ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                  )}
                  onClick={() => setSelectedMail(mail)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn("text-sm font-medium", !mail.read ? "text-white" : "text-muted-foreground")}>
                      {mail.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">{mail.date}</span>
                  </div>
                  <div className={cn("text-sm mb-1 truncate", !mail.read ? "font-medium text-white" : "text-muted-foreground")}>
                    {mail.subject}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {mail.preview}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {mail.labels.map(label => (
                      <Badge key={label} variant="outline" className="text-[10px] h-5 px-1 border-white/10 text-muted-foreground">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Mail Content */}
        {selectedMail ? (
          <div className="flex-1 flex flex-col bg-background/30">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedMail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {selectedMail.sender.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedMail.sender}</div>
                    <div className="text-xs text-muted-foreground">{selectedMail.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Star className={cn("h-4 w-4", selectedMail.starred ? "fill-yellow-500 text-yellow-500" : "")} /></Button>
                <Button variant="ghost" size="icon"><Reply className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1 p-6">
              <div className="text-sm leading-relaxed space-y-4">
                <p>Bonjour,</p>
                <p>{selectedMail.preview}</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Cordialement,<br/>{selectedMail.sender}</p>
              </div>
              
              <div className="mt-8 pt-4 border-t border-white/5">
                <Button variant="outline" className="mr-2 gap-2">
                  <Reply className="h-4 w-4" /> Répondre
                </Button>
                <Button variant="outline" className="gap-2">
                  <Forward className="h-4 w-4" /> Transférer
                </Button>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Sélectionnez un mail pour le lire
          </div>
        )}
      </div>
    </div>
  );
}
