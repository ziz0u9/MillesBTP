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

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom est requis." }),
  company: z.string().min(2, { message: "Le nom de l'entreprise est requis." }),
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

export default function Register() {
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setLocation("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/">
            <div className="flex items-center gap-2 font-heading font-bold text-2xl mb-2 cursor-pointer">
              <Building2 className="h-8 w-8 text-primary" />
              <span>MillesBTP</span>
            </div>
          </Link>
          <h1 className="text-2xl font-heading font-bold">Créer votre compte</h1>
          <p className="text-muted-foreground text-sm">
            Rejoignez des milliers d'artisans qui simplifient leur quotidien.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean Dupont" {...field} className="bg-secondary/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <FormControl>
                    <Input placeholder="Dupont BTP" {...field} className="bg-secondary/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-4">
              Commencer l'essai gratuit
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Déjà un compte ? </span>
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
