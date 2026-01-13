import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle,
  CheckCircle2,
  Euro,
  Clock
} from "lucide-react";

// Données statiques de démonstration
const MOCK_DECISIONS = [
  {
    id: "1",
    chantierNom: "Résidence Les Jardins",
    statut: "À risque",
    probleme: "Un dépassement de coût nécessite une décision",
    impactType: "marge",
    impactValeur: -8500,
    origine: "ajout de coût",
    badge: "red"
  },
  {
    id: "2",
    chantierNom: "Immeuble Voltaire",
    statut: "À surveiller",
    probleme: "Des coûts ont été engagés sans couverture prévue",
    impactType: "marge",
    impactValeur: -3200,
    origine: "événement terrain",
    badge: "orange"
  },
  {
    id: "3",
    chantierNom: "Centre Commercial Atlantis",
    statut: "À risque",
    probleme: "Un événement terrain impacte la marge prévisionnelle",
    impactType: "délai",
    impactValeur: 5,
    origine: "écart marge",
    badge: "red"
  }
];

export default function Alertes() {
  const [filter, setFilter] = useState<"toutes" | "en_attente" | "expirees">("en_attente");
  
  // Pour la démo, on affiche toujours les décisions mockées
  const decisionsAffichees = filter === "en_attente" ? MOCK_DECISIONS : [];

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Décisions à prendre</h1>
        </div>
        
        {/* Filtres UI uniquement */}
        <div className="flex gap-2">
          <Button
            variant={filter === "toutes" ? "default" : "outline"}
            onClick={() => setFilter("toutes")}
            className={filter === "toutes" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
          >
            Toutes
          </Button>
          <Button
            variant={filter === "en_attente" ? "default" : "outline"}
            onClick={() => setFilter("en_attente")}
            className={filter === "en_attente" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
          >
            En attente
          </Button>
          <Button
            variant={filter === "expirees" ? "default" : "outline"}
            onClick={() => setFilter("expirees")}
            className={filter === "expirees" ? "bg-[#00ff88] text-black hover:bg-[#00ff88]" : "border-gray-600 text-gray-300"}
          >
            Expirées
          </Button>
        </div>
      </div>

      {/* Zone principale : Liste de décisions */}
      <div className="space-y-4">
        {decisionsAffichees.length === 0 ? (
          // État vide
          <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <div>
                  <p className="text-xl font-semibold text-white mb-2">Aucune décision en attente</p>
                  <p className="text-gray-400">Tout est à jour</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Cartes de décisions
          decisionsAffichees.map((decision) => (
            <Card 
              key={decision.id} 
              className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg hover:border-gray-700 transition-all"
            >
              <CardContent className="p-6">
                {/* Ligne 1 : En-tête avec nom du chantier et badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{decision.chantierNom}</h3>
                    <Badge 
                      className={`${
                        decision.badge === "red" 
                          ? "bg-red-500/20 text-red-400 border-red-500/30" 
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      } border px-3 py-1`}
                    >
                      {decision.statut}
                    </Badge>
                  </div>
                </div>

                {/* Ligne 2 : Problème */}
                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                  {decision.probleme}
                </p>

                {/* Ligne 3 : Impact visible */}
                <div className="flex items-center gap-2 mb-3">
                  {decision.impactType === "marge" ? (
                    <>
                      <Euro className="h-5 w-5 text-red-400" />
                      <span className="text-lg font-semibold text-red-400">
                        Impact marge : {decision.impactValeur.toLocaleString('fr-FR')} €
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-orange-400" />
                      <span className="text-lg font-semibold text-orange-400">
                        Impact délai : +{decision.impactValeur} jours
                      </span>
                    </>
                  )}
                </div>

                {/* Ligne 4 : Origine */}
                <p className="text-sm text-gray-500 mb-5">
                  Détecté suite à : {decision.origine}
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
    </div>
  );
}

