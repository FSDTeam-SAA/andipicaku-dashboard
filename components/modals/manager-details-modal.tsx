"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { DeleteManagerModal } from "./DeleteManagerModal";

interface Manager {
  _id: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  age?: string;
  gender?: string;
  nationality?: string;
  avatar?: {
    url: string;
  };
  userRating?: {
    competence: { star: number; comment: string };
    punctuality: { star: number; comment: string };
    behavior: { star: number; comment: string };
  };
  createdAt: string;
}

interface ManagerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null;
}

export function ManagerDetailsModal({
  open,
  onOpenChange,
  manager,
}: ManagerDetailsModalProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!manager) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    ));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Dettagli del gestore
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Manager Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={manager.avatar?.url || "/placeholder.svg"} />
                <AvatarFallback className="bg-slate-700 text-white">
                  {manager.name
                    ? manager.name.charAt(0).toUpperCase()
                    : manager.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {manager.name || manager.username || "Nome non disponibile"}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex">
                    {renderStars(manager.userRating?.competence?.star || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Nome del gestore</span>
                <span>
                  {manager.name || manager.username || "Non disponibile"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span>{manager.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Numero di telefono</span>
                <span>{manager.phone || "Non disponibile"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Età</span>
                <span>{manager.age || "Non disponibile"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Genere</span>
                <span>{manager.gender || "Non disponibile"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nazionalità</span>
                <span>{manager.nationality || "Non disponibile"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Indirizzo</span>
                <span>Non disponibile</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data di iscrizione</span>
                <span>{formatDate(manager.createdAt)}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              className="w-full bg-[#901450] hover:bg-pink-700 text-white"
              onClick={() => setDeleteModalOpen(true)}
            >
              Rimuovi gestore
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteManagerModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        manager={manager}
      />
    </>
  );
}