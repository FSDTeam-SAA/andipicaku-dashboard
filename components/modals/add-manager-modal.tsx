"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { managerApi } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

interface AddManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddManagerModal({ open, onOpenChange }: AddManagerModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    username: "",
    role: "manager",
    address: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const queryClient = useQueryClient();

  const addManagerMutation = useMutation({
    mutationFn: managerApi.add,
    onSuccess: () => {
      toast.success("Gestore aggiunto con successo!");
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        username: "",
        role: "manager",
        address: "",
      });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Errore nell'aggiunta del gestore"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Nome, email e password sono obbligatori");
      return;
    }
    addManagerMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Aggiungi gestore
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Nome
            </Label>
            <Input
              id="name"
              placeholder="Inserisci il nome del gestore"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Inserisci l'email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">
              Telefono
            </Label>
            <Input
              id="phone"
              placeholder="Inserisci il numero di telefono"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Inserisci la password del gestore"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400 pr-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#901450] hover:bg-pink-700 text-white"
            disabled={addManagerMutation.isPending}
          >
            {addManagerMutation.isPending
              ? "Invio collegamento..."
              : "Invia collegamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}