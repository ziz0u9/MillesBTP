import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  History, 
  Save, 
  FileText, 
  Mail,
  Smartphone
} from "lucide-react";

const activityLog = [
  { id: 1, action: "Connexion", detail: "Connexion réussie depuis Chrome / Windows", date: "Aujourd'hui, 08:30", ip: "192.168.1.1" },
  { id: 2, action: "Création Facture", detail: "Facture #FAC-2024-004 créée pour RénovPlus", date: "Hier, 16:45", ip: "192.168.1.1" },
  { id: 3, action: "Modification Client", detail: "Mise à jour adresse M. Dubois", date: "Hier, 14:20", ip: "192.168.1.1" },
  { id: 4, action: "Export", detail: "Export comptable Mai 2024", date: "12/05/2024, 09:15", ip: "192.168.1.1" },
  { id: 5, action: "Mot de passe", detail: "Modification du mot de passe", date: "10/05/2024, 18:00", ip: "192.168.1.1" },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez votre compte et les préférences de l'application.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="activity">Historique</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Vos informations de contact et d'identité.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback className="text-lg bg-primary/20 text-primary">JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Changer la photo</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input id="firstname" defaultValue="Jean" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input id="lastname" defaultValue="Dupont" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="jean@dupont-btp.fr" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" defaultValue="06 12 34 56 78" className="bg-background/50" />
                  </div>
                </div>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
             <Card className="glass-card border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>Ces informations apparaîtront sur vos devis et factures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyName">Raison sociale</Label>
                    <Input id="companyName" defaultValue="Dupont BTP SAS" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input id="siret" defaultValue="123 456 789 00012" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tva">Numéro TVA</Label>
                    <Input id="tva" defaultValue="FR 12 345678900" className="bg-background/50" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Adresse du siège</Label>
                    <Input id="address" defaultValue="15 Rue des Artisans, 69000 Lyon" className="bg-background/50" />
                  </div>
                </div>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Gérez comment vous souhaitez être alerté.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevoir un résumé quotidien de l'activité.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Nouveaux messages</Label>
                      <p className="text-sm text-muted-foreground">Être notifié lors de la réception d'un mail client.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Rappels de facturation</Label>
                      <p className="text-sm text-muted-foreground">Alertes pour les factures impayées.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>Gérez votre mot de passe et l'authentification.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input id="current-password" type="password" className="bg-background/50" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input id="new-password" type="password" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input id="confirm-password" type="password" className="bg-background/50" />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Button variant="outline" className="text-red-400 hover:text-red-300 hover:bg-red-900/10 border-red-900/20">
                    Déconnexion de tous les appareils
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="glass-card border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle>Journal d'activité</CardTitle>
                <CardDescription>Historique des actions effectuées sur votre compte.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-8">
                    {activityLog.map((log) => (
                      <div key={log.id} className="flex items-start">
                        <div className="mt-1 mr-4 flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                            <History className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{log.action}</p>
                            <span className="text-xs text-muted-foreground">{log.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.detail}</p>
                          <p className="text-xs font-mono text-muted-foreground/50">IP: {log.ip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
