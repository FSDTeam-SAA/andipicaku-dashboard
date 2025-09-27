"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Star } from "lucide-react";

interface Employee {
  _id: string;
  name?: string;
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

interface EmployeeDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onRate?: (employee: Employee) => void;
}

export function EmployeeDetailsModal({
  open,
  onOpenChange,
  employee,
  onRate,
}: EmployeeDetailsModalProps) {
  if (!employee) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Dettagli del dipendente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.avatar?.url || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-700 text-white">
                {employee.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {employee.name || "Nome non disponibile"}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex">
                  {renderStars(employee.userRating?.competence?.star || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Nome del dipendente</span>
              <span>{employee.name || "Non disponibile"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{employee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Numero di telefono</span>
              <span>{employee.phone || "Non disponibile"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Età</span>
              <span>{employee.age || "Non disponibile"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Genere</span>
              <span>{employee.gender || "Non disponibile"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nazionalità</span>
              <span>{employee.nationality || "Non disponibile"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Indirizzo</span>
              <span>Non disponibile</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Data di iscrizione</span>
              <span>{formatDate(employee.createdAt)}</span>
            </div>
          </div>

          <Button
            onClick={() => onRate?.(employee)}
            className="w-full bg-[#901450] hover:bg-pink-700 text-white"
          >
            Valuta dipendente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
