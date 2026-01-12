import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  CheckCircle2,
  Euro,
  Clock,
  FileCheck
} from "lucide-react";

// Données statiques de démonstration pour les ÉCARTS
const MOCK_ECARTS = [
  {
    id: "1",
    chantierNom: "Résidence Les Jardins",
    typeBadge: "Écart coût",
    statutBadge: "Nouveau",
    probleme: "Coût engagé sans couverture prévue",
    impactType: "marge",
    impactValeur: -4200,
    origine: "ajout de coût",
    badgeColor: "orange",
    statutColor: "blue"
  },
  {
    id: "2",
    chantierNom: "Immeuble Voltaire",
    typeBadge: "Écart MO",
    statutBadge: "En décision",
    probleme: "Dépassement heures main-d'œuvre",
    impactType: "marge",
    impactValeur: -6800,
    origine: "événement terrain",
    badgeColor: "red",
    statutColor: "yellow"
  },
  {
    id: "3",
    chantierNom: "Centre Commercial Atlantis",
    typeBadge: "Écart délai",
    statutBadge: "Nouveau",
    probleme: "Retard livraison matériaux impactant le planning",
    impactType: "délai",
    impactValeur: 7,
    origine: "événement terrain",
    badgeColor: "orange",
    statutColor: "blue"
  }
];

// Données statiques de démonstration pour les AVENANTS
const MOCK_AVENANTS = [
  {
    id: "av1",
    chantierNom: "Tour Horizon",
    numero: "AV-003",
    description: "Modification structure porteuse suite étude sol",
    montant: 28500,
    delaiSupplementaire: 12,
    statut: "Validé",
    dateCreation: "15/12/2024"
  },
  {
    id: "av2",
    chantierNom: "Résidence Les Pins",
    numero: "AV-002",
    description: "Ajout isolation phonique demandée par le client",
    montant: 15200,
    delaiSupplementaire: 0,
    statut: "En attente",
    dateCreation: "10/12/2024"
  }
];

export default function Ecarts() {
  const [ongletActif, setOngletActif] = useState<"ecarts" | "avenants">("ecarts");
  const [filter, setFilter] = useState<"tous" | "nouveau" | "en_decision" | "avenant_cree">("tous");
  
  // Filtrer les écarts selon le filtre actif
  const ecartsAffiches = filter === "tous" 
    ? MOCK_ECARTS 
    : filter === "nouveau"
    ? MOCK_ECARTS.filter(e => e.statutBadge === "Nouveau")
    : filter === "en_decision"
    ? MOCK_ECARTS.filter(e => e.statutBadge === "En décision")
    : [];

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Écarts constatés</h1>
          <p className="text-gray-400 text-sm">Quels écarts nécessitent une action ?</p>
        </div>
      </div>

      {/* Onglets Écarts / Avenants */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <Button
          variant={ongletActif === "ecarts" ? "default" : "ghost"}
          onClick={() => setOngletActif("ecarts")}
          className={ongletActif === "ecarts" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "text-gray-400 hover:text-white"}
        >
          Écarts
        </Button>
        <Button
          variant={ongletActif === "avenants" ? "default" : "ghost"}
          onClick={() => setOngletActif("avenants")}
          className={ongletActif === "avenants" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "text-gray-400 hover:text-white"}
        >
          Avenants
        </Button>
      </div>

      {/* Contenu selon l'onglet actif */}
      {ongletActif === "ecarts" ? (
        <>
          {/* Filtres pour les écarts */}
          <div className="flex gap-2">
            <Button
              variant={filter === "tous" ? "default" : "outline"}
              onClick={() => setFilter("tous")}
              className={filter === "tous" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
            >
              Tous
            </Button>
            <Button
              variant={filter === "nouveau" ? "default" : "outline"}
              onClick={() => setFilter("nouveau")}
              className={filter === "nouveau" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
            >
              Nouveaux
            </Button>
            <Button
              variant={filter === "en_decision" ? "default" : "outline"}
              onClick={() => setFilter("en_decision")}
              className={filter === "en_decision" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
            >
              En décision
            </Button>
            <Button
              variant={filter === "avenant_cree" ? "default" : "outline"}
              onClick={() => setFilter("avenant_cree")}
              className={filter === "avenant_cree" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
            >
              Avenants créés
            </Button>
          </div>

          {/* Liste des écarts */}
          <div className="space-y-4">
            {ecartsAffiches.length === 0 ? (
              // État vide
              <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
                <CardContent className="p-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">Aucun écart constaté</p>
                      <p className="text-gray-400">Tout est conforme</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Cartes d'écarts
              ecartsAffiches.map((ecart) => (
                <Card 
                  key={ecart.id} 
                  className={`rounded-xl border-2 shadow-lg hover:border-gray-600 transition-all ${
                    ecart.badgeColor === "red" 
                      ? "bg-[#1a1d24] border-red-500/30" 
                      : "bg-[#1a1d24] border-orange-500/30"
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Ligne 1 : Contexte - Nom du chantier + Badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{ecart.chantierNom}</h3>
                        <Badge 
                          className={`${
                            ecart.badgeColor === "red" 
                              ? "bg-red-500/20 text-red-400 border-red-500/30" 
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          } border px-3 py-1`}
                        >
                          {ecart.typeBadge}
                        </Badge>
                        <Badge 
                          className={`${
                            ecart.statutColor === "blue" 
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          } border px-3 py-1`}
                        >
                          {ecart.statutBadge}
                        </Badge>
                      </div>
                    </div>

                    {/* Ligne 2 : Problème */}
                    <p className="text-gray-300 text-base mb-4 leading-relaxed">
                      {ecart.probleme}
                    </p>

                    {/* Ligne 3 : Impact visible */}
                    <div className="flex items-center gap-2 mb-3">
                      {ecart.impactType === "marge" ? (
                        <>
                          <Euro className="h-5 w-5 text-red-400" />
                          <span className="text-lg font-semibold text-red-400">
                            Impact marge : {ecart.impactValeur.toLocaleString('fr-FR')} €
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-5 w-5 text-orange-400" />
                          <span className="text-lg font-semibold text-orange-400">
                            Impact délai : +{ecart.impactValeur} jours
                          </span>
                        </>
                      )}
                    </div>

                    {/* Ligne 4 : Origine */}
                    <p className="text-sm text-gray-500 mb-5">
                      Détecté suite à : {ecart.origine}
                    </p>

                    {/* Ligne 5 : Actions possibles (UI SEULEMENT) */}
                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                      <Button 
                        className="bg-[#00ff88] text-black hover:bg-[#00ff88] font-semibold cursor-default"
                      >
                        Corriger
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-transparent cursor-default"
                      >
                        Régulariser
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:bg-transparent cursor-default"
                      >
                        Assumer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        // Onglet AVENANTS
        <div className="space-y-4">
          {MOCK_AVENANTS.length === 0 ? (
            // État vide
            <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
              <CardContent className="p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <FileText className="h-16 w-16 text-gray-500" />
                  <div>
                    <p className="text-xl font-semibold text-white mb-2">Aucun avenant créé</p>
                    <p className="text-gray-400">Les avenants apparaîtront ici</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Cartes d'avenants
            MOCK_AVENANTS.map((avenant) => (
              <Card 
                key={avenant.id} 
                className="bg-[#1a1d24] rounded-xl border-2 border-blue-500/30 shadow-lg hover:border-blue-500/50 transition-all"
              >
                <CardContent className="p-6">
                  {/* En-tête avec icône document */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-6 w-6 text-blue-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{avenant.numero}</h3>
                        <p className="text-sm text-gray-400">{avenant.chantierNom}</p>
                      </div>
                    </div>
                    <Badge 
                      className={`${
                        avenant.statut === "Validé" 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      } border px-3 py-1`}
                    >
                      {avenant.statut}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-base mb-4 leading-relaxed">
                    {avenant.description}
                  </p>

                  {/* Impacts */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Euro className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Montant</p>
                        <p className="text-lg font-semibold text-white">
                          {avenant.montant.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Délai supplémentaire</p>
                        <p className="text-lg font-semibold text-white">
                          {avenant.delaiSupplementaire > 0 ? `+${avenant.delaiSupplementaire} jours` : "Aucun"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date de création */}
                  <p className="text-sm text-gray-500 pt-4 border-t border-gray-800">
                    Créé le {avenant.dateCreation}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

