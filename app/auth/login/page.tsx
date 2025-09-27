"use client";

import type React from "react";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenziali non valide");
      } else {
        toast.success("Accesso effettuato con successo");
        router.push("/admin");
      }
    } catch (error) {
      toast.error("Errore durante l'accesso");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030E15] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="">
          <div className=" mb-6">
            <h1 className="text-[40px] font-bold text-white mb-2">
              Accedi all'account
            </h1>
            <p className="text-gray-400">
              Inserisci la tua email e la tua password per continuare
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white">
                Indirizzo e-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci il tuo indirizzo email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci la tua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-slate-600 data-[state=checked]:bg-[#901450]"
                />
                <Label htmlFor="remember" className="text-sm text-gray-300">
                  Ricordati di me
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-[12px] text-white"
              >
                Ha dimenticato la password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#901450] text-white font-medium py-3"
            >
              {isLoading ? "Accesso in corso..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
