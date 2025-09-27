"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      toast.error("Inserisci il codice OTP completo")
      return
    }

    setShowPasswordForm(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const otpCode = otp.join("")
      await api.post("/auth/reset-password", {
        password: newPassword,
        otp: otpCode,
        email: email,
      })
      toast.success("Password reimpostata con successo")
      router.push("/auth/login")
    } catch (error) {
      toast.error("Errore nel reimpostare la password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030E15] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="">
          <div className=" mb-6">
            <h1 className="text-[40px] font-bold text-white mb-2">Inserisci OTP</h1>
            <p className="text-gray-400 mb-2">Abbiamo condiviso il codice del tuo indirizzo email registrato:</p>
            <p className="text-white font-medium">{email}</p>
          </div>

          {!showPasswordForm ? (
            <div className="space-y-6">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-slate-700/50 border-slate-600 text-white"
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                className="w-full bg-[#901450] text-white font-medium py-3"
              >
                Verificare
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Input
                  type="password"
                  placeholder="Inserisci la nuova password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium py-3"
              >
                {isLoading ? "Reimpostazione..." : "Reimposta password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
