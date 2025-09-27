"use client"

import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cvApi } from "@/lib/api"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface CV {
  _id: string
  name: string
  designation: string
  user: string
  location: string
  cv: string
  approvalStatus: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export default function CVPage() {
  const { data: cvData, isLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getAll,
  })

  const cvs = cvData?.data?.data || []

  const handleDownload = async (cvUrl: string, fileName: string) => {
    try {
      const response = await fetch(cvUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName || "cv.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("CV scaricato con successo!")
    } catch (error) {
      toast.error("Errore nel download del CV")
    }
  }

  const columns: ColumnDef<CV>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const cv = row.original
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-slate-700 text-white">{cv.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{cv.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: () => "Non disponibile", // Email not provided in CV API response
    },
    {
      accessorKey: "designation",
      header: "Numero",
      cell: ({ row }) => row.original.designation,
    },
    {
      id: "cv",
      header: "CV",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDownload(row.original.cv, `${row.original.name}_CV.pdf`)}
          className="text-pink-400 hover:text-pink-300 hover:bg-slate-700"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      ),
    },
  ]

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
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">CV</h1>
          <p className="text-gray-300">Dashboard &gt; CV</p>
        </div>
      </div>

      <DataTable columns={columns} data={cvs} searchKey="name" searchPlaceholder="Cerca CV" />
    </div>
  )
}
