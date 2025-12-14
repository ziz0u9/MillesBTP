import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, BarChart3, Phone, ShieldCheck } from "lucide-react";
import heroImage from "@assets/generated_images/abstract_modern_construction_tech_visualization_in_dark_mode.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
            <span className="text-primary">Milles</span>BTP
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-sm font-medium hover:text-primary">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25">
                Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <img 
             src={heroImage} 
             alt="Background" 
             className="w-full h-full object-cover object-center"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            La solution n°1 pour les artisans
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-heading font-bold tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Gérez votre entreprise BTP <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              sans la paperasse
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Devis, factures, plannings et suivi de chantier centralisés. 
            Gagnez 10h par semaine sur votre gestion administrative.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/auth/register">
              <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-gray-200">
                Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/20 hover:bg-white/5">
                Voir la démo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-secondary/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une suite d'outils complète conçue spécifiquement pour les besoins des professionnels du bâtiment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Pilotage complet",
                desc: "Suivez votre chiffre d'affaires, vos marges et votre trésorerie en temps réel."
              },
              {
                icon: Phone,
                title: "Secrétariat intégré",
                desc: "Gestion centralisée de vos appels, emails et prises de rendez-vous."
              },
              {
                icon: ShieldCheck,
                title: "Conformité légale",
                desc: "Devis et factures toujours aux normes, TVA gérée automatiquement."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-heading font-bold text-xl">
            <span className="text-primary">Milles</span>BTP
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 MillesBTP. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
