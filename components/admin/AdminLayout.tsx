'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminGuard } from "@/components/auth/AdminGuard"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { Separator } from "@/components/ui/separator"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col">
          {/* Mobile Sidebar Trigger */}
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-3 sm:px-4">
              <SidebarTrigger className="-ml-1 h-9 w-9 min-h-9 min-w-9" />
              <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
            </div>
            <div className="flex-1">
              <AdminHeader />
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  )
}