"use client";

import type React from "react";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationApi, managerApi } from "@/lib/api";
import { X, Plus, Clock } from "lucide-react";

interface AddLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shift {
  title: string;
  manager: string;
  startTime: string;
  endTime: string;
}

export function AddLocationModal({
  open,
  onOpenChange,
}: AddLocationModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    shifts: [
      {
        title: "",
        manager: "",
        startTime: "00:00:00",
        endTime: "00:00:00",
      },
    ] as Shift[],
  });

  const queryClient = useQueryClient();

  // Fetch managers for selection
  const { data: managersData } = useQuery({
    queryKey: ["managers"],
    queryFn: managerApi.getAll,
    enabled: open,
  });

  const managers = managersData?.data?.data || [];

  const addLocationMutation = useMutation({
    mutationFn: locationApi.add,
    onSuccess: () => {
      toast.success("Locale aggiunto con successo!");
      onOpenChange(false);
      setFormData({
        title: "",
        shifts: [
          {
            title: "",
            manager: "",
            startTime: "00:00:00",
            endTime: "00:00:00",
          },
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Errore nell'aggiunta del locale"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Il nome del locale è obbligatorio");
      return;
    }
    if (
      formData.shifts.some((shift) => !shift.title.trim() || !shift.manager)
    ) {
      toast.error("Tutti i campi del turno sono obbligatori");
      return;
    }
    addLocationMutation.mutate(formData);
  };

  const addShift = () => {
    setFormData({
      ...formData,
      shifts: [
        ...formData.shifts,
        {
          title: "",
          manager: "",
          startTime: "00:00:00",
          endTime: "00:00:00",
        },
      ],
    });
  };

  const updateShift = (index: number, field: keyof Shift, value: string) => {
    const updatedShifts = [...formData.shifts];
    updatedShifts[index] = { ...updatedShifts[index], [field]: value };
    setFormData({ ...formData, shifts: updatedShifts });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Aggiungere Locale
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-300">
              Localizzazione
            </Label>
            <Input
              id="location"
              placeholder="Inserisci qui il nome del luogo..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {formData.shifts.map((shift, index) => (
            <div
              key={index}
              className="space-y-4 p-4 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Turni {index + 1}</h4>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Turni {index + 1}</Label>
                <Input
                  placeholder="Inserisci qui il nome del turno...."
                  value={shift.title}
                  onChange={(e) => updateShift(index, "title", e.target.value)}
                  className="bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Manager</Label>
                <Select
                  value={shift.manager}
                  onValueChange={(value) =>
                    updateShift(index, "manager", value)
                  }
                >
                  <SelectTrigger className="bg-[#030E15] border-white/10 text-white">
                    <SelectValue placeholder="Inserisci il nome del responsabile del turno serale......" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    {managers.map((manager: any) => (
                      <SelectItem
                        key={manager._id}
                        value={manager._id}
                        className="text-white hover:bg-slate-700"
                      >
                        {manager.name || manager.username || manager.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Ora di inizio</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="time"
                      value={shift.startTime.slice(0, 5)}
                      onChange={(e) =>
                        updateShift(index, "startTime", e.target.value + ":00")
                      }
                      className="pl-10 bg-[#030E15] border-white/10 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Ora di fine</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="time"
                      value={shift.endTime.slice(0, 5)}
                      onChange={(e) =>
                        updateShift(index, "endTime", e.target.value + ":00")
                      }
                      className="pl-10 bg-[#030E15] border-white/10 text-white"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addShift}
              className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi turno
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#901450] hover:bg-pink-700 text-white"
            disabled={addLocationMutation.isPending}
          >
            {addLocationMutation.isPending ? "Salvataggio..." : "Salva"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
