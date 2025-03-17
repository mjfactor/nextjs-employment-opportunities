"use client"

import type * as React from "react"
import {
  Compass,
  LayoutDashboard,
  FileText,
  Trash2
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar"

export function AppSidebar({
  userData,
  ...props
}: {
  userData?: { name: string; email: string; image?: string } | null
} & React.ComponentProps<typeof Sidebar>) {
  // Get current pathname to check which page we're on
  const pathname = usePathname()
  const isCareerCompassPage = pathname?.includes('/dashboard/career-compass')

  // Use userData if available, otherwise fall back to sample data
  const data = {
    user: userData ? {
      name: userData.name,
      email: userData.email,
      avatar: userData.image || "/avatars/shadcn.jpg", // Map image to avatar
    } : {
      name: "Guest",
      email: "",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      // Direct access to Career Compass and Aggregator
      {
        title: "Career Compass",
        url: "/dashboard/career-compass",
        icon: Compass,
        isActive: isCareerCompassPage,
      },
      {
        title: "Aggregator",
        url: "/dashboard/aggregator",
        icon: LayoutDashboard,
        isActive: pathname?.includes('/dashboard/aggregator') || false,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <NavMain items={data.navMain} />

        {/* Only show History section on Career Compass page */}
        {isCareerCompassPage && (
          <>
            <div className="w-full overflow-hidden">
              <SidebarSeparator className="my-2 w-full max-w-full" />
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Recent Chat</SidebarGroupLabel>
              <SidebarMenu className="space-y-1.5">
                {/* Placeholder for history items */}
                <SidebarMenuItem className="overflow-hidden">
                  <SidebarMenuButton tooltip="Software Developer Analysis" className="py-2">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex flex-col overflow-hidden">
                      <span className="text-sm truncate">Software Developer Analysis</span>
                      <span className="text-xs text-muted-foreground">Today, 2:30 PM</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="overflow-hidden">
                  <SidebarMenuButton tooltip="Data Scientist Career Path" className="py-2">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex flex-col overflow-hidden">
                      <span className="text-sm truncate">Data Scientist Career Path</span>
                      <span className="text-xs text-muted-foreground">Yesterday</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="overflow-hidden">
                  <SidebarMenuButton tooltip="UX Design Resume Analysis" className="py-2">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex flex-col overflow-hidden">
                      <span className="text-sm truncate">UX Design Resume Analysis</span>
                      <span className="text-xs text-muted-foreground">May 15, 2023</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Removed "View all history" as requested */}

                {/* Clear history button with modern styling */}
                <SidebarMenuItem className="overflow-hidden">
                  <SidebarMenuButton
                    tooltip="Clear history"
                    className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => {
                      // Placeholder for clearing history functionality
                      console.log("Clear history clicked");
                    }}
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">Clear history</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}