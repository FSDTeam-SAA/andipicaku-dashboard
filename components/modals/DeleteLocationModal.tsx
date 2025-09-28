"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { locationApi } from "@/lib/api";

interface DeleteLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: any; // Location data to delete
}

export function DeleteLocationModal({
  open,
  onOpenChange,
  location,
}: DeleteLocationModalProps) {
  const queryClient = useQueryClient();

  const deleteLocationMutation = useMutation({
    mutationFn: () => locationApi.delete(location._id),
    onSuccess: () => {
      toast.success("Locale eliminato con successo!");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Errore nell'eliminazione del locale"
      );
    },
  });

  const handleDelete = () => {
    deleteLocationMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Elimina Locale
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Sei sicuro di voler eliminare il locale "{location?.title}"? Questa
            azione non può essere annullata.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
          >
            No
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLocationMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteLocationMutation.isPending ? "Eliminazione..." : "Sì"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}