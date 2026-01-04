import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Ange en giltig e-postadress"),
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Inloggning misslyckades",
        description: error.message === "Invalid login credentials" 
          ? "Felaktig e-post eller lösenord" 
          : error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card p-8 rounded-xl shadow-card border border-blush/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-blush/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif text-foreground mb-2">
              Admin-inloggning
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              Endast för Andreas & Rebecka
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-body">
                E-post
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                className="mt-1"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="font-body">
                Lösenord
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-body"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loggar in...
                </>
              ) : (
                "Logga in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
            >
              ← Tillbaka till hemsidan
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
