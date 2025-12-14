import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Plus, 
  MoreHorizontal,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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

const initialTasks = [
  { id: 1, title: "Envoyer devis M. Martin", due: new Date(2024, 5, 15), completed: false, tag: "Devis" },
  { id: 2, title: "Déclaration TVA", due: new Date(2024, 5, 20), completed: false, tag: "Admin" },
  { id: 3, title: "Commander carrelage chantier Lyon", due: new Date(2024, 5, 12), completed: true, tag: "Chantier" },
  { id: 4, title: "Relancer facture impayée #4421", due: new Date(2024, 5, 10), completed: false, tag: "Compta" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLogs();

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast({
      title: "Tâche ajoutée",
      description: "Votre nouvelle tâche a été créée.",
    });
    addLog("Nouvelle Tâche", "Tâche ajoutée à la liste");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight">Tâches</h2>
          <p className="text-muted-foreground">Votre liste de choses à faire.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvelle tâche</DialogTitle>
              <DialogDescription>
                Ajouter une tâche à votre liste.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task" className="text-right">
                  Tâche
                </Label>
                <Input id="task" placeholder="Description de la tâche" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Catégorie
                </Label>
                <select id="category" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Admin</option>
                  <option>Chantier</option>
                  <option>Devis</option>
                  <option>Compta</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card/50 p-4 rounded-lg border border-white/5 flex gap-2">
            <Input 
              placeholder="Ajouter une tâche rapide..." 
              className="bg-background/50 border-white/10"
            />
            <Button size="icon" variant="secondary"><Plus className="h-4 w-4" /></Button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                  task.completed 
                    ? "bg-background/30 border-white/5 opacity-60" 
                    : "bg-card/50 border-white/10 hover:border-primary/20"
                )}
              >
                <Checkbox 
                  checked={task.completed} 
                  onCheckedChange={() => toggleTask(task.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
                />
                <div className="flex-1">
                  <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-white/10 text-muted-foreground">
                      {task.tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(task.due, "d MMM")}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card/50 p-4 rounded-lg border border-white/5">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0"
            />
          </div>
          
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-lg border border-primary/10">
            <h3 className="font-bold text-lg mb-2 text-white">Astuce Pro</h3>
            <p className="text-sm text-muted-foreground">
              Connectez votre agenda Google ou Outlook pour synchroniser vos rendez-vous chantiers automatiquement.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full border-primary/20 hover:bg-primary/10 hover:text-white">
              Connecter l'agenda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
