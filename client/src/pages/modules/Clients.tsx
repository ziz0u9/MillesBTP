import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  MapPin, 
  Phone, 
  Mail,
  Building,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialClients = [
  { 
    id: 1, 
    type: "company",
    name: "RénovPlus SAS", 
    contact: "Michel Renaud",
    email: "contact@renovplus.fr", 
    phone: "04 78 12 34 56", 
    address: "12 Rue de l'Industrie, Lyon",
    projects: 3,
    status: "active"
  },
  { 
    id: 2, 
    type: "individual",
    name: "M. et Mme Dubois", 
    contact: "Jean Dubois",
    email: "jean.dubois@email.com", 
    phone: "06 98 76 54 32", 
    address: "45 Avenue des Lilas, Villeurbanne",
    projects: 1,
    status: "active"
  },
  { 
    id: 3, 
    type: "company",
    name: "Agence Immo Centre", 
    contact: "Sophie Martin",
    email: "gestion@immo-centre.fr", 
    phone: "04 72 00 00 00", 
    address: "3 Place Bellecour, Lyon",
    projects: 12,
    status: "active"
  },
  { 
    id: 4, 
    type: "individual",
    name: "M. Lefebvre", 
    contact: "Pierre Lefebvre",
    email: "p.lefebvre@orange.fr", 
    phone: "06 11 22 33 44", 
    address: "8 Impasse du Chêne, Bron",
    projects: 0,
    status: "inactive"
  },
];

export default function Clients() {
  const [clients] = useState(initialClients);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight">Fichier Clients</h2>
          <p className="text-muted-foreground">Gérez vos contacts professionnels et particuliers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom, ville..." 
            className="pl-9 bg-background/50 border-white/10"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="text-xs">Tous</Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Entreprises</Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Particuliers</Button>
        </div>
      </div>

      <div className="rounded-md border border-white/5 bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Client / Entreprise</TableHead>
              <TableHead>Coordonnées</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead className="text-center">Chantiers</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="border-white/5 hover:bg-muted/30 transition-colors">
                <TableCell>
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-2">
                      {client.name}
                      {client.type === 'company' && <Badge variant="outline" className="text-[10px] h-4 px-1 border-blue-500/20 text-blue-400">Pro</Badge>}
                    </span>
                    <span className="text-xs text-muted-foreground">{client.contact}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" /> {client.email}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" /> {client.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> {client.address}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">
                    {client.projects}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={client.status === 'active' 
                      ? "border-green-500/20 text-green-500 bg-green-500/10" 
                      : "border-white/10 text-muted-foreground"
                    }
                  >
                    {client.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Voir la fiche</DropdownMenuItem>
                      <DropdownMenuItem>Créer un devis</DropdownMenuItem>
                      <DropdownMenuItem>Historique</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
