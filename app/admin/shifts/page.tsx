"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { shiftApi } from "@/lib/api";
import { Search } from "lucide-react";

interface Employee {
  _id: string;
  name?: string;
  email: string;
}

interface ShiftType {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface Location {
  _id: string;
  title: string;
}

interface Shift {
  _id: string;
  employee: Employee | null;
  date: string;
  shiftType: ShiftType;
  location: Location;
}

interface ShiftRequest {
  _id: string;
  employee: Employee;
  date: string;
  shiftType: ShiftType;
  location: string;
  status: "Pending" | "Accepted" | "Refused";
  createdAt: string;
}

export default function ShiftsPage() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ["shifts"],
    queryFn: shiftApi.getAll,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["shift-requests", selectedLocation],
    queryFn: () =>
      shiftApi.getRequests({
        location: selectedLocation === "all" ? undefined : selectedLocation,
      }),
  });

  const shifts = shiftsData?.data?.data?.shifts || [];
  const requests = requestsData?.data?.data?.requests || [];

  // Group shifts by employee for calendar view
  const employeeShifts = shifts.reduce(
    (acc: Record<string, Shift[]>, shift: Shift) => {
      if (shift.employee) {
        const employeeId = shift.employee._id;
        if (!acc[employeeId]) {
          acc[employeeId] = [];
        }
        acc[employeeId].push(shift);
      }
      return acc;
    },
    {}
  );

  const employees = Object.keys(employeeShifts).map((employeeId) => {
    const employeeShiftList = employeeShifts[employeeId];
    return employeeShiftList[0].employee!;
  });

  const daysOfWeek = [
    "Sabato",
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
  ];
  const dates = [1, 2, 3, 4, 5, 6, 7];

  const getShiftForEmployeeAndDate = (employeeId: string, date: number) => {
    const employeeShiftList = employeeShifts[employeeId] || [];
    // Simplified logic for demo
    const shift = employeeShiftList[date % employeeShiftList.length];
    return shift?.shiftType;
  };

  // Columns for shift requests table
  const requestColumns: ColumnDef<ShiftRequest>[] = [
    {
      accessorKey: "employee",
      header: "Nome",
      cell: ({ row }) => {
        const employee = row.original.employee;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {employee.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{employee.name || employee.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Giorno",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return date.toLocaleDateString("it-IT", { weekday: "long" });
      },
    },
    {
      accessorKey: "date",
      header: "Tempo",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return date.toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "employee",
      header: "Assegnare",
      cell: ({ row }) => {
        const employee = row.original.employee;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {employee.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{employee.name || employee.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Stato",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            className={
              status === "Accepted"
                ? "bg-green-600 text-white"
                : status === "Refused"
                ? "bg-red-600 text-white"
                : "bg-yellow-600 text-white"
            }
          >
            {status === "Accepted"
              ? "Accettato"
              : status === "Refused"
              ? "Rifiutato"
              : "In attesa di"}
          </Badge>
        );
      },
    },
  ];

  if (shiftsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Turni</h1>
        <p className="text-gray-300">Dashboard &gt; Turni</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-48 bg-[#030E15] border-white/10 text-white">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              All Locations
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cerca dipendente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
          />
        </div>
        <Select defaultValue="July 2025">
          <SelectTrigger className="w-40 bg-[#030E15] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem
              value="July 2025"
              className="text-white hover:bg-slate-700"
            >
              July 2025
            </SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="1st Week">
          <SelectTrigger className="w-40 bg-[#030E15] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem
              value="1st Week"
              className="text-white hover:bg-slate-700"
            >
              1st Week
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shifts Calendar */}
      <div className="bg-[#030E15] backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-300 font-semibold min-w-[200px]">
                  Nome
                </th>
                {daysOfWeek.map((day, index) => (
                  <th
                    key={day}
                    className="text-center p-4 text-gray-300 font-semibold min-w-[120px]"
                  >
                    <div>{day}</div>
                    <div className="text-sm font-normal">{dates[index]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(
                  (employee) =>
                    employee.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    employee.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((employee) => (
                  <tr
                    key={employee._id}
                    className="border-b border-white/10 hover:bg-slate-700/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {employee.name
                              ? employee.name.charAt(0).toUpperCase()
                              : employee.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">
                          {employee.name || employee.email}
                        </span>
                      </div>
                    </td>
                    {dates.map((date) => {
                      const shift = getShiftForEmployeeAndDate(
                        employee._id,
                        date
                      );
                      const isEvenDate = date % 2 === 0;
                      return (
                        <td key={date} className="p-2 text-center">
                          {shift && (
                            <div
                              className={`px-3 py-2 rounded text-sm font-medium ${
                                isEvenDate
                                  ? "bg-[#4C3906] text-white"
                                  : "bg-[#000659] text-white"
                              }`}
                            >
                              <div>{shift.title}</div>
                              <div className="text-xs">
                                {shift.startTime.slice(0, 5)}-
                                {shift.endTime.slice(0, 5)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Requests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Richiesta di assegnazione
        </h2>
        <DataTable columns={requestColumns} data={requests} />
      </div>
    </div>
  );
}
