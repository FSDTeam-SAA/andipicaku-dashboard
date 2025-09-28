"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { shiftApi } from "@/lib/api";
import { ShiftAssignmentModal } from "./_components/shift-assignment-modal";
import { DeleteConfirmationModal } from "./_components/DeleteConfirmationModal";
import { Search, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function to handle different API response structures
const extractData = (response: any, possiblePaths: string[]): any[] => {
  if (!response) return [];

  for (const path of possiblePaths) {
    try {
      const value = path.split(".").reduce((obj, key) => obj?.[key], response);
      if (value !== undefined && value !== null) {
        return Array.isArray(value) ? value : [value];
      }
    } catch (error) {
      console.warn(`Error extracting data from path ${path}:`, error);
    }
  }
  return [];
};

// Helper function to safely get array data
const getArrayData = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    // Try to find any array property in the object
    const arrayKey = Object.keys(data).find((key) => Array.isArray(data[key]));
    return arrayKey ? data[arrayKey] : [];
  }
  return [];
};

// Helper function to extract pagination info
const extractPagination = (response: any): PaginationInfo => {
  const defaultPagination: PaginationInfo = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  if (!response) return defaultPagination;

  // Try different possible paths for pagination data
  const possiblePaths = [
    "data.data.pagination",
    "data.pagination",
    "pagination",
    "data.data",
    "data",
  ];

  for (const path of possiblePaths) {
    try {
      const data = path.split(".").reduce((obj, key) => obj?.[key], response);
      if (data && typeof data === "object") {
        return {
          total: data.total || data.totalDocs || 0,
          page: data.page || data.currentPage || 1,
          limit: data.limit || data.pageSize || 10,
          totalPages:
            data.totalPages ||
            Math.ceil(
              (data.total || data.totalDocs || 0) /
                (data.limit || data.pageSize || 10)
            ) ||
            1,
        };
      }
    } catch (error) {
      continue;
    }
  }

  return defaultPagination;
};

export default function ShiftsPage() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Set default to current month
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
  });
  const [selectedWeek, setSelectedWeek] = useState("1st Week");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [shiftsPage, setShiftsPage] = useState(1);
  const [shiftsLimit, setShiftsLimit] = useState(50);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: shiftsData,
    isLoading: shiftsLoading,
    error: shiftsError,
  } = useQuery({
    queryKey: ["shifts", shiftsPage, shiftsLimit],
    queryFn: () => shiftApi.getAll({ page: shiftsPage, limit: shiftsLimit }),
    onError: (error) => console.error("Error fetching shifts:", error),
  });

  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
  } = useQuery({
    queryKey: ["shift-requests", selectedLocation],
    queryFn: () =>
      shiftApi.getRequests({
        location: selectedLocation === "all" ? undefined : selectedLocation,
      }),
    onError: (error) => console.error("Error fetching requests:", error),
  });

  const { data: locationsData, error: locationsError } = useQuery({
    queryKey: ["locations"],
    queryFn: shiftApi.getLocations,
    onError: (error) => console.error("Error fetching locations:", error),
  });

  const { data: employeesData, error: employeesError } = useQuery({
    queryKey: ["employees"],
    queryFn: shiftApi.getEmployees,
    onError: (error) => console.error("Error fetching employees:", error),
  });

  // Delete mutation
  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => shiftApi.deleteRequest(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shift request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["shift-requests"] });
      setDeleteModalOpen(false);
      setRequestToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete shift request",
        variant: "destructive",
      });
    },
  });

  // Extract data with multiple possible paths to handle different API structures
  const shifts = getArrayData(
    extractData(shiftsData, [
      "data.data.shifts",
      "data.shifts",
      "shifts",
      "data",
    ])
  );
  const requests = getArrayData(
    extractData(requestsData, [
      "data.data.requests",
      "data.requests",
      "requests",
      "data",
    ])
  );
  const locations = getArrayData(
    extractData(locationsData, [
      "data.data.locations",
      "data.locations",
      "locations",
      "data",
    ])
  );
  const allEmployees = getArrayData(
    extractData(employeesData, [
      "data.data.employees",
      "data.employees",
      "employees",
      "data",
    ])
  );

  // Extract pagination info
  const shiftsPagination = extractPagination(shiftsData);

  // Pagination handlers
  const handleNextPage = () => {
    if (shiftsPagination.page < shiftsPagination.totalPages) {
      setShiftsPage(shiftsPagination.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (shiftsPagination.page > 1) {
      setShiftsPage(shiftsPagination.page - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setShiftsPage(page);
  };

  // Delete handlers
  const handleDeleteClick = (requestId: string) => {
    setRequestToDelete(requestId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (requestToDelete) {
      deleteRequestMutation.mutate(requestToDelete);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  const availableMonths = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Generate all 12 months for the current year
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const monthString = `${currentYear}-${String(month).padStart(2, "0")}`;
      months.push(monthString);
    }

    // Also add months from existing shifts to handle data from other years
    const shiftMonths = new Set<string>();
    shifts.forEach((shift: Shift) => {
      try {
        const date = new Date(shift.date);
        const monthYear = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        shiftMonths.add(monthYear);
      } catch (error) {
        console.warn("Invalid shift date:", shift.date);
      }
    });

    // Combine current year months with shift months and sort
    const allMonths = new Set([...months, ...Array.from(shiftMonths)]);
    return Array.from(allMonths).sort();
  }, [shifts]);

  const availableWeeks = useMemo(() => {
    const weeks = [];
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      let weekCount = 1;
      const currentDate = new Date(firstDay);

      while (currentDate <= lastDay) {
        weeks.push(
          `${weekCount}${
            weekCount === 1
              ? "st"
              : weekCount === 2
              ? "nd"
              : weekCount === 3
              ? "rd"
              : "th"
          } Week`
        );
        currentDate.setDate(currentDate.getDate() + 7);
        weekCount++;
      }
    } catch (error) {
      console.warn("Error generating weeks:", error);
    }
    return weeks;
  }, [selectedMonth]);

  // Fixed week dates calculation
  const weekDates = useMemo(() => {
    const dates = [];
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const weekNumber = Number.parseInt(selectedWeek.split(" ")[0]);

      const firstDayOfMonth = new Date(year, month - 1, 1);

      // Find the first Saturday of the month (since your week starts with Saturday)
      const startOfWeek = new Date(firstDayOfMonth);
      const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 6 = Saturday

      // Adjust to the first Saturday
      if (dayOfWeek !== 6) {
        const daysToAdd = (6 - dayOfWeek + 7) % 7;
        startOfWeek.setDate(firstDayOfMonth.getDate() + daysToAdd);
      }

      // Add (weekNumber - 1) * 7 days to get the correct week
      startOfWeek.setDate(startOfWeek.getDate() + (weekNumber - 1) * 7);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
    } catch (error) {
      console.warn("Error generating week dates:", error);
    }
    return dates;
  }, [selectedMonth, selectedWeek]);

  // Group shifts by employee for calendar view
  const employeeShifts = useMemo(() => {
    return shifts.reduce((acc: Record<string, Shift[]>, shift: Shift) => {
      if (shift.employee && shift.employee._id) {
        const employeeId = shift.employee._id;
        if (!acc[employeeId]) {
          acc[employeeId] = [];
        }
        acc[employeeId].push(shift);
      }
      return acc;
    }, {});
  }, [shifts]);

  const employees = useMemo(() => {
    const employeesWithShifts = Object.keys(employeeShifts)
      .map((employeeId) => {
        const employeeShiftList = employeeShifts[employeeId];
        return employeeShiftList[0]?.employee;
      })
      .filter((emp): emp is Employee => emp !== undefined && emp !== null);

    // Safely combine with all employees and remove duplicates
    const allEmployeesMap = new Map();

    // Add employees with shifts
    employeesWithShifts.forEach((emp) => {
      if (emp && emp._id) {
        allEmployeesMap.set(emp._id, emp);
      }
    });

    // Add all employees (safely)
    if (Array.isArray(allEmployees)) {
      allEmployees.forEach((emp) => {
        if (emp && emp._id) {
          allEmployeesMap.set(emp._id, emp);
        }
      });
    }

    return Array.from(allEmployeesMap.values());
  }, [employeeShifts, allEmployees]);

  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Fixed date matching function
  const getShiftForEmployeeAndDate = (employeeId: string, date: Date) => {
    const employeeShiftList = employeeShifts[employeeId] || [];

    // Use local date string to avoid timezone issues
    const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format

    return employeeShiftList.find((shift) => {
      try {
        const shiftDate = new Date(shift.date);
        const shiftDateString = shiftDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format
        return shiftDateString === dateString;
      } catch (error) {
        console.warn("Invalid shift date:", shift.date);
        return false;
      }
    });
  };

  // Fixed cell click handler
  const handleCellClick = (employeeId: string, date: Date) => {
    const shift = getShiftForEmployeeAndDate(employeeId, date);
    if (!shift) {
      // Use local date string to avoid timezone issues
      const localDateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
      setSelectedDate(localDateString);
      setSelectedEmployeeId(employeeId);
      setIsModalOpen(true);
    }
  };

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
                {employee?.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {employee?.name || employee?.email || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Giorno",
      cell: ({ row }) => {
        try {
          const date = new Date(row.original.date);
          return date.toLocaleDateString("it-IT", { weekday: "long" });
        } catch (error) {
          return "Invalid date";
        }
      },
    },
    {
      accessorKey: "date",
      header: "Tempo",
      cell: ({ row }) => {
        try {
          const date = new Date(row.original.date);
          return date.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch (error) {
          return "Invalid date";
        }
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
                {employee?.name
                  ? employee.name.charAt(0).toUpperCase()
                  : employee?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {employee?.name || employee?.email || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Stato",
      cell: ({ row }) => {
        const request = row.original;
        const { toast } = useToast();
        const queryClient = useQueryClient();

        // Mutation for updating shift request status
        const updateStatusMutation = useMutation({
          mutationFn: (status: string) =>
            shiftApi.updateRequestStatus(request._id, { status }),
          onSuccess: () => {
            toast({
              title: "Success",
              description: `Shift request status updated to ${request.status.toLowerCase()} successfully`,
            });
            queryClient.invalidateQueries({ queryKey: ["shift-requests"] });
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description:
                error.response?.data?.message ||
                error.message ||
                "Failed to update shift request status",
              variant: "destructive",
            });
          },
        });

        return (
          <Select
            value={request.status}
            onValueChange={(value) => {
              updateStatusMutation.mutate(value);
            }}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger
              className={`w-32 border-none ${
                request.status === "Accepted"
                  ? "bg-green-600/20 text-green-400"
                  : request.status === "Refused"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-yellow-600/20 text-yellow-400"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem
                value="Pending"
                className="text-white hover:bg-slate-700"
              >
                In attesa
              </SelectItem>
              <SelectItem
                value="Accepted"
                className="text-white hover:bg-slate-700"
              >
                Accettato
              </SelectItem>
              <SelectItem
                value="Refused"
                className="text-white hover:bg-slate-700"
              >
                Rifiutato
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(request._id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  if (shiftsLoading || requestsLoading) {
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

      {/* Error Display */}
      {locationsError && (
        <div className="bg-red-900/20 border border-red-700 rounded p-4">
          <p className="text-red-400">
            Error loading locations: {(locationsError as Error).message}
          </p>
        </div>
      )}

      {employeesError && (
        <div className="bg-red-900/20 border border-red-700 rounded p-4">
          <p className="text-red-400">
            Error loading employees: {(employeesError as Error).message}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {locations.length > 0 ? (
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48 bg-[#030E15] border-white/10 text-white">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="all" className="text-white hover:bg-slate-700">
                All Locations
              </SelectItem>
              {locations.map((location: Location) => (
                <SelectItem
                  key={location._id}
                  value={location._id}
                  className="text-white hover:bg-slate-700"
                >
                  {location.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Skeleton className="w-48 h-10 bg-gray-700" />
        )}

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
            {availableMonths.map((month) => {
              const [year, monthNum] = month.split("-");
              const monthName = new Date(
                Number.parseInt(year),
                Number.parseInt(monthNum) - 1
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });
              return (
                <SelectItem
                  key={month}
                  value={month}
                  className="text-white hover:bg-slate-700"
                >
                  {monthName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-40 bg-[#030E15] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            {availableWeeks.map((week) => (
              <SelectItem
                key={week}
                value={week}
                className="text-white hover:bg-slate-700"
              >
                {week}
              </SelectItem>
            ))}
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
                {weekDates.map((date, index) => (
                  <th
                    key={index}
                    className="text-center p-4 text-gray-300 font-semibold min-w-[120px]"
                  >
                    <div>{daysOfWeek[index]}</div>
                    <div className="text-sm font-normal">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees
                .filter((employee) => {
                  if (!employee) return false;
                  return (
                    employee.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    employee.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  );
                })
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
                    {weekDates.map((date, index) => {
                      const shift = getShiftForEmployeeAndDate(
                        employee._id,
                        date
                      );
                      const isEvenDate = date.getDate() % 2 === 0;
                      return (
                        <td
                          key={index}
                          className="p-2 text-center cursor-pointer hover:bg-slate-600/30"
                          onClick={() => handleCellClick(employee._id, date)}
                        >
                          {shift ? (
                            <div
                              className={`px-3 py-2 rounded text-sm font-medium ${
                                isEvenDate
                                  ? "bg-[#4C3906] text-white"
                                  : "bg-[#000659] text-white"
                              }`}
                            >
                              <div>{shift.shiftType?.title || "Unknown"}</div>
                              <div className="text-xs">
                                {shift.shiftType?.startTime?.slice(0, 5) ||
                                  "00:00"}
                                -
                                {shift.shiftType?.endTime?.slice(0, 5) ||
                                  "00:00"}
                              </div>
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded text-sm font-medium bg-gray-600/30 text-gray-400 hover:bg-gray-600/50 transition-colors">
                              <Plus className="h-4 w-4 mx-auto" />
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

        {/* Pagination for Shifts */}
        {shiftsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing page {shiftsPagination.page} of{" "}
              {shiftsPagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={shiftsPagination.page === 1}
                className="border-white/10 text-white hover:bg-slate-700 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {Array.from(
                { length: Math.min(5, shiftsPagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (shiftsPagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (shiftsPagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (
                    shiftsPagination.page >=
                    shiftsPagination.totalPages - 2
                  ) {
                    pageNum = shiftsPagination.totalPages - 4 + i;
                  } else {
                    pageNum = shiftsPagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        shiftsPagination.page === pageNum
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        shiftsPagination.page === pageNum
                          ? "bg-blue-600 text-white"
                          : "border-white/10 text-white hover:bg-slate-700 bg-transparent"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={shiftsPagination.page === shiftsPagination.totalPages}
                className="border-white/10 text-white hover:bg-slate-700 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Shift Requests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Richiesta di assegnazione
        </h2>
        {requests.length > 0 ? (
          <DataTable columns={requestColumns} data={requests} />
        ) : (
          <div className="bg-[#030E15] rounded-lg border border-white/10 p-8 text-center">
            <p className="text-gray-400">No shift requests found</p>
          </div>
        )}
      </div>

      <ShiftAssignmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployeeId("");
        }}
        selectedDate={selectedDate}
        selectedLocation={
          selectedLocation === "all"
            ? locations[0]?._id || ""
            : selectedLocation
        }
        selectedEmployeeId={selectedEmployeeId}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteRequestMutation.isPending}
        title="Delete Shift Request"
        description="Are you sure you want to delete this shift request? This action cannot be undone."
      />
    </div>
  );
}
