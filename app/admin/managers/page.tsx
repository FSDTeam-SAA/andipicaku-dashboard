"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AddManagerModal } from "@/components/modals/add-manager-modal";
import { ManagerDetailsModal } from "@/components/modals/manager-details-modal";
import { managerApi } from "@/lib/api";
import { Plus, Eye } from "lucide-react";

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

export default function ManagersPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  const { data: managersData, isLoading } = useQuery({
    queryKey: ["managers"],
    queryFn: managerApi.getAll,
  });

  const managers = managersData?.data?.data || [];

  const columns: ColumnDef<Manager>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={manager.avatar?.url || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-700 text-white">
                {manager.name
                  ? manager.name.charAt(0).toUpperCase()
                  : manager.username
                  ? manager.username.charAt(0).toUpperCase()
                  : manager.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {manager.name || manager.username || manager.email}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "numero",
      cell: ({ row }) => row.original.phone || "Non disponibile",
    },
    {
      accessorKey: "createdAt",
      header: "Data di iscrizione",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      },
    },
    {
      id: "actions",
      header: "Azioni",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedManager(row.original);
            setDetailsModalOpen(true);
          }}
          className="text-pink-400 hover:text-pink-300 hover:bg-slate-700"
        >
          <Eye className="h-4 w-4 mr-1" />
          Visualizza dettagli
        </Button>
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
          <h1 className="text-3xl font-bold text-white">Manager</h1>
          <p className="text-gray-300">Dashboard &gt; Manager</p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#901450] hover:bg-pink-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi gestore
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={managers}
        searchKey="name"
        searchPlaceholder="Cerca gestore"
      />

      <AddManagerModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      <ManagerDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        manager={selectedManager}
      />
    </div>
  );
}
