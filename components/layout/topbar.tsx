"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Menu, ChevronRight, User as UserIcon, LogOut } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "@/components/layout/nav";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "All Users List",
  "/subscription": "Subscription Plan",
  "/terms": "Terms & Conditions",
  "/help-support": "Help & Support",
  "/profile": "Profile",
};

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title =
    TITLES[pathname] ??
    TITLES[Object.keys(TITLES).find((k) => pathname.startsWith(k)) ?? ""] ??
    "Dashboard";

  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="lg:hidden -ml-1 rounded-md p-2 text-foreground hover:bg-accent cursor-pointer">
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle>Navigation</SheetTitle>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Home className="size-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="size-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{title}</span>
        </nav>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer">
          <Avatar className="size-10 border">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback>{getInitials(user?.name ?? undefined)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-semibold">{user?.name ?? "Admin"}</span>
            <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="size-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
