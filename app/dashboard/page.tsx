import { redirect } from "next/navigation"
import AuthSidebarWrapper from "@/components/sidebar/auth-sidebar-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { ModeToggle } from "@/components/dark-light-toggle/theme-toggle"
import { cn } from "@/lib/utils"

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/")
  }
  return (
    <SidebarProvider>
      <AuthSidebarWrapper />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-zinc-800 bg-black/50">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hover:text-green-500 transition-colors" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/dashboard"
                    className="hover:text-green-500 transition-colors"
                  >
                    Employment Opportunities
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </header>

        <div className="p-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 hover:border-green-500/30 transition-colors">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-zinc-400">Welcome to your career analysis dashboard</p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

