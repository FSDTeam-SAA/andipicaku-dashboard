"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  MapPin,
  UserCheck,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

const getNavigationForRole = (role: string) => {

  console.log("RRRRRRRRRRRRR", role)
  const baseNavigation = [
    {
      name: "Panoramica",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["admin", "manager"],
    },
    {
      name: "Dipendente",
      href: "/admin/employees",
      icon: Users,
      roles: ["admin", "manager"], 
    },
    {
      name: "Disponibilità",
      href: "/admin/availability",
      icon: Clock,
      roles: ["admin", "manager"],
    },
    {
      name: "Turni",
      href: "/admin/shifts",
      icon: Calendar,
      roles: ["admin", "manager"],
    },
    {
      name: "Manager",
      href: "/admin/managers",
      icon: UserCheck,
      roles: ["admin"],
    },
    {
      name: "Messaggi",
      href: "/admin/messages",
      icon: MessageSquare,
      roles: ["admin", "manager"],
    },
    {
      name: "Locale",
      href: "/admin/locations",
      icon: MapPin,
      roles: ["admin"],
    },
    {
      name: "CV",
      href: "/admin/cv",
      icon: FileText,
      roles: ["admin"],
    },
  ];

  return baseNavigation.filter((item) => item.roles.includes(role));
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { data: session, status } = useSession();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getProfile(),
    enabled: !!session,
    select: (data) => data.data.data,
  });

  const navigation = getNavigationForRole(session?.user?.role || "manager");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Le password non corrispondono");
      return;
    }

    try {
      await authApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password cambiata con successo");
      setShowPasswordModal(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Errore nel cambiare la password");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/auth/login" });
      toast.success("Logout effettuato con successo");
    } catch (error) {
      toast.error("Errore durante il logout");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Middleware will redirect
  }

  return (
    <div className="min-h-screen bg-[#32071c]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#030E15] backdrop-blur-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-2 py-4">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-[98px] w-[112px]"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-[#901450] text-white"
                      : "text-gray-300 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-slate-700 p-4 text-white">
            <div
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-white/10 bg-[#030E15] backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center justify-end">
            <div className="ml-auto">
              <button
                variant="ghost"
                className="w-full max-w-xs justify-start text-white flex items-center rounded-md px-3 py-2 text-sm font-medium"
                
              >
                <Avatar className="h-8 w-8 mr-3" onClick={() => setShowPasswordModal(true)}>
                  <AvatarImage
                    src={userProfile?.avatar?.url || session?.user?.avatar}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {userProfile?.username || session?.user?.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {session?.user?.role === "admin"
                      ? "Amministratore"
                      : "Manager"}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Cambia Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="text-white">
                Password Attuale
              </Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">
                Nuova Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Conferma Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Annulla
              </Button>
              <Button type="submit" className="bg-[#901450] hover:bg-pink-700">
                Cambia Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Conferma Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">Sei sicuro di voler uscire?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              No
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-[#901450] hover:bg-red-700"
            >
              Sì, Esci
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
