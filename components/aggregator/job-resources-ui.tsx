"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategorySection } from "@/components/aggregator/category-section"
import { SearchIcon, XIcon, ChevronLeft, ChevronRight } from "lucide-react"

type Resource = {
    name: string
    url: string
    description: string
}

type Category = {
    category: string
    items: Resource[]
}

interface JobResourcesUIProps {
    resources: Category[]
}

// Add this after the imports
// Custom CSS to hide scrollbar but allow scrolling
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

export function JobResourcesUI({ resources }: JobResourcesUIProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")
    const [filteredResources, setFilteredResources] = useState<Category[]>(resources)


    // Filter resources based on search query
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredResources(resources)
        } else {
            const query = searchQuery.toLowerCase()
            const filtered = resources
                .map((category) => {
                    return {
                        category: category.category,
                        items: category.items.filter(
                            (item) =>
                                item.name.toLowerCase().includes(query) ||
                                item.description.toLowerCase().includes(query) ||
                                item.url.toLowerCase().includes(query),
                        ),
                    }
                })
                .filter((category) => category.items.length > 0)

            setFilteredResources(filtered)
        }
    }, [searchQuery, resources])

    // Get all categories for tabs
    const categories = ["all", ...resources.map((r) => r.category)]

    // Filter by category tab
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        if (value === "all") {
            setFilteredResources(resources)
        } else {
            setFilteredResources(resources.filter((r) => r.category === value))
        }
    }

    return (
        <div className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
                <style>{scrollbarHideStyles}</style>
                <div className="flex flex-col space-y-4 sm:space-y-6">
                    <header className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Job Resources</h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">A curated collection of tools and resources for job seekers</p>
                        </div>
                    </header>

                    <div className="flex flex-col space-y-4 max-w-full">
                        <div className="relative w-full">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search resources..."
                                className="pl-10 pr-10 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <XIcon className="h-4 w-4" />
                                    <span className="sr-only">Clear search</span>
                                </Button>
                            )}
                        </div>

                        <div className="relative w-full">
                            <div className="absolute left-0 top-0 z-10 h-full w-6 sm:w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 z-10 h-full w-6 sm:w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />

                            <div className="relative flex items-center max-w-full overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-0 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background/90 hidden sm:flex"
                                    onClick={() => {
                                        const container = document.querySelector(".category-scroll-container")
                                        if (container) {
                                            container.scrollBy({ left: -200, behavior: "smooth" })
                                        }
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="sr-only">Scroll left</span>
                                </Button>

                                <div
                                    className="category-scroll-container flex w-full items-center overflow-x-auto scrollbar-hide py-2 px-2 sm:px-8 max-w-full"
                                    style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
                                >
                                    <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full max-w-full">
                                        <TabsList className="flex h-9 sm:h-10 w-max space-x-1 bg-muted/20 p-1 max-w-full">
                                            {categories.map((category) => (
                                                <TabsTrigger
                                                    key={category}
                                                    value={category}
                                                    className="h-7 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap"
                                                >
                                                    {category === "all" ? "All Categories" : category}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background/90 hidden sm:flex"
                                    onClick={() => {
                                        const container = document.querySelector(".category-scroll-container")
                                        if (container) {
                                            container.scrollBy({ left: 200, behavior: "smooth" })
                                        }
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="sr-only">Scroll right</span>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full">
                            {filteredResources.length > 0 ? (
                                filteredResources.map((category) => (
                                    <CategorySection key={category.category} category={category.category} resources={category.items} />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <h3 className="text-lg font-medium">No resources found</h3>
                                    <p className="text-muted-foreground mt-1">Try adjusting your search query</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

