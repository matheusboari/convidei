"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    console.log("Tentando fazer login com email:", email);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      console.log("Resultado do login:", result);

      if (result?.error) {
        toast.error(`Erro de login: ${result.error}`);
        console.error("Erro de login:", result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success("Login realizado com sucesso!");
        console.log("Login bem-sucedido, redirecionando para", result.url);
        
        // Forçar redirecionamento usando window.location
        window.location.href = result.url || "/dashboard";
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Exceção durante o login:", error);
      toast.error("Ocorreu um erro ao fazer login");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
} 