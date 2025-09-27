"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddEmployeeModal } from "@/components/modals/add-employee-modal";
import { EmployeeDetailsModal } from "@/components/modals/employee-details-modal";
import { RatingModal } from "@/components/modals/rating-modal";
import { employeeApi } from "@/lib/api";
import { Plus, Eye } from "lucide-react";

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

export default function EmployeesPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeApi.getAll,
  });

  const employees = employeesData?.data?.data || [];

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee.avatar?.url || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-700 text-white">
                {employee.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {employee.name || employee.email}
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
      accessorKey: "status",
      header: "Stato",
      cell: () => <Badge className="bg-green-600 text-white">Attivo</Badge>,
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
            setSelectedEmployee(row.original);
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

  const handleRateEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsModalOpen(false);
    setRatingModalOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-white">Dipendente</h1>
          <p className="text-gray-300">Pannello di controllo &gt; Dipendente</p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#901450] hover:bg-pink-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi dipendente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        searchKey="name"
        searchPlaceholder="Cerca dipendente"
      />

      <AddEmployeeModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      <EmployeeDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        employee={selectedEmployee}
        onRate={handleRateEmployee}
      />

      <RatingModal
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
