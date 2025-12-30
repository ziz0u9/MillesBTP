import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building2, Eye, EyeOff } from "lucide-react";
import heroImage from "@assets/generated_images/abstract_modern_construction_tech_visualization_in_dark_mode.png";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useLogs } from "@/lib/LogContext";

const formSchema = z.object({
  email: z.string().email({
    message: "Email invalide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string|null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { addLog } = useLogs();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoginError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setLoginError(error.message);
      return;
    }
    
    // Si la connexion réussit, enregistrer le log et rediriger vers le dashboard
    if (data.session) {
      // Enregistrer le log de connexion
      const userAgent = navigator.userAgent;
      const browser = userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : 'Navigateur';
      addLog("Connexion", `Connexion réussie depuis ${browser} / ${navigator.platform}`);
      
      // Utiliser window.location pour forcer un rechargement et garantir que la session est prise en compte
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0a]">
      {/* Left: Illustration / Visual */}
      <div className="hidden lg:flex relative bg-[#0f0f0f] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="BTP Professionnel"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Dark overlay pour cohérence */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]/90" />
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
          {/* Accent glow */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#00ff88]/5 to-transparent" />
        </div>

        {/* Content overlay - peut contenir un message discret */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <Building2 className="h-10 w-10 text-[#00ff88] mb-4" />
              <h2 className="text-2xl font-bold mb-2">Espace professionnel sécurisé</h2>
              <p className="text-gray-400 leading-relaxed">
                Accédez à vos outils de gestion, organisation et suivi de projets en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-col justify-center px-6 sm:px-8 lg:px-16 bg-[#111111] min-h-screen">
        <div className="w-full max-w-md mx-auto space-y-8 py-12">
          {/* Logo & Header */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3 font-heading font-bold text-2xl tracking-tight">
              <Building2 className="h-8 w-8 text-[#00ff88]" />
              <span className="text-white">MillesBTP</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Connexion à votre espace
              </h1>
              <p className="text-gray-400">
                Entrez vos identifiants pour accéder à votre compte professionnel.
              </p>
            </div>
          </div>

          {/* Error message */}
          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {loginError}
            </div>
          )}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Adresse email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="votre.email@entreprise.fr" 
                        {...field} 
                        className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00ff88] focus:ring-[#00ff88]/20 h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00ff88] focus:ring-[#00ff88]/20 h-12 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot password link */}
              <div className="flex justify-end">
                <Link 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implémenter la réinitialisation de mot de passe
                  }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#00ff88] text-black font-medium hover:bg-[#00cc6a] transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]"
              >
                Se connecter
              </Button>
            </form>
          </Form>

          {/* Security note - discret */}
          <div className="pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              Connexion sécurisée et chiffrée. Vos données sont protégées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
