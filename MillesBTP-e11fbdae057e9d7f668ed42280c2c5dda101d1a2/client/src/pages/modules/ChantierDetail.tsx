import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Calendar, Euro, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface ChantierDetail {
  id: string;
  nom: string;
  client: string;
  adresse: string | null;
  statutAdministratif: string;
  statutReel: string;
  margeReference: number;
  coutsEngages: number;
  delaiPrevu: number | null;
  delaiProjete: number | null;
  dateDebut: string | null;
  dateFinPrevue: string | null;
  montantTotal: number;
  dernierActivite: string | null;
}

export default function ChantierDetail() {
  const [location] = useLocation();
  const { session } = useSession();
  
  // Extraire l'ID du chantier depuis l'URL
  const match = location.match(/\/dashboard\/chantiers\/(.+)$/);
  const chantierId = match ? match[1] : null;
  
  // Charger les détails du chantier
  const { data: chantier, isLoading } = useQuery({
    queryKey: ["chantier", chantierId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user || !chantierId) return null;
      
      // Récupérer la session si nécessaire
      let currentSession = session;
      if (!currentSession?.user) {
        const { data: { session: freshSession } } = await supabase.auth.getSession();
        currentSession = freshSession;
      }
      
      if (!currentSession?.user) return null;
      
      const { data, error } = await supabase
        .from("chantiers")
        .select("*")
        .eq("id", chantierId)
        .eq("user_id", currentSession.user.id)
        .single();

      if (error) {
        console.error("Erreur chargement chantier:", error);
        throw error;
      }

      return {
        id: data.id,
        nom: data.nom,
        client: data.client,
        adresse: data.adresse,
        statutAdministratif: data.statut_administratif || "en_cours",
        statutReel: data.statut_reel || "non_mesure",
        margeReference: parseFloat(data.marge_prevue || "0"),
        coutsEngages: parseFloat(data.marge_projetee || "0"),
        delaiPrevu: data.delai_prevu,
        delaiProjete: data.delai_projete,
        dateDebut: data.date_debut,
        dateFinPrevue: data.date_fin_prevue,
        montantTotal: parseFloat(data.montant_total || "0"),
        dernierActivite: data.dernier_activite,
      } as ChantierDetail;
    },
    enabled: !!session?.user && !!chantierId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatutReelColor = (statut: string) => {
    switch (statut) {
      case "non_mesure":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "a_risque":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "a_surveiller":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      default:
        return "text-green-400 bg-green-500/20 border-green-500/30";
    }
  };

  const getStatutReelLabel = (statut: string) => {
    switch (statut) {
      case "non_mesure":
        return "À surveiller – chantier non mesuré";
      case "a_risque":
        return "À risque";
      case "a_surveiller":
        return "À surveiller";
      default:
        return "Sous contrôle";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4">Chantier introuvable</h2>
          <p className="text-gray-400 mb-4">Le chantier demandé n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
          <Link href="/dashboard/chantiers">
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
              Retour aux chantiers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const margeActuelle = !chantier.coutsEngages || chantier.coutsEngages === 0 
    ? null 
    : chantier.montantTotal - chantier.coutsEngages;
  
  const margeActuellePercent = margeActuelle !== null && chantier.montantTotal > 0
    ? (margeActuelle / chantier.montantTotal) * 100
    : null;

  const margeReferencePercent = chantier.margeReference > 0 && chantier.montantTotal > 0
    ? (chantier.margeReference / chantier.montantTotal) * 100
    : null;

  const ecartMarge = margeActuelle !== null && chantier.margeReference > 0
    ? margeActuelle - chantier.margeReference
    : null;

  const ecartDelai = chantier.delaiProjete && chantier.delaiPrevu 
    ? chantier.delaiProjete - chantier.delaiPrevu 
    : null;

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/chantiers">
            <Button variant="outline" className="border-[#3a3f47] text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{chantier.nom}</h2>
            <p className="text-gray-400 text-sm">Détails du chantier</p>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Client</p>
              <p className="text-white font-semibold">{chantier.client}</p>
            </div>
            {chantier.adresse && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Adresse</p>
                <p className="text-white">{chantier.adresse}</p>
              </div>
            )}
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatutReelColor(chantier.statutReel)}`}>
                {getStatutReelLabel(chantier.statutReel)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/30">
                {chantier.statutAdministratif === "en_cours" ? "En cours" : 
                 chantier.statutAdministratif === "termine" ? "Terminé" : "Annulé"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Financier */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Financier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Montant total</p>
              <p className="text-white font-semibold text-lg">{formatCurrency(chantier.montantTotal)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Marge de référence</p>
              <p className="text-white font-semibold">{formatCurrency(chantier.margeReference)} {margeReferencePercent ? `(${margeReferencePercent.toFixed(1)}%)` : ""}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Coûts engagés</p>
              <p className="text-white font-semibold">{formatCurrency(chantier.coutsEngages)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">
                {chantier.coutsEngages && chantier.coutsEngages > 0 ? "Marge en cours" : "Marge prévue"}
              </p>
              {chantier.coutsEngages && chantier.coutsEngages > 0 ? (
                <>
                  <p className={`font-semibold ${margeActuelle >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatCurrency(margeActuelle)} {margeActuellePercent ? `(${margeActuellePercent.toFixed(1)}%)` : ""}
                  </p>
                  {ecartMarge !== null && ecartMarge !== 0 && (
                    <p className={`text-xs mt-1 ${ecartMarge >= 0 ? "text-green-400" : "text-red-400"}`}>
                      Écart: {ecartMarge > 0 ? "+" : ""}{formatCurrency(ecartMarge)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-white font-semibold">{formatCurrency(chantier.margeReference)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Délais */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Délais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chantier.dateDebut && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Date de début</p>
                <p className="text-white">
                  {format(new Date(chantier.dateDebut), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
            {chantier.dateFinPrevue && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Date de fin prévue</p>
                <p className="text-white">
                  {format(new Date(chantier.dateFinPrevue), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-sm mb-1">Délai prévu</p>
              <p className="text-white font-semibold">{chantier.delaiPrevu || "N/A"} jours</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Délai projeté</p>
              <p className={`font-semibold ${ecartDelai && ecartDelai <= 0 ? "text-green-400" : ecartDelai && ecartDelai > 0 ? "text-red-400" : "text-white"}`}>
                {chantier.delaiProjete || "N/A"} jours
              </p>
              {ecartDelai !== null && ecartDelai !== 0 && (
                <p className={`text-xs mt-1 ${ecartDelai > 0 ? "text-red-400" : "text-green-400"}`}>
                  {ecartDelai > 0 ? "+" : ""}{ecartDelai} jours
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dernière activité */}
        {chantier.dernierActivite && (
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dernière activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                {format(new Date(chantier.dernierActivite), "dd MMMM yyyy à HH:mm", { locale: fr })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

