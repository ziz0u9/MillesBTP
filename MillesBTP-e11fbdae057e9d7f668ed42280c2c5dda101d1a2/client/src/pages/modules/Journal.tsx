import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Euro,
  Clock,
  Eye,
  ArrowUpDown
} from "lucide-react";

// Données statiques de démonstration pour le journal terrain
const MOCK_EVENEMENTS = [
  {
    id: "1",
    date: "12/01/2026",
    chantier: "Résidence Les Jardins",
    type: "Changement client",
    typeBadge: "blue",
    description: "Travaux supplémentaires demandés",
    impactType: "cout",
    impactValeur: 2500,
    statut: "Pris en compte",
    statutBadge: "green"
  },
  {
    id: "2",
    date: "11/01/2026",
    chantier: "Immeuble Voltaire",
    type: "Retard",
    typeBadge: "orange",
    description: "Retard livraison béton",
    impactType: "delai",
    impactValeur: -3,
    statut: "Lié à un écart",
    statutBadge: "purple"
  },
  {
    id: "3",
    date: "10/01/2026",
    chantier: "Centre Commercial Atlantis",
    type: "Coût",
    typeBadge: "red",
    description: "Heures MO supplémentaires",
    impactType: "cout",
    impactValeur: 4200,
    statut: "À analyser",
    statutBadge: "yellow"
  },
  {
    id: "4",
    date: "09/01/2026",
    chantier: "Résidence Les Jardins",
    type: "Info terrain",
    typeBadge: "gray",
    description: "Visite client - validation état d'avancement",
    impactType: "none",
    impactValeur: 0,
    statut: "Pris en compte",
    statutBadge: "green"
  },
  {
    id: "5",
    date: "08/01/2026",
    chantier: "Tour Horizon",
    type: "Incident",
    typeBadge: "red",
    description: "Problème étanchéité toiture",
    impactType: "cout",
    impactValeur: 8500,
    statut: "Lié à un écart",
    statutBadge: "purple"
  }
];

export default function Journal() {
  const [triPar, setTriPar] = useState<"date" | null>("date");
  const [ordreDesc, setOrdreDesc] = useState(true);

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Journal terrain</h1>
          <p className="text-gray-400 text-sm">Voir rapidement ce qui s'est passé, quand, où, et avec quel impact</p>
        </div>
      </div>

      {/* Table des événements */}
      <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1115] border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">
                    <button 
                      className="flex items-center gap-2 hover:text-white transition-colors"
                      onClick={() => setOrdreDesc(!ordreDesc)}
                    >
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Chantier</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Type d'événement</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Description</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Impact</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Statut</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {MOCK_EVENEMENTS.map((evenement) => (
                  <tr 
                    key={evenement.id} 
                    className="hover:bg-[#1f2329] transition-colors"
                  >
                    {/* Date */}
                    <td className="p-4">
                      <span className="text-white font-medium">{evenement.date}</span>
                    </td>

                    {/* Chantier */}
                    <td className="p-4">
                      <button className="text-blue-400 hover:text-blue-300 hover:underline transition-colors text-left">
                        {evenement.chantier}
                      </button>
                    </td>

                    {/* Type d'événement */}
                    <td className="p-4">
                      <Badge className={`${getBadgeColor(evenement.typeBadge)} border px-3 py-1`}>
                        {evenement.type}
                      </Badge>
                    </td>

                    {/* Description */}
                    <td className="p-4">
                      <span className="text-gray-300 text-sm">{evenement.description}</span>
                    </td>

                    {/* Impact */}
                    <td className="p-4">
                      {evenement.impactType === "cout" ? (
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 font-semibold">
                            +{evenement.impactValeur.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      ) : evenement.impactType === "delai" ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-400" />
                          <span className="text-orange-400 font-semibold">
                            {evenement.impactValeur} jours
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="p-4">
                      <Badge className={`${getBadgeColor(evenement.statutBadge)} border px-3 py-1`}>
                        {evenement.statut}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-center">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-transparent cursor-default"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

