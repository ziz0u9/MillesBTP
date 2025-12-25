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
  Mail,
  Smartphone
} from "lucide-react";
import { useLogs } from "@/lib/LogContext";
import { useSession } from "@/hooks/useSession";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Settings() {
  const { logs, loading: logsLoading } = useLogs();
  const { session } = useSession();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function getProfile() {
      if (session?.user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("full_name, company")
          .eq("id", session.user.id)
          .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour éviter l'erreur 406 si le profil n'existe pas
        
        if (!error && profileData) {
          setProfile(profileData);
        } else {
          setProfile(session.user.user_metadata ?? {});
        }
      }
    }
    getProfile();
  }, [session]);

  const displayName = profile?.full_name || profile?.name || "Utilisateur";
  const displayEmail = session?.user?.email || "";

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Paramètres</h2>
        <p className="text-gray-400 text-sm">Gérez votre compte et les préférences de l'application.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-[#262930] rounded-lg p-1 mb-6 border-[#3a3f47]">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Profil</TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Entreprise</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Sécurité</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">Historique</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Informations personnelles</CardTitle>
              <CardDescription className="text-gray-400">Vos informations de contact et d'identité.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-[#3a3f47]">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback className="text-lg bg-[#00ff88]/20 text-[#00ff88] font-bold">
                    {displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-[#3a3f47] text-gray-300 hover:bg-[#2f343a] hover:text-white">Changer la photo</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-gray-300">Prénom</Label>
                  <Input id="firstname" defaultValue={displayName.split(' ')[0] || ""} className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-gray-300">Nom</Label>
                  <Input id="lastname" defaultValue={displayName.split(' ').slice(1).join(' ') || ""} className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input id="email" defaultValue={displayEmail} className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Téléphone</Label>
                  <Input id="phone" defaultValue="06 12 34 56 78" className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
              </div>
              <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
                <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Informations de l'entreprise</CardTitle>
              <CardDescription className="text-gray-400">Ces informations apparaîtront sur vos devis et factures.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="companyName" className="text-gray-300">Raison sociale</Label>
                  <Input id="companyName" defaultValue={profile?.company || "Dupont BTP SAS"} className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret" className="text-gray-300">SIRET</Label>
                  <Input id="siret" defaultValue="123 456 789 00012" className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva" className="text-gray-300">Numéro TVA</Label>
                  <Input id="tva" defaultValue="FR 12 345678900" className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address" className="text-gray-300">Adresse du siège</Label>
                  <Input id="address" defaultValue="15 Rue des Artisans, 69000 Lyon" className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
              </div>
              <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
                <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Préférences de notification</CardTitle>
              <CardDescription className="text-gray-400">Gérez comment vous souhaitez être alerté.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#3a3f47]">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-white">Notifications par email</Label>
                    <p className="text-sm text-gray-400">Recevoir un résumé quotidien de l'activité.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#3a3f47]">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-white">Nouveaux messages</Label>
                    <p className="text-sm text-gray-400">Être notifié lors de la réception d'un mail client.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#3a3f47]">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-white">Rappels de facturation</Label>
                    <p className="text-sm text-gray-400">Alertes pour les factures impayées.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Sécurité du compte</CardTitle>
              <CardDescription className="text-gray-400">Gérez votre mot de passe et l'authentification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-300">Mot de passe actuel</Label>
                <Input id="current-password" type="password" className="bg-[#2f343a] border-[#3a3f47] text-white" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-300">Nouveau mot de passe</Label>
                  <Input id="new-password" type="password" className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">Confirmer le mot de passe</Label>
                  <Input id="confirm-password" type="password" className="bg-[#2f343a] border-[#3a3f47] text-white" />
                </div>
              </div>
              <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a] font-medium">
                <Save className="mr-2 h-4 w-4" /> Mettre à jour le mot de passe
              </Button>
              <div className="pt-4 border-t border-[#3a3f47]">
                <Button variant="outline" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/30">
                  Déconnexion de tous les appareils
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-[#262930] rounded-lg border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Journal d'activité</CardTitle>
              <CardDescription className="text-gray-400">Historique des actions effectuées sur votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {logsLoading ? (
                  <div className="text-center py-8 text-gray-400">Chargement des logs...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">Aucun log disponible</div>
                ) : (
                  <div className="space-y-6">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-[#3a3f47] last:border-0">
                        <div className="mt-1 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20">
                            <History className="h-5 w-5 text-[#00ff88]" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-white">{log.action}</p>
                            <span className="text-xs text-gray-400">{log.date}</span>
                          </div>
                          <p className="text-sm text-gray-300">{log.detail}</p>
                          <p className="text-xs font-mono text-gray-500">IP: {log.ip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
