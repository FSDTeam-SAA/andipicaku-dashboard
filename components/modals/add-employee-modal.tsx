"use client";

import type React from "react";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { employeeApi } from "@/lib/api";
import { X } from "lucide-react";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeModal({
  open,
  onOpenChange,
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: employeeApi.invite,
    onSuccess: () => {
      toast.success("Invito inviato con successo!");
      onOpenChange(false);
      setFormData({ email: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Errore nell'invio dell'invito"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("L'email è obbligatoria");
      return;
    }
    inviteMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Aggiungi dipendente
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
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
              disabled
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
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Inserisci la password del gestore"
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              Messaggio
            </Label>
            <Textarea
              id="message"
              placeholder="Inserisci qui il messaggio per il dipendente..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400 min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#901450] hover:bg-pink-700 text-white"
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending
              ? "Invio collegamento..."
              : "Invia collegamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
