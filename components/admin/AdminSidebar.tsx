'use client'

import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items per il gestionale
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Prodotti",
    url: "/products",
    icon: Package,
  },
  {
    title: "Ordini",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Clienti",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Impostazioni",
    url: "/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border bg-white">
      <SidebarHeader className="px-4 sm:px-6 py-4 border-b border-sidebar-border bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-navy flex items-center justify-center">
            <span className="text-cream font-playfair font-bold text-xl sm:text-lg">B</span>
          </div>
          <div>
            <h2 className="font-playfair text-xl sm:text-lg font-bold text-navy">BibiGin</h2>
            <p className="text-xs text-muted-foreground">Gestionale Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium px-4 sm:px-2">
            Gestionale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="hover:bg-accent/10 hover:text-navy transition-colors mx-2 sm:mx-0 h-12 sm:h-8 text-base sm:text-sm"
                  >
                    <a href={item.url} className="flex items-center gap-3 sm:gap-2">
                      <item.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full hover:bg-destructive/10 hover:text-destructive transition-colors h-12 sm:h-8 text-base sm:text-sm mx-0">
              <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}