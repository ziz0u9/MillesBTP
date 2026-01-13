import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Building2
} from "lucide-react";
import { 
  BarChart,
  Bar,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

// Données statiques cohérentes avec les autres pages
const MOCK_CHANTIERS = [
  {
    id: "1",
    nom: "Résidence Les Jardins",
    margePrevue: 85000,
    margeProjetee: 76500,
    ecart: -8500,
    statutReel: "a_surveiller"
  },
  {
    id: "2",
    nom: "Immeuble Voltaire",
    margeProjetee: 123800,
    margePrevue: 130000,
    ecart: -6200,
    statutReel: "a_surveiller"
  },
  {
    id: "3",
    nom: "Centre Commercial Atlantis",
    margePrevue: 245000,
    margeProjetee: 245000,
    ecart: 0,
    statutReel: "normal"
  },
  {
    id: "4",
    nom: "Tour Horizon",
    margePrevue: 180000,
    margeProjetee: 208500,
    ecart: 28500,
    statutReel: "normal"
  },
  {
    id: "5",
    nom: "Résidence Les Pins",
    margePrevue: 95000,
    margeProjetee: 110200,
    ecart: 15200,
    statutReel: "normal"
  }
];

const RAPPORT_GLOBAL = {
  margeGlobalePrevue: 735000,
  margeGlobaleProjetee: 764000,
  ecartMarge: 29000,
  nbChantiers: 5,
  nbChantiersDerive: 2,
  totalEcarts: 3,
  totalAvenants: 2,
  montantAvenants: 43700
};

export default function Rapports() {
  // Données pour le graphique
  const chartData = MOCK_CHANTIERS.map(c => ({
    name: c.nom.length > 15 ? c.nom.substring(0, 15) + "..." : c.nom,
    prevue: c.margePrevue,
    projetee: c.margeProjetee,
  }));

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
          <h1 className="text-3xl font-bold text-white mb-2">Situation financière</h1>
          <p className="text-gray-400 text-sm">Où en sont les marges de vos chantiers ?</p>
        </div>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Marge globale prévue</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(RAPPORT_GLOBAL.margeGlobalePrevue)}
            </div>
            <div className="text-xs text-gray-500">Sur {RAPPORT_GLOBAL.nbChantiers} chantiers</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Marge globale en cours</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatCurrency(RAPPORT_GLOBAL.margeGlobaleProjetee)}
            </div>
            <div className="text-xs text-green-400">
              +{formatCurrency(RAPPORT_GLOBAL.ecartMarge)} vs prévue
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
              {RAPPORT_GLOBAL.nbChantiersDerive}
            </div>
            <div className="text-xs text-gray-500">
              sur {RAPPORT_GLOBAL.nbChantiers} chantiers
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avenants validés</CardTitle>
            <Building2 className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(RAPPORT_GLOBAL.montantAvenants)}
            </div>
            <div className="text-xs text-gray-500">
              {RAPPORT_GLOBAL.totalAvenants} avenant{RAPPORT_GLOBAL.totalAvenants > 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique comparatif */}
      <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Comparaison des marges par chantier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3f47" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}k€`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1d24',
                    border: '1px solid #3a3f47',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="prevue" fill="#4dabf7" name="Marge prévue" />
                <Bar dataKey="projetee" fill="#00ff88" name="Marge en cours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tableau détaillé par chantier */}
      <Card className="bg-[#1a1d24] rounded-xl border border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Détail par chantier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1115] border-b border-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Chantier</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Marge prévue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Marge en cours</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Écart</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {MOCK_CHANTIERS.map((chantier) => (
                  <tr key={chantier.id} className="hover:bg-[#1f2329] transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{chantier.nom}</td>
                    <td className="py-3 px-4 text-sm text-right text-white">
                      {formatCurrency(chantier.margePrevue)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-semibold ${
                      chantier.margeProjetee >= chantier.margePrevue ? "text-green-400" : "text-red-400"
                    }`}>
                      {formatCurrency(chantier.margeProjetee)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-semibold ${
                      chantier.ecart >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {chantier.ecart >= 0 ? "+" : ""}{formatCurrency(chantier.ecart)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        chantier.statutReel === "en_derive" 
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : chantier.statutReel === "a_surveiller"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }`}>
                        {chantier.statutReel === "en_derive" ? "Problème" :
                         chantier.statutReel === "a_surveiller" ? "À surveiller" : "OK"}
                      </span>
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

