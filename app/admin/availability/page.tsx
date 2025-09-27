"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { availabilityApi } from "@/lib/api";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

interface Availability {
  _id: string;
  employee: Employee;
  date: string;
  location: Location;
  shiftType: ShiftType;
}

export default function AvailabilityPage() {
  const [selectedMonth, setSelectedMonth] = useState("July 2025");
  const [selectedWeek, setSelectedWeek] = useState("1st Week");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: availabilityApi.getAll,
  });

  const availabilities = availabilityData?.data?.data?.availabilities || [];

  // Group availabilities by employee
  const employeeAvailabilities = availabilities.reduce(
    (acc: Record<string, Availability[]>, availability: Availability) => {
      const employeeId = availability.employee._id;
      if (!acc[employeeId]) {
        acc[employeeId] = [];
      }
      acc[employeeId].push(availability);
      return acc;
    },
    {}
  );

  const employees = Object.keys(employeeAvailabilities).map((employeeId) => {
    const employeeAvails = employeeAvailabilities[employeeId];
    return employeeAvails[0].employee;
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
    const employeeAvails = employeeAvailabilities[employeeId] || [];
    // This is a simplified logic - in real app, you'd match by actual date
    const availability = employeeAvails[date % employeeAvails.length];
    return availability?.shiftType;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
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
      <div>
        <h1 className="text-3xl font-bold text-white">Disponibilità</h1>
        <p className="text-gray-300">Dashboard &gt; Disponibilità</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cerca dipendente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#030E15] border-white/10 text-white placeholder:text-gray-400"
          />
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
            <SelectItem
              value="August 2025"
              className="text-white hover:bg-slate-700"
            >
              August 2025
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
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
            <SelectItem
              value="2nd Week"
              className="text-white hover:bg-slate-700"
            >
              2nd Week
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Table */}
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <div className="text-sm text-gray-400">
            Visualizzazione da 1 a 7 di 12 risultati
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" className="bg-[#901450] text-white">
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
            >
              17
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
