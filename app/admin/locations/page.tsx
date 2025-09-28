"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AddLocationModal } from "@/components/modals/add-location-modal";
import { DeleteLocationModal } from "@/components/modals/DeleteLocationModal";
import { locationApi } from "@/lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Shift {
  _id: string;
  title: string;
  manager: string;
  startTime: string;
  endTime: string;
}

interface Location {
  _id: string;
  title: string;
  shifts: Shift[];
  createdAt: string;
  updatedAt: string;
}

export default function LocationsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: locationsData, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: locationApi.getAll,
  });

  const locations = locationsData?.data?.data?.locations || [];

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "title",
      header: "Localizzazione",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      id: "shifts",
      header: "Turni",
      cell: ({ row }) => {
        const shifts = row.original.shifts;
        return (
          <div className="flex flex-wrap gap-2">
  {shifts.map((shift) => (
    <Badge key={shift._id} className="bg-blue-600 text-white">
      {shift.title} {shift?.startTime?.slice(0, 5) || 'N/A'}-
      {shift?.endTime?.slice(0, 5) || 'N/A'}
    </Badge>
  ))}
</div>
        );
      },
    },
    {
      id: "managers",
      header: "Manager",
      cell: ({ row }) => {
        const shifts = row.original.shifts;
        return (
          <div className="flex flex-col space-y-2">
            {shifts.map((shift) => (
              <div key={shift._id} className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-slate-700 text-white text-xs">
                    FM
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">Floyd Miles</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Data di inizio",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      id: "actions",
      header: "Azioni",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
            onClick={() => {
              setSelectedLocation(row.original);
              setAddModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-slate-700"
            onClick={() => {
              setSelectedLocation(row.original);
              setDeleteModalOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Locale</h1>
          <p className="text-gray-300">Dashboard &gt; Locale</p>
        </div>
        <Button
          onClick={() => {
            setSelectedLocation(null);
            setAddModalOpen(true);
          }}
          className="bg-[#901450] hover:bg-pink-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Locale
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        searchKey="title"
        searchPlaceholder="Cerca locale"
      />

      <AddLocationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        location={selectedLocation}
      />
      <DeleteLocationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        location={selectedLocation}
      />
    </div>
  );
}