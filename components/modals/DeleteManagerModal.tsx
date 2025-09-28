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
import { managerApi } from "@/lib/api";

interface DeleteManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: any; // Manager data to delete
}

export function DeleteManagerModal({
  open,
  onOpenChange,
  manager,
}: DeleteManagerModalProps) {
  const queryClient = useQueryClient();

  const deleteManagerMutation = useMutation({
    mutationFn: () => managerApi.delete(manager._id),
    onSuccess: () => {
      toast.success("Gestore eliminato con successo!");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Errore nell'eliminazione del gestore"
      );
    },
  });

  const handleDelete = () => {
    deleteManagerMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Elimina Gestore
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Sei sicuro di voler eliminare il gestore "
            {manager?.name || manager?.username || manager?.email}"? Questa azione
            non può essere annullata.
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
            disabled={deleteManagerMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteManagerMutation.isPending ? "Eliminazione..." : "Sì"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}