import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Building2,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react";

// Données statiques cohérentes pour le dashboard
const MOCK_CHANTIERS_SURVEILLER = [
  {
    id: "1",
    nom: "Résidence Les Jardins",
    client: "SCI Les Jardins",
    signal: "🟠 À surveiller",
    tendance: "se_degrade" as const,
    actionSuggeree: "Vérifier l'évolution des coûts"
  },
  {
    id: "2",
    nom: "Immeuble Voltaire",
    client: "Voltaire Promotion",
    signal: "🟠 À surveiller",
    tendance: "se_degrade" as const,
    actionSuggeree: "Analyser dépassement MO"
  }
];

const MOCK_DECISIONS = [
  {
    id: "1",
    chantierId: "1",
    chantierNom: "Résidence Les Jardins",
    question: "Un dépassement de coût nécessite une décision",
    impactEstime: 8500,
    deadline: null
  },
  {
    id: "2",
    chantierId: "2",
    chantierNom: "Immeuble Voltaire",
    question: "Des coûts ont été engagés sans couverture prévue",
    impactEstime: 3200,
    deadline: null
  },
  {
    id: "3",
    chantierId: "3",
    chantierNom: "Centre Commercial Atlantis",
    question: "Un événement terrain impacte la marge prévisionnelle",
    impactEstime: 5000,
    deadline: null
  }
];

const MOCK_AVENANTS = [
  {
    id: "av1",
    chantierId: "4",
    chantierNom: "Tour Horizon",
    numero: "AV-003",
    montant: 28500,
    statut: "validé",
    envoyeLe: "2024-12-15"
  },
  {
    id: "av2",
    chantierId: "5",
    chantierNom: "Résidence Les Pins",
    numero: "AV-002",
    montant: 15200,
    statut: "en attente",
    envoyeLe: "2024-12-10"
  }
];

const STATS_GLOBALES = {
  margeGlobaleEnCours: 764000,
  margeGlobalePrevue: 735000,
  nbChantiersProbleme: 2,
  nbDecisionsEnAttente: 3,
  nbDecisions24h: 1
};

export default function Dashboard() {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
          <p className="text-gray-400 text-sm">Où en sont vos chantiers ?</p>
        </div>
      </div>

      {/* Indicateurs globaux en haut */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Marge globale en cours</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(STATS_GLOBALES.margeGlobaleEnCours)}
            </div>
            <div className="text-xs text-green-400">
              +{formatCurrency(STATS_GLOBALES.margeGlobaleEnCours - STATS_GLOBALES.margeGlobalePrevue)} vs prévue
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Chantiers à surveiller</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {STATS_GLOBALES.nbChantiersProbleme}
            </div>
            <div className="text-xs text-gray-500">Nécessitent attention</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Décisions en attente</CardTitle>
            <Clock className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {STATS_GLOBALES.nbDecisionsEnAttente}
            </div>
            <div className="text-xs text-gray-500">À traiter</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avenants en cours</CardTitle>
            <Building2 className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {MOCK_AVENANTS.length}
            </div>
            <div className="text-xs text-gray-500">En validation</div>
          </CardContent>
        </Card>
      </div>

      {/* Chantiers à surveiller */}
      {MOCK_CHANTIERS_SURVEILLER.length > 0 && (
        <Card className="bg-[#1a1d24] rounded-xl border-2 border-orange-500/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {MOCK_CHANTIERS_SURVEILLER.length} Chantier{MOCK_CHANTIERS_SURVEILLER.length > 1 ? "s" : ""} à surveiller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_CHANTIERS_SURVEILLER.map((chantier) => (
                <div key={chantier.id} className="p-4 bg-[#0f1115] rounded-lg border border-orange-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{chantier.nom}</h3>
                      <p className="text-sm text-gray-300 mb-2">{chantier.client}</p>
                      <p className="text-sm text-orange-300 mb-2">{chantier.signal}</p>
                      <p className="text-xs text-gray-400">
                        👉 {chantier.actionSuggeree}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Se dégrade
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Décisions en attente */}
      <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Décisions à prendre ({MOCK_DECISIONS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_DECISIONS.map((decision) => (
              <div key={decision.id} className="p-4 bg-[#0f1115] rounded-lg border border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">{decision.question}</p>
                    <p className="text-xs text-gray-400">Chantier : {decision.chantierNom}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-red-400">
                      {formatCurrency(decision.impactEstime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avenants en cours */}
      <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Avenants en cours ({MOCK_AVENANTS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_AVENANTS.map((avenant) => (
              <div key={avenant.id} className="p-4 bg-[#0f1115] rounded-lg border border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">Avenant {avenant.numero}</p>
                    <p className="text-xs text-gray-400 mb-2">Chantier : {avenant.chantierNom}</p>
                    <p className="text-xs text-gray-500">
                      Statut : <span className="capitalize">{avenant.statut}</span> • Envoyé le {avenant.envoyeLe}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-green-400">
                      {formatCurrency(avenant.montant)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
