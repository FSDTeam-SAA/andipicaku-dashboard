"use client";

import { useState, useMemo } from "react";
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

  const possiblePaths = [
    "data.pagination",
    "pagination",
    "data.data.pagination",
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

export default function AvailabilityPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
  });
  const [selectedWeek, setSelectedWeek] = useState("1st Week");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: availabilityData, isLoading, error } = useQuery({
    queryKey: ["availability", page, limit, selectedLocation],
    queryFn: () =>
      availabilityApi.getAll({
        page,
        limit,
        location: selectedLocation === "all" ? undefined : selectedLocation,
      }),
    onError: (error) => console.error("Error fetching availabilities:", error),
  });

  // Extract availabilities and pagination
  const availabilities = getArrayData(
    extractData(availabilityData, [
      "data.availabilities",
      "data.data.availabilities",
      "availabilities",
      "data",
    ])
  );
  const pagination = extractPagination(availabilityData);

  // Extract unique locations
  const locations = useMemo(() => {
    const locationMap = new Map<string, Location>();
    availabilities.forEach((availability: Availability) => {
      if (availability.location?._id) {
        locationMap.set(availability.location._id, availability.location);
      }
    });
    return Array.from(locationMap.values());
  }, [availabilities]);

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  const handlePageChange = (pageNum: number) => {
    setPage(pageNum);
  };

  // Calculate available months
  const availableMonths = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const monthString = `${currentYear}-${String(month).padStart(2, "0")}`;
      months.push(monthString);
    }

    const availabilityMonths = new Set<string>();
    availabilities.forEach((availability: Availability) => {
      try {
        const date = new Date(availability.date);
        const monthYear = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        availabilityMonths.add(monthYear);
      } catch (error) {
        console.warn("Invalid availability date:", availability.date);
      }
    });

    return Array.from(new Set([...months, ...availabilityMonths])).sort();
  }, [availabilities]);

  // Calculate available weeks
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
          `${weekCount}${weekCount === 1 ? "st" : weekCount === 2 ? "nd" : weekCount === 3 ? "rd" : "th"} Week`
        );
        currentDate.setDate(currentDate.getDate() + 7);
        weekCount++;
      }
    } catch (error) {
      console.warn("Error generating weeks:", error);
    }
    return weeks;
  }, [selectedMonth]);

  // Calculate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const weekNumber = Number.parseInt(selectedWeek.split(" ")[0]);
      const firstDayOfMonth = new Date(year, month - 1, 1);
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

  // Group availabilities by employee
  const employeeAvailabilities = useMemo(() => {
    return availabilities.reduce(
      (acc: Record<string, Availability[]>, availability: Availability) => {
        const employeeId = availability.employee?._id;
        if (employeeId) {
          if (!acc[employeeId]) {
            acc[employeeId] = [];
          }
          acc[employeeId].push(availability);
        }
        return acc;
      },
      {}
    );
  }, [availabilities]);

  // Get unique employees
  const employees = useMemo(() => {
    const employeesMap = new Map<string, Employee>();
    Object.keys(employeeAvailabilities).forEach((employeeId) => {
      const employeeAvails = employeeAvailabilities[employeeId];
      const employee = employeeAvails[0]?.employee;
      if (employee && employee._id) {
        employeesMap.set(employee._id, employee);
      }
    });
    return Array.from(employeesMap.values());
  }, [employeeAvailabilities]);

  // Get availabilities for employee and date
  const getAvailabilitiesForEmployeeAndDate = (
    employeeId: string,
    date: Date
  ) => {
    const employeeAvails = employeeAvailabilities[employeeId] || [];
    const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
    return employeeAvails.filter((availability) => {
      try {
        const availabilityDate = new Date(availability.date);
        return (
          availabilityDate.toLocaleDateString("en-CA") === dateString &&
          (selectedLocation === "all" || availability.location._id === selectedLocation)
        );
      } catch (error) {
        console.warn("Invalid availability date:", availability.date);
        return false;
      }
    });
  };

  const daysOfWeek = [
    "Sabato",
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
  ];

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

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded p-4">
          <p className="text-red-400">
            Error loading availabilities: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-48 bg-[#030E15] border-white/10 text-white">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              Tutte le sedi
            </SelectItem>
            {locations.map((location) => (
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
              const [year, monthNum] = month.split("-").map(Number);
              const monthName = new Date(year, monthNum - 1).toLocaleDateString(
                "it-IT",
                {
                  month: "long",
                  year: "numeric",
                }
              );
              return (
                <SelectItem
                  key={month}
                  value={month}
                  className="text-white hover:bg-slate-700"
                >
                  {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
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

      {/* Calendar Table */}
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
                      {date.toLocaleDateString("it-IT", {
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
                .filter(
                  (employee) =>
                    employee &&
                    (employee.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                      employee.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
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
                    {weekDates.map((date, index) => {
                      const availabilities = getAvailabilitiesForEmployeeAndDate(
                        employee._id,
                        date
                      );
                      const isEvenDate = date.getDate() % 2 === 0;
                      return (
                        <td key={index} className="p-2 text-center">
                          {availabilities.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {availabilities.map((availability) => (
                                <div
                                  key={availability._id}
                                  className={`px-3 py-2 rounded text-sm font-medium ${
                                    isEvenDate
                                      ? "bg-[#4C3906] text-white"
                                      : "bg-[#000659] text-white"
                                  }`}
                                >
                                  <div>{availability.shiftType.title}</div>
                                  <div className="text-xs">
                                    {availability.shiftType.startTime.slice(0, 5)}-
                                    {availability.shiftType.endTime.slice(0, 5)}
                                  </div>
                                  <div className="text-xs opacity-70">
                                    {availability.location.title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded text-sm font-medium bg-gray-600/30 text-gray-400">
                              -
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
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Visualizzazione pagina {pagination.page} di {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pagination.page === 1}
                className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.page >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        pagination.page === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
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
                disabled={pagination.page === pagination.totalPages}
                className="bg-[#030E15] border-white/10 text-white hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}