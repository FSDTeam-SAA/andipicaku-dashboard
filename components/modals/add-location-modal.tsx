"use client";

import React, { useState, useEffect } from "react";
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

interface Shift {
  _id?: string; // Optional for existing shifts
  type: "create" | "update" | "delete"; // Shift operation type
  title: string; // Changed from 'name' to 'title' to match backend
  manager: string; // Manager ID
  startTime: string; // Used in UI and backend (e.g., "10:00")
  endTime: string; // Used in UI and backend (e.g., "18:00")
}

interface AddLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: any; // Optional location data for edit mode
}

export function AddLocationModal({
  open,
  onOpenChange,
  location,
}: AddLocationModalProps) {
  const isEditMode = !!location;
  const [formData, setFormData] = useState({
    title: "",
    shifts: [
      {
        type: "create" as const,
        title: "",
        manager: "",
        startTime: "00:00",
        endTime: "00:00",
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

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && location) {
      setFormData({
        title: location.title || "",
        shifts: location.shifts?.length
          ? location.shifts.map((shift: any) => ({
              _id: shift._id,
              type: "update" as const, // Existing shifts default to update
              title: shift.title,
              manager: shift.manager,
              startTime: shift.startTime?.slice(0, 5) || "00:00",
              endTime: shift.endTime?.slice(0, 5) || "00:00",
            }))
          : [
              {
                type: "create" as const,
                title: "",
                manager: "",
                startTime: "00:00",
                endTime: "00:00",
              },
            ],
      });
    } else {
      setFormData({
        title: "",
        shifts: [
          {
            type: "create" as const,
            title: "",
            manager: "",
            startTime: "00:00",
            endTime: "00:00",
          },
        ],
      });
    }
  }, [location, isEditMode]);

  const addLocationMutation = useMutation({
    mutationFn: isEditMode
      ? (data: any) => locationApi.update(location._id, data)
      : locationApi.add,
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Locale aggiornato con successo!"
          : "Locale aggiunto con successo!"
      );
      onOpenChange(false);
      setFormData({
        title: "",
        shifts: [
          {
            type: "create" as const,
            title: "",
            manager: "",
            startTime: "00:00",
            endTime: "00:00",
          },
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          (isEditMode
            ? "Errore nell'aggiornamento del locale"
            : "Errore nell'aggiunta del locale")
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
      formData.shifts.some(
        (shift) =>
          (shift.type !== "delete" && (!shift.title.trim() || !shift.manager)) ||
          (shift.type === "delete" && !shift._id)
      )
    ) {
      toast.error("Tutti i campi del turno sono obbligatori per creare o aggiornare");
      return;
    }

    // Prepare payload for backend - match the expected format
    const payload = {
      title: formData.title,
      shifts: formData.shifts
        .filter(shift => shift.type !== "delete") // Remove deleted shifts from payload
        .map((shift) => ({
          type: shift.type,
          _id: shift._id,
          title: shift.title, // Changed from 'name' to 'title'
          manager: shift.manager,
          startTime: shift.startTime,
          endTime: shift.endTime,
        })),
    };

    // For delete operations, we need to handle them separately
    const deleteShifts = formData.shifts.filter(shift => shift.type === "delete");
    
    if (deleteShifts.length > 0) {
      // If there are shifts to delete, you might need to make separate API calls
      // or modify your backend to handle mixed operations in one call
      console.log("Shifts to delete:", deleteShifts);
      // You may need to implement separate deletion logic here
    }

    console.log("Payload being sent:", payload);
    addLocationMutation.mutate(payload);
  };

  const addShift = () => {
    setFormData({
      ...formData,
      shifts: [
        ...formData.shifts,
        {
          type: "create",
          title: "",
          manager: "",
          startTime: "00:00",
          endTime: "00:00",
        },
      ],
    });
  };

  const updateShift = (index: number, field: keyof Shift, value: string) => {
    const updatedShifts = [...formData.shifts];
    updatedShifts[index] = { ...updatedShifts[index], [field]: value };
    setFormData({ ...formData, shifts: updatedShifts });
  };

  const removeShift = (index: number) => {
    if (formData.shifts.length === 1) {
      toast.error("È richiesto almeno un turno");
      return;
    }

    const shift = formData.shifts[index];
    if (shift._id && shift.type !== "create") {
      // Mark existing shift for deletion
      setFormData({
        ...formData,
        shifts: [
          ...formData.shifts.slice(0, index),
          { ...shift, type: "delete" },
          ...formData.shifts.slice(index + 1),
        ],
      });
    } else {
      // Remove new shift (not yet saved)
      setFormData({
        ...formData,
        shifts: formData.shifts.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Modifica Locale" : "Aggiungi Locale"}
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

          {formData.shifts
            .map((shift, index) => ({ shift, index }))
            .filter(({ shift }) => shift.type !== "delete") // Hide deleted shifts
            .map(({ shift, index }) => (
              <div
                key={shift._id || index}
                className="space-y-4 p-4 border border-white/10 rounded-lg relative"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium">Turno {index + 1}</h4>
                  {formData.shifts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShift(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Nome Turno</Label>
                  <Input
                    placeholder="Inserisci qui il nome del turno..."
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
                      <SelectValue placeholder="Seleziona il responsabile del turno..." />
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
                        value={shift.startTime}
                        onChange={(e) =>
                          updateShift(index, "startTime", e.target.value)
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
                        value={shift.endTime}
                        onChange={(e) =>
                          updateShift(index, "endTime", e.target.value)
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
            {addLocationMutation.isPending
              ? isEditMode
                ? "Aggiornamento..."
                : "Salvataggio..."
              : isEditMode
              ? "Aggiorna"
              : "Salva"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}