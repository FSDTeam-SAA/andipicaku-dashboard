"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { shiftApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ShiftAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  selectedLocation: string
  selectedEmployeeId?: string
}

interface Employee {
  _id: string
  name?: string
  email: string
}

interface ShiftType {
  _id: string
  title: string
  startTime: string
  endTime: string
}

interface Location {
  _id: string
  title: string
  shifts: ShiftType[]
}

// Helper function to safely extract array data
const extractArrayData = (data: any, possiblePaths: string[]): any[] => {
  if (!data) return []
  
  for (const path of possiblePaths) {
    try {
      const value = path.split('.').reduce((obj, key) => obj?.[key], data)
      if (value !== undefined && value !== null) {
        return Array.isArray(value) ? value : []
      }
    } catch (error) {
      console.warn(`Error extracting data from path ${path}:`, error)
    }
  }
  return []
}

export function ShiftAssignmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedLocation,
  selectedEmployeeId,
}: ShiftAssignmentModalProps) {
  
  const [selectedShiftType, setSelectedShiftType] = useState("")
  const [selectedLocationState, setSelectedLocationState] = useState(selectedLocation)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    setSelectedLocationState(selectedLocation)
  }, [selectedLocation])

  // Reset shift type when location changes
  useEffect(() => {
    setSelectedShiftType("")
  }, [selectedLocationState])

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: shiftApi.getEmployees,
  })

  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: shiftApi.getLocations,
  })


  const assignShiftMutation = useMutation({
    mutationFn: (data: any) => shiftApi.createShift(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shift assigned successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
      handleClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to assign shift",
        variant: "destructive",
      })
    },
  })

  const handleClose = () => {
    setSelectedShiftType("")
    setSelectedLocationState("")
    onClose()
  }

  const handleAssignShift = () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Error",
        description: "No employee selected",
        variant: "destructive",
      })
      return
    }

    if (!selectedShiftType || !selectedLocationState) {
      toast({
        title: "Error",
        description: "Please select location and shift type",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "No date selected",
        variant: "destructive",
      })
      return
    }

    const shiftData = {
      employee: selectedEmployeeId,
      shiftType: selectedShiftType,
      location: selectedLocationState,
      date: selectedDate,
    }

    console.log("Assigning shift with data:", shiftData)
    assignShiftMutation.mutate(shiftData)
  }

  const employees = extractArrayData(employeesData, ['data.data.employees', 'data.employees', 'employees', 'data'])
  const locations = extractArrayData(locationsData, ['data.data.locations', 'data.locations', 'locations', 'data'])

  // Get the selected location's shifts
  const selectedLocationData = locations.find((loc: Location) => loc._id === selectedLocationState)
  const availableShifts = selectedLocationData?.shifts || []

  // Get the selected employee info for display
  const selectedEmployee = employees.find((emp: Employee) => emp._id === selectedEmployeeId)

  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#030E15] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Assign Shift</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Date</label>
            <div className="px-3 py-2 bg-slate-800 rounded border border-white/10 text-white">
              {selectedDate ? (
                new Date(selectedDate + 'T00:00:00') // Add time to avoid timezone issues
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
              ) : (
                "No date selected"
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
            <Select 
              value={selectedLocationState} 
              onValueChange={setSelectedLocationState}
            >
              <SelectTrigger className="bg-[#030E15] border-white/10 text-white">
                <SelectValue placeholder={
                  locationsLoading ? "Loading locations..." : "Select location"
                } />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {locations.length > 0 ? (
                  locations.map((location: Location) => (
                    <SelectItem 
                      key={location._id} 
                      value={location._id} 
                      className="text-white hover:bg-slate-700"
                    >
                      {location.title}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-400">
                    No locations found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Shift Type</label>
            <Select 
              value={selectedShiftType} 
              onValueChange={setSelectedShiftType}
              disabled={!selectedLocationState}
            >
              <SelectTrigger className="bg-[#030E15] border-white/10 text-white">
                <SelectValue placeholder={
                  !selectedLocationState 
                    ? "Select location first" 
                    : availableShifts.length === 0 
                    ? "No shifts available for this location"
                    : "Select shift type"
                } />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {availableShifts.length > 0 ? (
                  availableShifts.map((shiftType: ShiftType) => (
                    <SelectItem 
                      key={shiftType._id} 
                      value={shiftType._id} 
                      className="text-white hover:bg-slate-700"
                    >
                      {shiftType.title} ({shiftType.startTime} - {shiftType.endTime})
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-400">
                    {selectedLocationState ? "No shifts available for this location" : "Please select a location first"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-white/10 text-white hover:bg-slate-700 bg-transparent"
            disabled={assignShiftMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignShift}
            disabled={assignShiftMutation.isPending || !selectedEmployeeId || !selectedShiftType || !selectedLocationState}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {assignShiftMutation.isPending ? "Assigning..." : "Assign Shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}