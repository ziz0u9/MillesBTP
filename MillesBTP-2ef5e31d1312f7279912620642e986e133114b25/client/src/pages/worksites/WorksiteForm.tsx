import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(1, "Le nom du chantier est requis"),
  code: z.string().optional(),
  client_id: z.string().min(1, "Un client doit être sélectionné"),
  address: z.string().min(1, "L'adresse est requise"),
  type: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  planned_end_date: z.string().optional(),
  manager_name: z.string().optional(),
  budget_initial: z.string().min(1, "Le budget initial est requis"),
}).refine((data) => {
  if (data.planned_end_date && data.start_date) {
    return new Date(data.planned_end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["planned_end_date"],
});

export default function WorksiteForm() {
  const [location, setLocation] = useLocation();
  const { session } = useSession();
  const { toast } = useToast();
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const isEditMode = location.includes("/edit");
  const pathParts = location.split("/");
  const idIndex = pathParts.findIndex(part => part === "worksites") + 1;
  const worksiteId = isEditMode && pathParts[idIndex] ? pathParts[idIndex] : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      client_id: "",
      address: "",
      type: "",
      description: "",
      start_date: "",
      planned_end_date: "",
      manager_name: "",
      budget_initial: "0",
    },
  });

  useEffect(() => {
    if (session?.user) {
      loadClients();
      if (isEditMode && worksiteId && worksiteId !== "new") {
        loadWorksite();
      }
    } else if (session === null) {
      setLoadingClients(false);
    }
  }, [session, isEditMode, worksiteId, location]);

  async function loadWorksite() {
    if (!session?.user || !worksiteId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("worksites")
        .select("*")
        .eq("id", worksiteId)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      // Pré-remplir le formulaire avec les données existantes
      form.reset({
        name: data.name || "",
        code: data.code || "",
        client_id: data.client_id || "",
        address: data.address || "",
        type: data.type || "",
        description: data.description || "",
        start_date: data.start_date ? format(new Date(data.start_date), "yyyy-MM-dd") : "",
        planned_end_date: data.planned_end_date ? format(new Date(data.planned_end_date), "yyyy-MM-dd") : "",
        manager_name: data.manager_name || "",
        budget_initial: data.budget_initial || "0",
      });
    } catch (error: any) {
      console.error("Erreur lors du chargement du chantier:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le chantier.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    if (!session?.user) return;
    
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", session.user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients.",
        variant: "destructive",
      });
    } finally {
      setLoadingClients(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user) return;

    setLoading(true);
    try {
      const formData = {
        user_id: session.user.id,
        name: values.name,
        code: values.code || null,
        client_id: values.client_id,
        address: values.address,
        type: values.type || null,
        description: values.description || null,
        start_date: values.start_date ? new Date(values.start_date + "T00:00:00").toISOString() : null,
        planned_end_date: values.planned_end_date ? new Date(values.planned_end_date + "T00:00:00").toISOString() : null,
        manager_name: values.manager_name || null,
        budget_initial: values.budget_initial,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode && worksiteId && worksiteId !== "new") {
        const { error } = await supabase
          .from("worksites")
          .update(formData)
          .eq("id", worksiteId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        toast({ title: "Succès", description: "Le chantier a été mis à jour avec succès." });
        setLocation(`/dashboard/worksites/${worksiteId}`);
      } else {
        const { data, error } = await supabase
          .from("worksites")
          .insert({
            ...formData,
            costs_estimated: "0",
            costs_committed: "0",
            profitability_status: "profitable" as const,
            status: "active" as const,
          })
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Succès", description: "Le chantier a été créé avec succès." });
        setLocation(`/dashboard/worksites/${data.id}`);
        return;
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le chantier.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loadingClients) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? "Modifier le chantier" : "Nouveau chantier"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isEditMode ? "Modifiez les informations du chantier" : "Créez un nouveau chantier"}
          </p>
        </div>
      </div>

      <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Informations du chantier</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Nom du chantier *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Rénovation appartement rue X"
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Code chantier</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: CH-2024-001"
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Client *</FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-[#3a3f47] bg-[#2f343a] text-white"
                          {...field}
                        >
                          <option value="">Sélectionner un client</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Type de chantier</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Rénovation, Construction, Aménagement"
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-300">Adresse *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Adresse complète du chantier"
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-300">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description du chantier..."
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Date de début</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="bg-[#2f343a] border-[#3a3f47] text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="planned_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Fin prévue</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="bg-[#2f343a] border-[#3a3f47] text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manager_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Responsable</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nom du conducteur de travaux"
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget_initial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Budget initial (€) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-[#2f343a] border-[#3a3f47] text-white placeholder:text-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#3a3f47]">
                <Link href="/dashboard">
                  <Button type="button" variant="outline" className="border-[#3a3f47] text-gray-300">
                    Annuler
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Enregistrement..." : isEditMode ? "Enregistrer les modifications" : "Créer le chantier"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

