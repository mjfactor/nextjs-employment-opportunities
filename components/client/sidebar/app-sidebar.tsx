"use client"

import type * as React from "react"
import {
  BookOpen,
  Bot,
  BriefcaseBusiness
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

export function AppSidebar({
  userData,
  ...props
}: {
  userData?: { name: string; email: string; image?: string } | null
} & React.ComponentProps<typeof Sidebar>) {
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
      // ...existing navMain items
      {
        title: "Employment Opportunities",
        url: "/dashboard",
        icon: BriefcaseBusiness,
        isActive: true,

        items: [
          {
            title: "Career Compass",
            url: "/dashboard/career-compass",
          },
          {
            title: "ATS",
            url: "/dashboard/ats",
          },
          {
            title: "Aggregator",
            url: "/dashboard/aggregator",
          },
        ],
      },
      {
        title: "About",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}