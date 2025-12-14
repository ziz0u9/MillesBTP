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
import { Building2 } from "lucide-react";
import heroImage from "@assets/generated_images/abstract_modern_construction_tech_visualization_in_dark_mode.png";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Mock login
    setLocation("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex flex-col justify-center px-8 lg:px-16 bg-background border-r border-white/5">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 font-heading font-bold text-2xl mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <span>MillesBTP</span>
            </div>
            <h1 className="text-3xl font-heading font-bold">Bon retour parmi nous</h1>
            <p className="text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jean@exemple.com" {...field} className="bg-secondary/30" />
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
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                Se connecter
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Pas encore de compte ? </span>
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden lg:block relative bg-muted">
        <img
          src={heroImage}
          alt="Construction Site"
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/20" />
        <div className="relative z-10 flex h-full flex-col justify-end p-16 text-white">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;Depuis que nous utilisons MillesBTP, nous avons réduit notre temps administratif de 40%. C'est un gain de productivité énorme pour notre équipe.&rdquo;
            </p>
            <footer className="text-sm text-white/60">Michel R., Gérant de RénovPlus</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
