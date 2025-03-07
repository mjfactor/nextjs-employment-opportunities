import { redirect } from "next/navigation"
import AuthSidebarWrapper from "@/components/client/sidebar/auth-sidebar-wrapper"
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
import { ModeToggle } from "@/components/client/dark-light-toggle/theme-toggle"
import { ResumeSubmissionFormWrapper } from "@/components/client/career-compass/resume-submission-form-wrapper"

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/signin")
  }

  return (
    <SidebarProvider>
      <AuthSidebarWrapper />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Employment Opportunities</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/career-compass">Career Compass</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Career Compass</h1>
          <p className="text-muted-foreground mb-8">
            Upload your resume or manually enter your details to get personalized career recommendations.
          </p>

          <ResumeSubmissionFormWrapper />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

