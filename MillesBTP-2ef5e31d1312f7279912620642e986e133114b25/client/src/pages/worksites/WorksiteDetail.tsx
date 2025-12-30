import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  AlertCircle, 
  Edit,
  Plus,
  Save,
  CheckCircle,
  XCircle,
  Progress,
  Trash2,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Worksite {
  id: string;
  name: string;
  code: string | null;
  client_id: string;
  address: string;
  type: string | null;
  description: string | null;
  profitability_status: "profitable" | "watch" | "at_risk";
  budget_initial: string;
  costs_estimated: string;
  costs_committed: string;
  status: "active" | "completed" | "archived" | "cancelled";
  has_budget_alert: boolean;
  has_amendment_alert: boolean;
  has_admin_alert: boolean;
  start_date: string | null;
  planned_end_date: string | null;
  manager_name: string | null;
  clients?: { name: string; email: string; phone: string; id: string };
}

interface Amendment {
  id: string;
  title: string;
  description: string;
  cost_impact: string;
  time_impact_hours: number | null;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  decided_at: string | null;
  decision_notes: string | null;
}

interface WorksiteCost {
  id: string;
  category: "labor" | "materials" | "subcontracting" | "other";
  amount: string;
  description: string | null;
  cost_date: string;
  reference: string | null;
  type: "estimated" | "committed";
}

const costCategoryLabels = {
  labor: "👷 Main d'œuvre",
  materials: "🧱 Matériaux",
  subcontracting: "🔧 Sous-traitance",
  other: "📋 Divers",
};

export default function WorksiteDetail() {
  const [location, setLocation] = useLocation();
  const { session } = useSession();
  const { toast } = useToast();
  const worksiteId = location.split("/").pop();
  const [worksite, setWorksite] = useState<Worksite | null>(null);
  const [loading, setLoading] = useState(true);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loadingAmendments, setLoadingAmendments] = useState(false);
  
  // États pour l'édition financière
  const [editingCosts, setEditingCosts] = useState(false);
  const [costsCommitted, setCostsCommitted] = useState("0");
  const [costsEstimated, setCostsEstimated] = useState("0");
  const [savingCosts, setSavingCosts] = useState(false);
  
  // États pour les avenants
  const [amendmentDialogOpen, setAmendmentDialogOpen] = useState(false);
  const [amendmentTitle, setAmendmentTitle] = useState("");
  const [amendmentDescription, setAmendmentDescription] = useState("");
  const [amendmentCostImpact, setAmendmentCostImpact] = useState("0");
  const [amendmentTimeImpact, setAmendmentTimeImpact] = useState("");
  const [creatingAmendment, setCreatingAmendment] = useState(false);
  const [amendmentFilter, setAmendmentFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  // États pour le dialog de validation/refus
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionAmendmentId, setDecisionAmendmentId] = useState<string | null>(null);
  const [decisionType, setDecisionType] = useState<"approved" | "rejected" | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [processingDecision, setProcessingDecision] = useState(false);
  
  // États pour les coûts détaillés (ÉTAPE 1 - MVP)
  const [worksiteCosts, setWorksiteCosts] = useState<WorksiteCost[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [costCategory, setCostCategory] = useState<"labor" | "materials" | "subcontracting" | "other">("labor");
  const [costAmount, setCostAmount] = useState("");
  const [costDescription, setCostDescription] = useState("");
  const [costDate, setCostDate] = useState(new Date().toISOString().split("T")[0]);
  const [costReference, setCostReference] = useState("");
  const [costType, setCostType] = useState<"estimated" | "committed">("committed");
  const [creatingCost, setCreatingCost] = useState(false);
  
  // États pour édition/suppression des coûts (ÉTAPE 6)
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [deletingCostId, setDeletingCostId] = useState<string | null>(null);
  
  // États pour timeline/événements (ÉTAPE 5)
  const [worksiteEvents, setWorksiteEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  // État pour simulation d'impact (ÉTAPE 4)
  const [impactPreview, setImpactPreview] = useState<{newMargin: number, newStatus: string, newPercentage: number} | null>(null);

  useEffect(() => {
    if (session?.user && worksiteId) {
      loadWorksite();
      loadAmendments();
      loadWorksiteCosts();
      loadWorksiteEvents();
    }
  }, [session, worksiteId]);

  // Calcul de l'impact avant ajout de coût (ÉTAPE 4)
  useEffect(() => {
    if (costAmount && worksite && costType === "committed") {
      const amount = parseFloat(costAmount) || 0;
      const currentCommitted = parseFloat(worksite.costs_committed || "0");
      const newCommitted = currentCommitted + amount;
      const budget = parseFloat(worksite.budget_initial || "0");
      const newMargin = budget - newCommitted;
      const newPercentage = budget > 0 ? (newMargin / budget) * 100 : 0;
      
      let newStatus = "profitable";
      if (newPercentage < 5 || newMargin < 0) {
        newStatus = "at_risk";
      } else if (newPercentage < 15) {
        newStatus = "watch";
      }
      
      setImpactPreview({ newMargin, newStatus, newPercentage });
    } else {
      setImpactPreview(null);
    }
  }, [costAmount, costType, worksite]);

  async function loadWorksite() {
    if (!session?.user || !worksiteId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("worksites")
        .select(`
          *,
          clients:client_id (id, name, email, phone)
        `)
        .eq("id", worksiteId)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      setWorksite(data);
      setCostsCommitted(data.costs_committed || "0");
      setCostsEstimated(data.costs_estimated || "0");
    } catch (error) {
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

  async function loadAmendments() {
    if (!session?.user || !worksiteId) return;

    setLoadingAmendments(true);
    try {
      const { data, error } = await supabase
        .from("amendments")
        .select("*")
        .eq("worksite_id", worksiteId)
        .eq("user_id", session.user.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setAmendments(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des avenants:", error);
    } finally {
      setLoadingAmendments(false);
    }
  }

  async function loadWorksiteCosts() {
    if (!session?.user || !worksiteId) return;

    setLoadingCosts(true);
    try {
      const { data, error } = await supabase
        .from("worksite_costs")
        .select("*")
        .eq("worksite_id", worksiteId)
        .order("cost_date", { ascending: false });

      if (error) throw error;
      setWorksiteCosts(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des coûts:", error);
    } finally {
      setLoadingCosts(false);
    }
  }

  async function createCost() {
    if (!session?.user || !worksiteId) return;

    if (!costAmount || parseFloat(costAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être supérieur à 0.",
        variant: "destructive",
      });
      return;
    }

    setCreatingCost(true);
    try {
      const { error } = await supabase
        .from("worksite_costs")
        .insert({
          worksite_id: worksiteId,
          user_id: session.user.id,
          category: costCategory,
          amount: parseFloat(costAmount),
          description: costDescription.trim() || null,
          cost_date: new Date(costDate + "T00:00:00").toISOString(),
          reference: costReference.trim() || null,
          type: costType,
        });

      if (error) throw error;

      // Créer un événement (ÉTAPE 5)
      await createEvent("cost_added", `Coût ajouté: ${costCategoryLabels[costCategory]}`, costDescription || `Montant: ${costAmount}€`, {
        amount: parseFloat(costAmount),
        category: costCategory,
        type: costType,
      });

      // Recalculer les totaux et mettre à jour worksite
      await recalculateWorksiteCosts();

      setCostDialogOpen(false);
      setEditingCostId(null);
      setCostAmount("");
      setCostDescription("");
      setCostDate(new Date().toISOString().split("T")[0]);
      setCostReference("");
      await loadWorksiteCosts();
      await loadWorksiteEvents();
      
      toast({
        title: "Succès",
        description: "Le coût a été ajouté avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du coût:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le coût.",
        variant: "destructive",
      });
    } finally {
      setCreatingCost(false);
    }
  }

  async function recalculateWorksiteCosts() {
    if (!session?.user || !worksiteId || !worksite) return;

    try {
      // Calculer les totaux depuis worksite_costs
      const { data: costs, error: costsError } = await supabase
        .from("worksite_costs")
        .select("amount, type")
        .eq("worksite_id", worksiteId);

      if (costsError) throw costsError;

      const committedTotal = costs
        ?.filter(c => c.type === "committed")
        .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0) || 0;
      
      const estimatedTotal = costs
        ?.filter(c => c.type === "estimated")
        .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0) || 0;

      const budgetNum = parseFloat(worksite.budget_initial || "0");
      const marginCommitted = budgetNum - committedTotal;
      const marginPercentage = budgetNum > 0 ? (marginCommitted / budgetNum) * 100 : 0;

      // Calcul du statut de rentabilité
      let profitabilityStatus: "profitable" | "watch" | "at_risk" = "profitable";
      if (marginPercentage < 5 || marginCommitted < 0) {
        profitabilityStatus = "at_risk";
      } else if (marginPercentage < 15) {
        profitabilityStatus = "watch";
      }

      const budgetAlert = committedTotal > budgetNum * 0.9 || committedTotal > budgetNum;

      await supabase
        .from("worksites")
        .update({
          costs_committed: committedTotal.toString(),
          costs_estimated: estimatedTotal.toString(),
          margin_estimated: marginCommitted.toString(),
          margin_percentage: marginPercentage.toFixed(2),
          profitability_status: profitabilityStatus,
          has_budget_alert: budgetAlert,
          updated_at: new Date().toISOString(),
        })
        .eq("id", worksiteId)
        .eq("user_id", session.user.id);

      await loadWorksite();
    } catch (error: any) {
      console.error("Erreur lors du recalcul des coûts:", error);
    }
  }

  // ÉTAPE 5 : Charger les événements/timeline
  async function loadWorksiteEvents() {
    if (!session?.user || !worksiteId) return;

    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from("worksite_events")
        .select("*")
        .eq("worksite_id", worksiteId)
        .order("event_date", { ascending: false });

      if (error) throw error;
      setWorksiteEvents(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des événements:", error);
    } finally {
      setLoadingEvents(false);
    }
  }

  // ÉTAPE 5 : Créer un événement
  async function createEvent(eventType: string, title: string, description?: string, metadata?: any) {
    if (!session?.user || !worksiteId) return;

    try {
      await supabase
        .from("worksite_events")
        .insert({
          worksite_id: worksiteId,
          user_id: session.user.id,
          event_type: eventType,
          title,
          description: description || null,
          metadata: metadata || null,
        });
    } catch (error: any) {
      console.error("Erreur lors de la création de l'événement:", error);
    }
  }

  // ÉTAPE 6 : Supprimer un coût
  async function deleteCost(costId: string) {
    if (!session?.user || !worksiteId) return;

    try {
      const { error } = await supabase
        .from("worksite_costs")
        .delete()
        .eq("id", costId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      await createEvent("cost_deleted", "Coût supprimé", null, { cost_id: costId });
      await recalculateWorksiteCosts();
      await loadWorksiteCosts();
      await loadWorksiteEvents();
      
      toast({
        title: "Succès",
        description: "Le coût a été supprimé avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la suppression du coût:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le coût.",
        variant: "destructive",
      });
    } finally {
      setDeletingCostId(null);
    }
  }

  // ÉTAPE 6 : Ouvrir le dialog d'édition
  function openEditCostDialog(cost: WorksiteCost) {
    setEditingCostId(cost.id);
    setCostCategory(cost.category);
    setCostAmount(cost.amount);
    setCostDescription(cost.description || "");
    setCostDate(new Date(cost.cost_date).toISOString().split("T")[0]);
    setCostReference(cost.reference || "");
    setCostType(cost.type);
    setCostDialogOpen(true);
  }

  // ÉTAPE 6 : Mettre à jour un coût
  async function updateCost() {
    if (!session?.user || !worksiteId || !editingCostId) return;

    if (!costAmount || parseFloat(costAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être supérieur à 0.",
        variant: "destructive",
      });
      return;
    }

    setCreatingCost(true);
    try {
      const { error } = await supabase
        .from("worksite_costs")
        .update({
          category: costCategory,
          amount: parseFloat(costAmount),
          description: costDescription.trim() || null,
          cost_date: new Date(costDate + "T00:00:00").toISOString(),
          reference: costReference.trim() || null,
          type: costType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCostId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      await createEvent("cost_updated", "Coût modifié", null, { cost_id: editingCostId });
      await recalculateWorksiteCosts();

      setCostDialogOpen(false);
      setEditingCostId(null);
      setCostAmount("");
      setCostDescription("");
      setCostDate(new Date().toISOString().split("T")[0]);
      setCostReference("");
      await loadWorksiteCosts();
      await loadWorksiteEvents();
      
      toast({
        title: "Succès",
        description: "Le coût a été mis à jour avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du coût:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le coût.",
        variant: "destructive",
      });
    } finally {
      setCreatingCost(false);
    }
  }

  async function updateCosts() {
    if (!session?.user || !worksiteId || !worksite) return;

    setSavingCosts(true);
    try {
      const costsCommittedNum = parseFloat(costsCommitted) || 0;
      const costsEstimatedNum = parseFloat(costsEstimated) || 0;
      const budgetNum = parseFloat(worksite.budget_initial || "0");
      
      // Calcul de la marge
      const marginCommitted = budgetNum - costsCommittedNum;
      const marginPercentage = budgetNum > 0 ? (marginCommitted / budgetNum) * 100 : 0;
      
      // Calcul du statut de rentabilité
      let profitabilityStatus: "profitable" | "watch" | "at_risk" = "profitable";
      if (marginPercentage < 5 || marginCommitted < 0) {
        profitabilityStatus = "at_risk";
      } else if (marginPercentage < 15) {
        profitabilityStatus = "watch";
      }

      // Calcul des alertes
      const budgetAlert = costsCommittedNum > budgetNum * 0.9 || costsCommittedNum > budgetNum;

      const { error } = await supabase
        .from("worksites")
        .update({
          costs_committed: costsCommittedNum.toString(),
          costs_estimated: costsEstimatedNum.toString(),
          margin_estimated: marginCommitted.toString(),
          margin_percentage: marginPercentage.toFixed(2),
          profitability_status: profitabilityStatus,
          has_budget_alert: budgetAlert,
          updated_at: new Date().toISOString(),
        })
        .eq("id", worksiteId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      await loadWorksite();
      setEditingCosts(false);
      toast({
        title: "Succès",
        description: "Les coûts ont été mis à jour avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des coûts:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les coûts.",
        variant: "destructive",
      });
    } finally {
      setSavingCosts(false);
    }
  }

  async function createAmendment() {
    if (!session?.user || !worksiteId) return;

    setCreatingAmendment(true);
    try {
      const { error } = await supabase
        .from("amendments")
        .insert({
          worksite_id: worksiteId,
          user_id: session.user.id,
          title: amendmentTitle,
          description: amendmentDescription,
          cost_impact: parseFloat(amendmentCostImpact) || 0,
          time_impact_hours: amendmentTimeImpact ? parseInt(amendmentTimeImpact) : null,
          status: "pending",
        });

      if (error) throw error;

      // Créer un événement (ÉTAPE 5)
      await createEvent("amendment_created", `Avenant créé: ${amendmentTitle}`, amendmentDescription, {
        cost_impact: parseFloat(amendmentCostImpact) || 0,
        time_impact_hours: amendmentTimeImpact ? parseInt(amendmentTimeImpact) : null,
      });

      // Vérifier si avenant en attente > 7 jours
      const { data: pendingAmendments } = await supabase
        .from("amendments")
        .select("requested_at")
        .eq("worksite_id", worksiteId)
        .eq("status", "pending");

      const hasOldPending = pendingAmendments?.some(am => {
        const daysSince = (Date.now() - new Date(am.requested_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
      });

      if (hasOldPending) {
        await supabase
          .from("worksites")
          .update({ has_amendment_alert: true })
          .eq("id", worksiteId);
      }

      setAmendmentDialogOpen(false);
      setAmendmentTitle("");
      setAmendmentDescription("");
      setAmendmentCostImpact("0");
      setAmendmentTimeImpact("");
      await loadAmendments();
      await loadWorksite();
      await loadWorksiteEvents();
      
      toast({
        title: "Succès",
        description: "L'avenant a été créé avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la création de l'avenant:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'avenant.",
        variant: "destructive",
      });
    } finally {
      setCreatingAmendment(false);
    }
  }

  function openDecisionDialog(amendmentId: string, type: "approved" | "rejected") {
    setDecisionAmendmentId(amendmentId);
    setDecisionType(type);
    setDecisionNotes("");
    setDecisionDialogOpen(true);
  }

  async function handleDecisionSubmit() {
    if (!session?.user || !worksiteId || !worksite || !decisionAmendmentId || !decisionType) return;

    setProcessingDecision(true);
    try {
      const { data: amendment, error: fetchError } = await supabase
        .from("amendments")
        .select("cost_impact")
        .eq("id", decisionAmendmentId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("amendments")
        .update({
          status: decisionType,
          decided_at: new Date().toISOString(),
          decision_notes: decisionNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", decisionAmendmentId);

      if (error) throw error;

      // Si avenant validé, mettre à jour le budget initial
      if (decisionType === "approved" && amendment) {
        const currentBudget = parseFloat(worksite.budget_initial || "0");
        const costImpact = parseFloat(amendment.cost_impact || "0");
        const newBudget = currentBudget + costImpact;

        await supabase
          .from("worksites")
          .update({
            budget_initial: newBudget.toString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", worksiteId);
      }

      // Créer un événement (ÉTAPE 5)
      const { data: amendmentData } = await supabase
        .from("amendments")
        .select("title")
        .eq("id", decisionAmendmentId)
        .single();
      
      await createEvent(
        decisionType === "approved" ? "amendment_approved" : "amendment_rejected",
        `Avenant ${decisionType === "approved" ? "validé" : "refusé"}: ${amendmentData?.title || ""}`,
        decisionNotes || null,
        { amendment_id: decisionAmendmentId }
      );

      await loadWorksite();
      await loadAmendments();
      await loadWorksiteEvents();
      
      setDecisionDialogOpen(false);
      setDecisionAmendmentId(null);
      setDecisionType(null);
      setDecisionNotes("");
      
      toast({
        title: "Succès",
        description: `L'avenant a été ${decisionType === "approved" ? "validé" : "refusé"}.`,
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'avenant:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'avenant.",
        variant: "destructive",
      });
    } finally {
      setProcessingDecision(false);
    }
  }

  const getProfitabilityColor = (status: string) => {
    switch(status) {
      case "profitable": return "text-[#00ff88] bg-[#00ff88]/20 border-[#00ff88]/30";
      case "watch": return "text-orange-500 bg-orange-500/20 border-orange-500/30";
      case "at_risk": return "text-red-500 bg-red-500/20 border-red-500/30";
      default: return "text-gray-500 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getProfitabilityLabel = (status: string) => {
    switch(status) {
      case "profitable": return "🟢 Rentable";
      case "watch": return "🟠 À surveiller";
      case "at_risk": return "🔴 À risque";
      default: return "Inconnu";
    }
  };

  // Calculer les totaux par catégorie (ÉTAPE 2)
  const calculateCategoryTotals = () => {
    const totals: Record<string, { committed: number; estimated: number }> = {
      labor: { committed: 0, estimated: 0 },
      materials: { committed: 0, estimated: 0 },
      subcontracting: { committed: 0, estimated: 0 },
      other: { committed: 0, estimated: 0 },
    };

    worksiteCosts.forEach(cost => {
      const amount = parseFloat(cost.amount || "0");
      if (cost.type === "committed") {
        totals[cost.category].committed += amount;
      } else {
        totals[cost.category].estimated += amount;
      }
    });

    return totals;
  };

  const calculateFinancials = () => {
    if (!worksite) return null;
    
    const budget = parseFloat(worksite.budget_initial || "0");
    const costsCommittedNum = parseFloat(worksite.costs_committed || "0");
    const costsEstimatedNum = parseFloat(worksite.costs_estimated || "0");
    const marginCommitted = budget - costsCommittedNum;
    const marginPercentageCommitted = budget > 0 ? (marginCommitted / budget) * 100 : 0;
    const budgetPercentageUsed = budget > 0 ? (costsCommittedNum / budget) * 100 : 0;

    return {
      budget,
      costsCommitted: costsCommittedNum,
      costsEstimated: costsEstimatedNum,
      marginCommitted,
      marginPercentageCommitted,
      budgetPercentageUsed,
    };
  };

  const filteredAmendments = amendments.filter(amendment => {
    if (amendmentFilter === "all") return true;
    return amendment.status === amendmentFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!worksite) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Chantier non trouvé</div>
      </div>
    );
  }

  const financials = calculateFinancials();

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{worksite.name}</h2>
              <Badge className={getProfitabilityColor(worksite.profitability_status)}>
                {getProfitabilityLabel(worksite.profitability_status)}
              </Badge>
              {(worksite.has_budget_alert || worksite.has_amendment_alert || worksite.has_admin_alert) && (
                <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Alertes
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1">{worksite.address}</p>
          </div>
        </div>
        <Link href={`/dashboard/worksites/${worksiteId}/edit`}>
          <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Récapitulatif financier - Vue rapide en 5 secondes */}
      {financials && (
        <Card className={`rounded-lg border-2 shadow-lg ${
          worksite.profitability_status === "profitable"
            ? "bg-[#00ff88]/10 border-[#00ff88]/50"
            : worksite.profitability_status === "watch"
            ? "bg-orange-500/10 border-orange-500/50"
            : "bg-red-500/10 border-red-500/50"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${
                  worksite.profitability_status === "profitable"
                    ? "text-[#00ff88]"
                    : worksite.profitability_status === "watch"
                    ? "text-orange-500"
                    : "text-red-500"
                }`}>
                  {worksite.profitability_status === "profitable" ? "✓" : "⚠"}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">Rentabilité du chantier</h3>
                    <Badge className={getProfitabilityColor(worksite.profitability_status)}>
                      {getProfitabilityLabel(worksite.profitability_status)}
                    </Badge>
                  </div>
                  <p className={`text-sm ${
                    worksite.profitability_status === "profitable"
                      ? "text-[#00ff88]"
                      : worksite.profitability_status === "watch"
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}>
                    {financials.marginCommitted >= 0 
                      ? `Marge estimée de ${financials.marginPercentageCommitted.toFixed(1)}%`
                      : `Perte estimée de ${Math.abs(financials.marginPercentageCommitted).toFixed(1)}%`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Budget</p>
                  <p className="text-lg font-bold text-white">
                    {financials.budget.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Coûts engagés</p>
                  <p className="text-lg font-bold text-white">
                    {financials.costsCommitted.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Marge</p>
                  <p className={`text-lg font-bold ${
                    financials.marginCommitted >= 0 ? "text-[#00ff88]" : "text-red-500"
                  }`}>
                    {financials.marginCommitted.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-[#262930] border border-[#3a3f47]">
          <TabsTrigger value="info" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
            Infos générales
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
            Suivi financier
          </TabsTrigger>
          <TabsTrigger value="amendments" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
            Avenants {amendments.filter(a => a.status === "pending").length > 0 && `(${amendments.filter(a => a.status === "pending").length})`}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
            <Clock className="mr-2 h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Informations du chantier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Client</p>
                  {worksite.clients?.id ? (
                    <Link href={`/dashboard/clients/${worksite.clients.id}`}>
                      <p className="text-white font-medium hover:text-[#00ff88] cursor-pointer underline">
                        {worksite.clients.name}
                      </p>
                    </Link>
                  ) : (
                    <p className="text-white font-medium">Non renseigné</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Adresse</p>
                  <p className="text-white">{worksite.address}</p>
                </div>
                {worksite.code && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Code chantier</p>
                    <p className="text-white">{worksite.code}</p>
                  </div>
                )}
                {worksite.type && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="text-white">{worksite.type}</p>
                  </div>
                )}
                {worksite.start_date && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date de début</p>
                    <p className="text-white">{format(new Date(worksite.start_date), "dd/MM/yyyy")}</p>
                  </div>
                )}
                {worksite.planned_end_date && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fin prévue</p>
                    <p className="text-white">{format(new Date(worksite.planned_end_date), "dd/MM/yyyy")}</p>
                  </div>
                )}
                {worksite.manager_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Responsable</p>
                    <p className="text-white">{worksite.manager_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Statut</p>
                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                    {worksite.status === "active" ? "Actif" : worksite.status === "completed" ? "Terminé" : worksite.status}
                  </Badge>
                </div>
              </div>
              {worksite.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-white">{worksite.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          {financials && (
            <div className="space-y-6">
              {/* Barre de progression Budget vs Coûts */}
              <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">Budget vs Coûts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Budget utilisé</span>
                      <span className={`font-semibold ${financials.budgetPercentageUsed > 100 ? "text-red-500" : financials.budgetPercentageUsed > 90 ? "text-orange-500" : "text-white"}`}>
                        {financials.budgetPercentageUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#2f343a] rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${financials.budgetPercentageUsed > 100 ? "bg-red-500" : financials.budgetPercentageUsed > 90 ? "bg-orange-500" : "bg-[#00ff88]"}`}
                        style={{ width: `${Math.min(financials.budgetPercentageUsed, 100)}%` }}
                      />
                    </div>
                    {financials.budgetPercentageUsed > 100 && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Budget dépassé de {((financials.budgetPercentageUsed - 100) * financials.budget / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
                      </p>
                    )}
                    {financials.budgetPercentageUsed > 90 && financials.budgetPercentageUsed <= 100 && (
                      <p className="text-sm text-orange-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        90% du budget consommé
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cartes financières */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Budget initial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-white">
                      {financials.budget.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0
                      })}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Coûts estimés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingCosts ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={costsEstimated}
                        onChange={(e) => setCostsEstimated(e.target.value)}
                        className="bg-[#2f343a] border-[#3a3f47] text-white"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {financials.costsEstimated.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Coûts engagés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingCosts ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={costsCommitted}
                        onChange={(e) => setCostsCommitted(e.target.value)}
                        className="bg-[#2f343a] border-[#3a3f47] text-white"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {financials.costsCommitted.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className={`rounded-lg border-0 shadow-md ${
                  financials.marginCommitted >= 0 ? "bg-[#00ff88]/10 border-[#00ff88]/30" : "bg-red-500/10 border-red-500/30"
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm font-medium ${financials.marginCommitted >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                      Marge estimée
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${financials.marginCommitted >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                      {financials.marginCommitted.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0
                      })}
                    </p>
                    <p className={`text-sm mt-1 ${financials.marginPercentageCommitted >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                      {financials.marginPercentageCommitted.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section coûts détaillés - ÉTAPE 1 MVP */}
              <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white">Coûts détaillés</CardTitle>
                    <Dialog open={costDialogOpen} onOpenChange={(open) => {
                      setCostDialogOpen(open);
                      if (!open) {
                        setEditingCostId(null);
                        setCostAmount("");
                        setCostDescription("");
                        setCostDate(new Date().toISOString().split("T")[0]);
                        setCostReference("");
                        setCostCategory("labor");
                        setCostType("committed");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                          onClick={() => {
                            setEditingCostId(null);
                            setCostCategory("labor");
                            setCostType("committed");
                            setCostDate(new Date().toISOString().split("T")[0]);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un coût
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#262930] border-[#3a3f47] text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingCostId ? "Modifier le coût" : "Nouveau coût"}</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            {editingCostId ? "Modifiez les informations du coût." : "Enregistrez un coût pour ce chantier."}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="text-gray-300">Catégorie *</Label>
                            <Select value={costCategory} onValueChange={(value: "labor" | "materials" | "subcontracting" | "other") => setCostCategory(value)}>
                              <SelectTrigger className="bg-[#2f343a] border-[#3a3f47] text-white mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#2f343a] border-[#3a3f47] text-white">
                                <SelectItem value="labor">👷 Main d'œuvre</SelectItem>
                                <SelectItem value="materials">🧱 Matériaux</SelectItem>
                                <SelectItem value="subcontracting">🔧 Sous-traitance</SelectItem>
                                <SelectItem value="other">📋 Divers</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-300">Montant (€) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={costAmount}
                              onChange={(e) => setCostAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Description</Label>
                            <Input
                              value={costDescription}
                              onChange={(e) => setCostDescription(e.target.value)}
                              placeholder="Ex: Béton C25/30, Heures équipe 2..."
                              className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Date *</Label>
                            <Input
                              type="date"
                              value={costDate}
                              onChange={(e) => setCostDate(e.target.value)}
                              className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Référence</Label>
                            <Input
                              value={costReference}
                              onChange={(e) => setCostReference(e.target.value)}
                              placeholder="Ex: Facture #123, BC-456..."
                              className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Type *</Label>
                            <Select value={costType} onValueChange={(value: "estimated" | "committed") => setCostType(value)}>
                              <SelectTrigger className="bg-[#2f343a] border-[#3a3f47] text-white mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#2f343a] border-[#3a3f47] text-white">
                                <SelectItem value="committed">✅ Coût engagé (réel)</SelectItem>
                                <SelectItem value="estimated">📊 Coût estimé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* ÉTAPE 4 : Prévisualisation d'impact ROI */}
                          {impactPreview && costAmount && costType === "committed" && financials && (
                            <div className={`p-4 rounded-lg border-2 ${
                              impactPreview.newStatus === "at_risk" 
                                ? "bg-red-500/10 border-red-500/50" 
                                : impactPreview.newStatus === "watch"
                                ? "bg-orange-500/10 border-orange-500/50"
                                : "bg-[#00ff88]/10 border-[#00ff88]/50"
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className={`h-5 w-5 ${
                                  impactPreview.newStatus === "at_risk" 
                                    ? "text-red-500" 
                                    : impactPreview.newStatus === "watch"
                                    ? "text-orange-500"
                                    : "text-[#00ff88]"
                                }`} />
                                <p className={`font-semibold ${
                                  impactPreview.newStatus === "at_risk" 
                                    ? "text-red-500" 
                                    : impactPreview.newStatus === "watch"
                                    ? "text-orange-500"
                                    : "text-[#00ff88]"
                                }`}>
                                  Impact sur la rentabilité
                                </p>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-300">
                                  Marge après ajout : <span className={`font-bold ${
                                    impactPreview.newMargin >= 0 ? "text-[#00ff88]" : "text-red-500"
                                  }`}>
                                    {impactPreview.newMargin.toLocaleString('fr-FR', {
                                      style: 'currency',
                                      currency: 'EUR',
                                      minimumFractionDigits: 0
                                    })} ({impactPreview.newPercentage.toFixed(1)}%)
                                  </span>
                                </p>
                                <p className="text-gray-400">
                                  Statut : <Badge className={getProfitabilityColor(impactPreview.newStatus)}>
                                    {getProfitabilityLabel(impactPreview.newStatus)}
                                  </Badge>
                                  {impactPreview.newStatus !== worksite?.profitability_status && (
                                    <span className="text-orange-500 ml-2">
                                      {impactPreview.newStatus === "at_risk" && worksite?.profitability_status !== "at_risk" && "⚠️ Chantier passerait en rouge"}
                                      {impactPreview.newStatus === "watch" && worksite?.profitability_status === "profitable" && "⚠️ Chantier passerait en orange"}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setCostDialogOpen(false);
                              setEditingCostId(null);
                              setCostAmount("");
                              setCostDescription("");
                              setCostDate(new Date().toISOString().split("T")[0]);
                              setCostReference("");
                              setCostCategory("labor");
                              setCostType("committed");
                            }}
                            className="border-[#3a3f47] text-gray-300"
                            disabled={creatingCost}
                          >
                            Annuler
                          </Button>
                          <Button
                            type="button"
                            onClick={editingCostId ? updateCost : createCost}
                            disabled={creatingCost || !costAmount}
                            className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                          >
                            {creatingCost ? (editingCostId ? "Modification..." : "Ajout...") : (editingCostId ? "Modifier" : "Ajouter")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingCosts ? (
                    <div className="text-center py-8 text-gray-400">Chargement des coûts...</div>
                  ) : worksiteCosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Aucun coût enregistré. Cliquez sur "Ajouter un coût" pour commencer.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* ÉTAPE 2 : Totaux par catégorie */}
                      {worksiteCosts.length > 0 && (
                        <Card className="bg-[#2f343a] border-[#3a3f47]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-400">Répartition par catégorie</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(calculateCategoryTotals()).map(([category, totals]) => {
                                const total = totals.committed + totals.estimated;
                                if (total === 0) return null;
                                return (
                                  <div key={category} className="p-3 bg-[#262930] rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">{costCategoryLabels[category as keyof typeof costCategoryLabels]}</p>
                                    <p className="text-lg font-bold text-white">
                                      {total.toLocaleString('fr-FR', {
                                        style: 'currency',
                                        currency: 'EUR',
                                        minimumFractionDigits: 0
                                      })}
                                    </p>
                                    {totals.committed > 0 && (
                                      <p className="text-xs text-blue-500 mt-1">
                                        Engagé: {totals.committed.toLocaleString('fr-FR', {
                                          style: 'currency',
                                          currency: 'EUR',
                                          minimumFractionDigits: 0
                                        })}
                                      </p>
                                    )}
                                    {totals.estimated > 0 && (
                                      <p className="text-xs text-orange-500">
                                        Estimé: {totals.estimated.toLocaleString('fr-FR', {
                                          style: 'currency',
                                          currency: 'EUR',
                                          minimumFractionDigits: 0
                                        })}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Liste des coûts avec boutons édition/suppression (ÉTAPE 6) */}
                      <div className="space-y-2">
                        {worksiteCosts.map((cost) => (
                          <div
                            key={cost.id}
                            className="flex items-center justify-between p-3 bg-[#2f343a] rounded-lg border border-[#3a3f47]"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{costCategoryLabels[cost.category]}</span>
                                <Badge className={cost.type === "committed" ? "bg-blue-500/20 text-blue-500" : "bg-orange-500/20 text-orange-500"}>
                                  {cost.type === "committed" ? "Engagé" : "Estimé"}
                                </Badge>
                              </div>
                              {cost.description && (
                                <p className="text-sm text-gray-400 mt-1">{cost.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>{format(new Date(cost.cost_date), "dd/MM/yyyy")}</span>
                                {cost.reference && <span>Ref: {cost.reference}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-lg font-bold text-white">
                                  {parseFloat(cost.amount).toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                  })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditCostDialog(cost)}
                                className="text-gray-400 hover:text-white hover:bg-[#3a3f47]"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog open={deletingCostId === cost.id} onOpenChange={(open) => !open && setDeletingCostId(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingCostId(cost.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#262930] border-[#3a3f47] text-white">
                                  <DialogHeader>
                                    <DialogTitle>Supprimer le coût</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Êtes-vous sûr de vouloir supprimer ce coût ? Cette action est irréversible.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setDeletingCostId(null)}
                                      className="border-[#3a3f47] text-gray-300"
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      onClick={() => deleteCost(cost.id)}
                                      className="bg-red-500 text-white hover:bg-red-600"
                                    >
                                      Supprimer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="amendments">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Avenants / Modifications</CardTitle>
                <Dialog open={amendmentDialogOpen} onOpenChange={setAmendmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvel avenant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#262930] border-[#3a3f47] text-white">
                    <DialogHeader>
                      <DialogTitle>Nouvel avenant</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Enregistrez une modification ou un travail supplémentaire pour ce chantier.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="text-gray-300">Titre *</Label>
                        <Input
                          value={amendmentTitle}
                          onChange={(e) => setAmendmentTitle(e.target.value)}
                          placeholder="Ex: Ajout d'une salle de bain"
                          className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Description *</Label>
                        <Textarea
                          value={amendmentDescription}
                          onChange={(e) => setAmendmentDescription(e.target.value)}
                          placeholder="Décrivez la modification demandée..."
                          className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Impact coût (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={amendmentCostImpact}
                            onChange={(e) => setAmendmentCostImpact(e.target.value)}
                            placeholder="0.00"
                            className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Impact délai (heures)</Label>
                          <Input
                            type="number"
                            value={amendmentTimeImpact}
                            onChange={(e) => setAmendmentTimeImpact(e.target.value)}
                            placeholder="Optionnel"
                            className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setAmendmentDialogOpen(false)}
                        className="border-[#3a3f47] text-gray-300"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={createAmendment}
                        disabled={!amendmentTitle || !amendmentDescription || creatingAmendment}
                        className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                      >
                        {creatingAmendment ? "Création..." : "Créer l'avenant"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {amendments.length > 0 && (
                <div className="mb-4 flex gap-2">
                  <Button
                    variant={amendmentFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmendmentFilter("all")}
                    className={amendmentFilter === "all" ? "bg-[#00ff88] text-black" : "border-[#3a3f47] text-gray-300"}
                  >
                    Tous ({amendments.length})
                  </Button>
                  <Button
                    variant={amendmentFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmendmentFilter("pending")}
                    className={amendmentFilter === "pending" ? "bg-orange-500 text-white" : "border-[#3a3f47] text-gray-300"}
                  >
                    En attente ({amendments.filter(a => a.status === "pending").length})
                  </Button>
                  <Button
                    variant={amendmentFilter === "approved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmendmentFilter("approved")}
                    className={amendmentFilter === "approved" ? "bg-[#00ff88] text-black" : "border-[#3a3f47] text-gray-300"}
                  >
                    Validés ({amendments.filter(a => a.status === "approved").length})
                  </Button>
                  <Button
                    variant={amendmentFilter === "rejected" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmendmentFilter("rejected")}
                    className={amendmentFilter === "rejected" ? "bg-red-500 text-white" : "border-[#3a3f47] text-gray-300"}
                  >
                    Refusés ({amendments.filter(a => a.status === "rejected").length})
                  </Button>
                </div>
              )}

              {loadingAmendments ? (
                <div className="text-center py-8 text-gray-400">Chargement...</div>
              ) : filteredAmendments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {amendments.length === 0 ? "Aucun avenant enregistré pour ce chantier" : "Aucun avenant avec ce filtre"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAmendments.map((amendment) => (
                    <Card key={amendment.id} className="bg-[#2f343a] border-[#3a3f47]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{amendment.title}</h3>
                              <Badge className={
                                amendment.status === "approved" ? "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30" :
                                amendment.status === "rejected" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                                "bg-orange-500/20 text-orange-500 border-orange-500/30"
                              }>
                                {amendment.status === "approved" ? "Validé" :
                                 amendment.status === "rejected" ? "Refusé" :
                                 "En attente"}
                              </Badge>
                            </div>
                            <p className="text-gray-300 mb-3">{amendment.description}</p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Impact coût:</span>
                                <span className="text-white font-semibold ml-2">
                                  {parseFloat(amendment.cost_impact || "0").toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                  })}
                                </span>
                              </div>
                              {amendment.time_impact_hours && (
                                <div>
                                  <span className="text-gray-500">Impact délai:</span>
                                  <span className="text-white font-semibold ml-2">{amendment.time_impact_hours}h</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">Date demande:</span>
                                <span className="text-white font-semibold ml-2">
                                  {format(new Date(amendment.requested_at), "dd/MM/yyyy")}
                                </span>
                              </div>
                            </div>
                            {amendment.decision_notes && (
                              <div className="mt-3 p-3 bg-[#262930] rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Notes de décision:</p>
                                <p className="text-white text-sm">{amendment.decision_notes}</p>
                              </div>
                            )}
                          </div>
                          {amendment.status === "pending" && (
                            <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                              <Button
                                type="button"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDecisionDialog(amendment.id, "approved");
                                }}
                                className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDecisionDialog(amendment.id, "rejected");
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ÉTAPE 5 : Timeline/Historique */}
        <TabsContent value="timeline">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique du chantier
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="text-center py-8 text-gray-400">Chargement de l'historique...</div>
              ) : worksiteEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Aucun événement enregistré pour ce chantier.
                </div>
              ) : (
                <div className="space-y-4">
                  {worksiteEvents.map((event, index) => {
                    const getEventIcon = () => {
                      switch(event.event_type) {
                        case "creation": return "📅";
                        case "cost_added": return "💰";
                        case "cost_updated": return "✏️";
                        case "cost_deleted": return "🗑️";
                        case "amendment_created": return "📝";
                        case "amendment_approved": return "✅";
                        case "amendment_rejected": return "❌";
                        case "status_changed": return "🔄";
                        case "budget_updated": return "📊";
                        default: return "📌";
                      }
                    };

                    const getEventColor = () => {
                      switch(event.event_type) {
                        case "creation": return "text-blue-500";
                        case "cost_added": return "text-green-500";
                        case "cost_updated": return "text-yellow-500";
                        case "cost_deleted": return "text-red-500";
                        case "amendment_created": return "text-orange-500";
                        case "amendment_approved": return "text-[#00ff88]";
                        case "amendment_rejected": return "text-red-500";
                        case "status_changed": return "text-purple-500";
                        case "budget_updated": return "text-cyan-500";
                        default: return "text-gray-500";
                      }
                    };

                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor()} bg-[#2f343a] text-xl`}>
                            {getEventIcon()}
                          </div>
                          {index < worksiteEvents.length - 1 && (
                            <div className="w-0.5 h-full bg-[#3a3f47] mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            <span className="text-xs text-gray-500">
                              {format(new Date(event.event_date), "dd/MM/yyyy à HH:mm")}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-400 mb-2">{event.description}</p>
                          )}
                          {event.metadata && typeof event.metadata === 'object' && (
                            <div className="text-xs text-gray-500">
                              {event.metadata.amount && (
                                <span>Montant: {parseFloat(event.metadata.amount || "0").toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR',
                                  minimumFractionDigits: 0
                                })}</span>
                              )}
                              {event.metadata.category && (
                                <span className="ml-3">Catégorie: {costCategoryLabels[event.metadata.category as keyof typeof costCategoryLabels]}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour valider/refuser un avenant */}
      <Dialog open={decisionDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setDecisionDialogOpen(false);
          setDecisionNotes("");
          setDecisionAmendmentId(null);
          setDecisionType(null);
        }
      }}>
        <DialogContent className="bg-[#262930] border-[#3a3f47] text-white">
          <DialogHeader>
            <DialogTitle>
              {decisionType === "approved" ? "Valider l'avenant" : decisionType === "rejected" ? "Refuser l'avenant" : "Décision"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {decisionType === "approved" 
                ? "Validez cet avenant. Le budget du chantier sera automatiquement mis à jour."
                : decisionType === "rejected"
                ? "Indiquez la raison du refus (optionnel)."
                : ""}
            </DialogDescription>
          </DialogHeader>
          {decisionType && (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-gray-300">
                    {decisionType === "approved" ? "Notes de validation (optionnel)" : "Raison du refus (optionnel)"}
                  </Label>
                  <Textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder={decisionType === "approved" 
                      ? "Ajoutez des notes si nécessaire..."
                      : "Expliquez pourquoi cet avenant est refusé..."}
                    className="bg-[#2f343a] border-[#3a3f47] text-white mt-1"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDecisionDialogOpen(false);
                    setDecisionNotes("");
                    setDecisionAmendmentId(null);
                    setDecisionType(null);
                  }}
                  className="border-[#3a3f47] text-gray-300"
                  disabled={processingDecision}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleDecisionSubmit}
                  disabled={processingDecision || !decisionAmendmentId}
                  className={
                    decisionType === "approved" 
                      ? "bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  {processingDecision 
                    ? "Traitement..." 
                    : decisionType === "approved" 
                      ? "Valider" 
                      : "Refuser"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
