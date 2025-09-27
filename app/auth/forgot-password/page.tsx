"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { api } from "@/lib/api"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.post("/auth/forget", { email })
      toast.success("Codice OTP inviato alla tua email")
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error("Errore nell'invio del codice OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030E15] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="">
          <div className=" mb-6">
            <h1 className="text-[40px] font-bold text-white mb-2">Password dimenticata</h1>
            <p className="text-gray-400 text-[20px]">Inserisci il tuo indirizzo email registrato. Ti invieremo un codice per reimpostare la tua password.</p>
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#901450] text-white font-medium py-3"
            >
              {isLoading ? "Invio in corso..." : "Invia codice OTP"}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-pink-400 hover:text-pink-300">
                Torna al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
