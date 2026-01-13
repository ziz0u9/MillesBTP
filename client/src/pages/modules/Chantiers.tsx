import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";

// Données statiques cohérentes avec les autres pages
const MOCK_CHANTIERS = [
  {
    id: "1",
    nom: "Résidence Les Jardins",
    client: "SCI Les Jardins",
    adresse: "12 Avenue des Fleurs, 75016 Paris",
    typeChantier: "Résidentiel",
    montantTotal: 450000,
    margeReference: 85000,
    margePrevuePct: 18.9,
    coutsEngages: 93500,
    margeEnCours: 356500,
    margeEnCoursPct: 79.2,
    delaiPrevu: 180,
    delaiProjete: 180,
    statutReel: "a_surveiller",
    priorite: "Écart détecté",
    dateDebut: "15/09/2024",
    dernierActivite: "02/01/2026"
  },
  {
    id: "2",
    nom: "Immeuble Voltaire",
    client: "Voltaire Promotion",
    adresse: "45 Boulevard Voltaire, 75011 Paris",
    typeChantier: "Collectif",
    montantTotal: 680000,
    margeReference: 130000,
    margePrevuePct: 19.1,
    coutsEngages: 186800,
    margeEnCours: 493200,
    margeEnCoursPct: 72.5,
    delaiPrevu: 240,
    delaiProjete: 240,
    statutReel: "a_surveiller",
    priorite: "Écart détecté",
    dateDebut: "01/10/2024",
    dernierActivite: "03/01/2026"
  },
  {
    id: "3",
    nom: "Centre Commercial Atlantis",
    client: "Atlantis Développement",
    adresse: "Zone commerciale Nord, 44000 Nantes",
    typeChantier: "Commercial",
    montantTotal: 1250000,
    margeReference: 245000,
    margePrevuePct: 19.6,
    coutsEngages: 425000,
    margeEnCours: 825000,
    margeEnCoursPct: 66.0,
    delaiPrevu: 365,
    delaiProjete: 372,
    statutReel: "sous_controle",
    priorite: "Rien à signaler",
    dateDebut: "01/06/2024",
    dernierActivite: "03/01/2026"
  },
  {
    id: "4",
    nom: "Tour Horizon",
    client: "Horizon Immobilier",
    adresse: "Quartier d'affaires, 69003 Lyon",
    typeChantier: "Bureaux",
    montantTotal: 920000,
    margeReference: 180000,
    margePrevuePct: 19.6,
    coutsEngages: 711500,
    margeEnCours: 208500,
    margeEnCoursPct: 22.7,
    delaiPrevu: 300,
    delaiProjete: 300,
    statutReel: "sous_controle",
    priorite: "Rien à signaler",
    dateDebut: "15/03/2024",
    dernierActivite: "02/01/2026"
  },
  {
    id: "5",
    nom: "Résidence Les Pins",
    client: "Les Pins SCI",
    adresse: "Route des Pins, 06400 Cannes",
    typeChantier: "Résidentiel",
    montantTotal: 580000,
    margeReference: 95000,
    margePrevuePct: 16.4,
    coutsEngages: 469800,
    margeEnCours: 110200,
    margeEnCoursPct: 19.0,
    delaiPrevu: 210,
    delaiProjete: 210,
    statutReel: "sous_controle",
    priorite: "Rien à signaler",
    dateDebut: "10/04/2024",
    dernierActivite: "01/01/2026"
  }
];

export default function Chantiers() {
  const [selectedChantier, setSelectedChantier] = useState<string | null>(null);

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
      case "a_risque":
        return "À risque";
      case "a_surveiller":
        return "À surveiller";
      default:
        return "Sous contrôle";
    }
  };

    return (
      <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mes chantiers</h1>
          <p className="text-gray-400 text-sm">Où en est chaque chantier ?</p>
        </div>
      </div>

      {/* Liste des chantiers */}
      <div className="grid gap-4">
        {MOCK_CHANTIERS.map((chantier) => (
          <Card 
            key={chantier.id} 
            className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg hover:border-gray-700 transition-all"
          >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                  {/* En-tête avec badges */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-xl font-bold text-white">{chantier.nom}</h3>
                    <Badge 
                      className={`px-3 py-1 border ${getStatutReelColor(chantier.statutReel)}`}
                    >
                      {getStatutReelLabel(chantier.statutReel)}
                    </Badge>
                    <Badge 
                      className={`px-3 py-1 border ${
                        chantier.priorite === "Décision requise" 
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : chantier.priorite === "Écart détecté"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }`}
                    >
                      {chantier.priorite}
                    </Badge>
                      </div>
                      
                  {/* Informations client */}
                  <p className="text-sm text-gray-300 mb-1">{chantier.client}</p>
                  <p className="text-xs text-gray-400 mb-1">{chantier.adresse}</p>
                  <p className="text-xs text-gray-500 mb-4">Type : {chantier.typeChantier}</p>

                  {/* Grille d'informations */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Montant total</p>
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(chantier.montantTotal)}
                      </p>
                    </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Marge de référence</p>
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(chantier.margeReference)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chantier.margePrevuePct.toFixed(1)}%
                      </p>
                        </div>
                        <div>
                      <p className="text-xs text-gray-400 mb-1">Coûts engagés</p>
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(chantier.coutsEngages)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((chantier.coutsEngages / chantier.montantTotal) * 100).toFixed(1)}% du total
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Marge en cours</p>
                              <p className={`text-sm font-semibold ${
                        chantier.margeEnCours < chantier.margeReference ? "text-orange-400" : "text-green-400"
                      }`}>
                        {formatCurrency(chantier.margeEnCours)}
                      </p>
                      {chantier.margeEnCours < chantier.margeReference && (
                        <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Écart de {formatCurrency(chantier.margeReference - chantier.margeEnCours)}
                        </p>
                          )}
                        </div>
                  </div>

                  {/* Délais */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Délai prévu</p>
                          <p className="text-sm font-semibold text-white">
                        {chantier.delaiPrevu} jours
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Délai projeté</p>
                          <p className={`text-sm font-semibold ${
                        chantier.delaiProjete > chantier.delaiPrevu ? "text-red-400" : "text-green-400"
                          }`}>
                        {chantier.delaiProjete} jours
                          </p>
                      {chantier.delaiProjete > chantier.delaiPrevu && (
                            <p className="text-xs text-red-400 mt-1">
                              Retard de {chantier.delaiProjete - chantier.delaiPrevu} jours
                            </p>
                          )}
                        </div>
                      </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Démarré le {chantier.dateDebut}</span>
                      <span>Dernière activité : {chantier.dernierActivite}</span>
                        </div>
                  </div>
                    </div>

                {/* Actions */}
                <div className="ml-6 flex flex-col gap-2">
                  {chantier.priorite === "Écart détecté" && (
                    <Link href="/dashboard/alertes">
                      <Button 
                        size="sm" 
                        className="bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 cursor-default"
                      >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Voir l'alerte
                          </Button>
                        </Link>
                      )}
                  <Link href={`/dashboard/chantiers/${chantier.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                      className="border-gray-600 text-gray-300 hover:bg-transparent cursor-default"
                    >
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
        ))}
                        </div>

      {/* État vide (caché car on a des chantiers) */}
      {MOCK_CHANTIERS.length === 0 && (
        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardContent className="p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <Building2 className="h-16 w-16 text-gray-500" />
                    <div>
                <p className="text-xl font-semibold text-white mb-2">Aucun chantier</p>
                <p className="text-gray-400">Créez votre premier chantier</p>
              </div>
                    </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
