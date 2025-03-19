import { redirect } from "next/navigation"
import AuthSidebarWrapper from "@/components/sidebar/auth-sidebar-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { ModeToggle } from "@/components/dark-light-toggle/theme-toggle"
import { Metadata } from "next"
import { formatPageTitle } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Compass, Globe, Search, BarChart3, Book, Briefcase, Rocket } from "lucide-react"

export const metadata: Metadata = {
  title: formatPageTitle("dashboard"),
  description: "Manage your career insights dashboard",
}

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/")
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="container mx-auto px-32 py-8">
          {/* Introduction Section */}
          <section className="mb-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Your Career Dashboard
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Discover, track, and optimize your career journey with our comprehensive employment tools.
              </p>
              <p className="text-muted-foreground mb-8">
                This platform empowers you to manage your job search efficiently, track opportunities, analyze market trends,
                and make data-driven career decisions. Explore our suite of tools designed to help you
                navigate the job market with confidence and precision.
              </p>
            </div>
          </section>

          {/* Navigation Cards */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Explore Our Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Career Compass Card */}
              <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    Career Compass
                  </CardTitle>
                  <CardDescription>Navigate your career path</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Get personalized guidance, skill recommendations, and career planning tools to chart your professional journey.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary transition-colors">
                    <Link href="/dashboard/career-compass">
                      Explore <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Job Aggregator Card */}
              <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Job Aggregator
                  </CardTitle>
                  <CardDescription>All opportunities in one place</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Search and filter job listings from multiple sources, customized to your skills and preferences.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary transition-colors">
                    <Link href="/dashboard/aggregator">
                      Discover <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Application Tracker Card */}
              <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Application Tracker
                  </CardTitle>
                  <CardDescription>Manage your job applications</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Track application statuses, set reminders for follow-ups, and organize your job search process.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary transition-colors">
                    <Link href="/dashboard/tracker">
                      Track <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Market Research Card */}
              <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Market Research
                  </CardTitle>
                  <CardDescription>Industry insights & trends</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Access salary data, industry growth trends, and demand forecasts to make informed career decisions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary transition-colors">
                    <Link href="/dashboard/research">
                      Analyze <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Skill Development Card */}
              <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    Skill Development
                  </CardTitle>
                  <CardDescription>Enhance your capabilities</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Find courses, certifications, and resources that align with your career goals and industry demands.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary transition-colors">
                    <Link href="/dashboard/skills">
                      Develop <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Coming Soon Card */}
              <Card className="overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <Rocket className="h-5 w-5" />
                    Coming Soon
                  </CardTitle>
                  <CardDescription>More tools on the horizon</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    We're continuously developing new features to enhance your career journey. Stay tuned for updates!
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" disabled className="w-full opacity-70">
                    Stay Tuned
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

