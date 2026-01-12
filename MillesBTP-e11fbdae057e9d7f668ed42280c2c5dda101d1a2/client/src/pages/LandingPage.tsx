import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Navigation minimale */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 font-heading font-bold text-2xl tracking-tight">
            <Building2 className="h-7 w-7 text-[#00ff88]" />
            <span className="text-white">MillesBTP</span>
          </div>
          <Link href="/auth/login">
            <Button 
              variant="outline" 
              className="border-white/20 bg-transparent hover:bg-white/10 text-white font-medium px-6"
            >
              Se connecter
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Plein écran */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background Effects - Globe avec barres verticales */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Globe effect central */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#00ff88]/10 blur-[120px] opacity-60" />
          
          {/* Barres verticales lumineuses */}
          <div className="absolute inset-0 flex items-end justify-center gap-8 pb-32">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-[2px] h-[400px] bg-gradient-to-t from-[#00ff88]/30 via-[#00ff88]/10 to-transparent opacity-30"
              />
            ))}
          </div>
          
          {/* Grid pattern subtle */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Contenu central */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Message principal */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            <span className="block text-white">L'outil professionnel</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00cc6a] mt-2">
              pour le BTP moderne
            </span>
          </h1>
          
          {/* Description sobre */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Gestion, organisation et assistance complète pour votre entreprise du bâtiment.
          </p>
          
          {/* Bouton CTA unique */}
          <div className="flex justify-center">
            <Link href="/auth/login">
              <Button 
                size="lg"
                className="h-14 px-10 text-lg font-medium bg-[#00ff88] text-black hover:bg-[#00cc6a] transition-all duration-300 shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)]"
              >
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Indicateur de scroll (optionnel) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-sm animate-bounce">
          <span className="tracking-wider">SCROLL DOWN</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* Section métriques minimales (optionnel, inspiré de la ref) */}
      <section className="relative z-10 border-t border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-wrap justify-center gap-12 md:gap-16 text-center">
            <div>
              <p className="text-sm text-gray-400 mb-1">Accès sécurisé</p>
              <p className="text-lg font-semibold text-white">Entreprise certifiée</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Gestion complète</p>
              <p className="text-lg font-semibold text-white">Outils intégrés</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Support dédié</p>
              <p className="text-lg font-semibold text-white">Assistance professionnelle</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
