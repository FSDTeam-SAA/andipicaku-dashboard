"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { employeeApi } from "@/lib/api";
import { X, Star } from "lucide-react";

interface Employee {
  _id: string;
  name?: string;
  email: string;
  avatar?: {
    url: string;
  };
}

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

interface RatingData {
  competence: { star: number; comment: string };
  punctuality: { star: number; comment: string };
  behavior: { star: number; comment: string };
}

export function RatingModal({
  open,
  onOpenChange,
  employee,
}: RatingModalProps) {
  const [ratings, setRatings] = useState<RatingData>({
    competence: { star: 0, comment: "" },
    punctuality: { star: 0, comment: "" },
    behavior: { star: 0, comment: "" },
  });

  const queryClient = useQueryClient();

  // Fetch existing rating
  const { data: existingRating } = useQuery({
    queryKey: ["employee-rating", employee?._id],
    queryFn: () => employeeApi.getRating(employee!._id),
    enabled: !!employee?._id && open,
  });

  // Update rating mutation
  const updateRatingMutation = useMutation({
    mutationFn: (data: RatingData) =>
      employeeApi.updateRating(employee!._id, data),
    onSuccess: () => {
      toast.success("Valutazione aggiornata con successo!");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({
        queryKey: ["employee-rating", employee?._id],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Errore nell'aggiornamento della valutazione"
      );
    },
  });

  // Load existing ratings when modal opens
  useEffect(() => {
    if (existingRating?.data?.data) {
      const data = existingRating.data.data;
      setRatings({
        competence: data.competence || { star: 0, comment: "" },
        punctuality: data.punctuality || { star: 0, comment: "" },
        behavior: data.behavior || { star: 0, comment: "" },
      });
    }
  }, [existingRating]);

  const handleStarClick = (category: keyof RatingData, starIndex: number) => {
    setRatings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        star: starIndex + 1,
      },
    }));
  };

  const handleSubmit = () => {
    updateRatingMutation.mutate(ratings);
  };

  const renderStarRating = (category: keyof RatingData, label: string) => {
    const rating = ratings[category];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">{label}</span>
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleStarClick(category, i)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    i < rating.star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400 hover:text-yellow-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Rating</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage src={employee.avatar?.url || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-700 text-white">
                {employee.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">
              {employee.name || employee.email}
            </h3>
            <p className="text-sm text-gray-400">
              Valuta l'esperienza di questo dipendente
            </p>
          </div>

          {/* Rating Categories */}
          <div className="space-y-6">
            {renderStarRating("competence", "Competenza")}
            {renderStarRating("punctuality", "Puntualità")}
            {renderStarRating("behavior", "Comportamento")}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#901450] hover:bg-pink-700 text-white"
            disabled={updateRatingMutation.isPending}
          >
            {updateRatingMutation.isPending
              ? "Aggiornamento..."
              : "Valuta dipendente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
