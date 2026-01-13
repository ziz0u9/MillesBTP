import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Plus, Clock } from "lucide-react";
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

interface Task {
  id: string;
  title: string;
  description: string | null;
  tag: "Devis" | "Admin" | "Chantier" | "Compta" | null;
  due_date: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

export default function Tasks() {
  const { session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addLog } = useLogs();

  useEffect(() => {
    if (session?.user) {
      loadTasks();
    }
  }, [session]);

  async function loadTasks() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des tâches:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const toggleTask = async (id: string) => {
    if (!session?.user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      addLog("Tâche", task.completed ? "Tâche marquée comme non terminée" : "Tâche marquée comme terminée");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const tag = formData.get("tag") as string;
    const dueDate = formData.get("dueDate") as string;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: session.user.id,
          title,
          tag: tag || null,
          due_date: dueDate || null,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      setOpen(false);
      toast({
        title: "Tâche créée",
        description: "La nouvelle tâche a été ajoutée.",
      });
      addLog("Nouvelle Tâche", `Tâche créée: ${title}`);
      
      e.currentTarget.reset();
      // Recharger les données
      await loadTasks();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la tâche.",
        variant: "destructive",
      });
    }
  };

  const getTagColor = (tag: string | null) => {
    switch(tag) {
      case "Devis": return "bg-[#4dabf7]/20 text-[#4dabf7] border-[#4dabf7]/30";
      case "Admin": return "bg-[#9775fa]/20 text-[#9775fa] border-[#9775fa]/30";
      case "Chantier": return "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30";
      case "Compta": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Tâches</h2>
          <p className="text-gray-400 text-sm">Gestion des tâches administratives</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#262930] border-[#3a3f47]">
            <DialogHeader>
              <DialogTitle className="text-white">Nouvelle tâche</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créez une nouvelle tâche à effectuer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-gray-300">Titre</Label>
                <Input id="title" name="title" placeholder="Titre de la tâche" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tag" className="text-right text-gray-300">Catégorie</Label>
                <select id="tag" name="tag" className="col-span-3 h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white">
                  <option value="">Aucune</option>
                  <option value="Devis">Devis</option>
                  <option value="Admin">Admin</option>
                  <option value="Chantier">Chantier</option>
                  <option value="Compta">Compta</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right text-gray-300">Échéance</Label>
                <Input id="dueDate" name="dueDate" type="date" className="col-span-3 bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">À faire ({pendingTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">Aucune tâche à faire</div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-[#3a3f47] hover:bg-[#2f343a] transition-colors"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{task.title}</span>
                        {task.tag && <Badge className={getTagColor(task.tag)}>{task.tag}</Badge>}
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>Échéance: {format(new Date(task.due_date), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-400 text-center py-8">Aucune tâche en cours</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Terminées ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : completedTasks.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">Aucune tâche terminée</div>
            ) : (
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-[#3a3f47] bg-[#2f343a] opacity-75"
                  >
                    <CheckSquare className="h-5 w-5 text-[#00ff88] mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-400 line-through">{task.title}</span>
                        {task.tag && <Badge className={getTagColor(task.tag)}>{task.tag}</Badge>}
                      </div>
                      {task.due_date && (
                        <div className="text-xs text-gray-500">
                          Terminée le {format(new Date(task.due_date), "dd/MM/yyyy")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
