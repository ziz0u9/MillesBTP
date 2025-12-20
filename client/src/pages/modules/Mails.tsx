import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Forward,
  Plus
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
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface MailItem {
  id: string;
  sender: string;
  email: string;
  subject: string;
  content: string | null;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "starred" | "archive" | "trash";
  labels: string[] | null;
  created_at: string;
}

export default function Mails() {
  const { session } = useSession();
  const [mails, setMails] = useState<MailItem[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "starred" | "archive" | "trash">("inbox");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) {
      loadMails();
    }
  }, [session, activeTab]);

  async function loadMails() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("mails")
        .select("*")
        .eq("user_id", session.user.id);

      if (activeTab === "starred") {
        query = query.eq("starred", true);
      } else {
        query = query.eq("folder", activeTab);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setMails(data || []);
      
      if (data && data.length > 0 && !selectedMail) {
        setSelectedMail(data[0]);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des mails:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les mails.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSendMail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      const { data, error } = await supabase
        .from("mails")
        .insert({
          user_id: session.user.id,
          sender: session.user.email || "Moi",
          email: to,
          subject,
          content: message,
          folder: "sent",
          read: true,
          starred: false,
        })
        .select()
        .single();

      if (error) throw error;

      setOpen(false);
      toast({
        title: "Email envoyé",
        description: "Votre message a bien été expédié.",
      });
      addLog("Envoi Email", `Message envoyé à ${to}`);
      e.currentTarget.reset();
      // Recharger les données
      await loadMails();
    } catch (error: any) {
      console.error("Erreur lors de l'envoi:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStar = async (mailId: string, currentStarred: boolean) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("mails")
        .update({ starred: !currentStarred })
        .eq("id", mailId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setMails(mails.map(m => m.id === mailId ? { ...m, starred: !currentStarred } : m));
      if (selectedMail?.id === mailId) {
        setSelectedMail({ ...selectedMail, starred: !currentStarred });
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleMarkAsRead = async (mailId: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("mails")
        .update({ read: true })
        .eq("id", mailId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setMails(mails.map(m => m.id === mailId ? { ...m, read: true } : m));
      if (selectedMail?.id === mailId) {
        setSelectedMail({ ...selectedMail, read: true });
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
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

  const filteredMails = mails.filter(mail =>
    mail.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mail.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = mails.filter(m => !m.read && m.folder === "inbox").length;
  const starredCount = mails.filter(m => m.starred).length;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 p-6 bg-[#0a0a0a]">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start gap-2 bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="h-4 w-4" /> Nouveau message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#262930] border-[#3a3f47]">
            <DialogHeader>
              <DialogTitle className="text-white">Nouveau message</DialogTitle>
              <DialogDescription className="text-gray-400">
                Rédigez votre email à envoyer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendMail} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="to" className="text-right text-gray-300">
                  À
                </Label>
                <Input id="to" name="to" placeholder="destinataire@email.com" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right text-gray-300">
                  Sujet
                </Label>
                <Input id="subject" name="subject" placeholder="Sujet du message" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="message" className="text-right mt-2 text-gray-300">
                  Message
                </Label>
                <Textarea id="message" name="message" placeholder="Votre message..." className="col-span-3 h-32 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">Envoyer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {[
                { id: "inbox" as const, icon: Inbox, label: "Boîte de réception", count: unreadCount },
                { id: "sent" as const, icon: Send, label: "Envoyés", count: 0 },
                { id: "starred" as const, icon: Star, label: "Favoris", count: starredCount },
                { id: "archive" as const, icon: Archive, label: "Archives", count: 0 },
                { id: "trash" as const, icon: Trash2, label: "Corbeille", count: 0 },
              ].map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id 
                      ? "bg-[#00ff88]/10 text-[#00ff88]" 
                      : "text-gray-400 hover:bg-[#2f343a] hover:text-white"
                  )}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedMail(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="text-xs font-semibold bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row bg-[#262930] rounded-lg border-0 shadow-md overflow-hidden">
        {/* Mail List */}
        <div className="w-full md:w-80 border-r border-[#3a3f47] flex flex-col">
          <div className="p-4 border-b border-[#3a3f47]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : filteredMails.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Aucun mail</div>
            ) : (
              <div className="divide-y divide-[#3a3f47]">
                {filteredMails.map((mail) => (
                  <div
                    key={mail.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-[#2f343a] transition-colors",
                      selectedMail?.id === mail.id ? "bg-[#00ff88]/10 border-l-2 border-l-[#00ff88]" : "",
                      !mail.read ? "border-l-2 border-l-[#4dabf7]" : "border-l-2 border-l-transparent"
                    )}
                    onClick={() => {
                      setSelectedMail(mail);
                      if (!mail.read) {
                        handleMarkAsRead(mail.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn("text-sm font-medium", !mail.read ? "text-white" : "text-gray-300")}>
                        {mail.sender}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(mail.created_at)}</span>
                    </div>
                    <div className={cn("text-sm mb-1 truncate", !mail.read ? "font-semibold text-white" : "text-gray-300")}>
                      {mail.subject}
                    </div>
                    {mail.content && (
                      <div className="text-xs text-gray-400 line-clamp-2 mb-2">
                        {mail.content.substring(0, 100)}...
                      </div>
                    )}
                    {mail.labels && mail.labels.length > 0 && (
                      <div className="flex gap-2">
                        {mail.labels.map((label, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] h-5 px-1.5 border-[#3a3f47] text-gray-400">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Mail Content */}
        {selectedMail ? (
          <div className="flex-1 flex flex-col bg-[#262930]">
            <div className="p-6 border-b border-[#3a3f47] flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedMail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] font-bold">
                    {selectedMail.sender.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{selectedMail.sender}</div>
                    <div className="text-xs text-gray-400">{selectedMail.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-[#2f343a]"
                  onClick={() => handleToggleStar(selectedMail.id, selectedMail.starred)}
                >
                  <Star className={cn("h-4 w-4", selectedMail.starred ? "fill-yellow-500 text-yellow-500" : "text-gray-400")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#2f343a]">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="text-sm leading-relaxed space-y-4 text-gray-300 whitespace-pre-wrap">
                {selectedMail.content || "Aucun contenu"}
              </div>
              
              <div className="mt-8 pt-4 border-t border-[#3a3f47]">
                <Button variant="outline" className="mr-2 gap-2 border-[#3a3f47] text-gray-300 hover:bg-[#2f343a] hover:text-white">
                  <Reply className="h-4 w-4" /> Répondre
                </Button>
                <Button variant="outline" className="gap-2 border-[#3a3f47] text-gray-300 hover:bg-[#2f343a] hover:text-white">
                  <Forward className="h-4 w-4" /> Transférer
                </Button>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Sélectionnez un mail pour le lire
          </div>
        )}
      </div>
    </div>
  );
}
