"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type ResourceItem = {
    name: string
    url: string
    description: string
}

type ResourceCategory = {
    category: string
    items: ResourceItem[]
}

interface JobResourcesUIProps {
    resources: ResourceCategory[]
}

export default function JobResourcesUI({ resources }: JobResourcesUIProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
    const [expandAll, setExpandAll] = useState(true)

    // Initialize all categories as open on first render
    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {}
        resources.forEach((category) => {
            initialOpenState[category.category] = true
        })
        setOpenCategories(initialOpenState)
    }, [resources])

    // Toggle a specific category
    const toggleCategory = (category: string) => {
        setOpenCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }))
    }

    // Toggle all categories
    const toggleAllCategories = () => {
        const newExpandAll = !expandAll
        setExpandAll(newExpandAll)

        const newOpenState: Record<string, boolean> = {}
        resources.forEach((category) => {
            newOpenState[category.category] = newExpandAll
        })
        setOpenCategories(newOpenState)
    }

    // Filter resources based on search query
    const filteredResources = useMemo(() => {
        if (!searchQuery.trim()) return resources

        const query = searchQuery.toLowerCase().trim()

        return resources
            .map((category) => {
                const filteredItems = category.items.filter(
                    (item) =>
                        item.name.toLowerCase().includes(query) ||
                        item.description.toLowerCase().includes(query) ||
                        category.category.toLowerCase().includes(query),
                )

                return {
                    ...category,
                    items: filteredItems,
                }
            })
            .filter((category) => category.items.length > 0)
    }, [resources, searchQuery])

    // Count total resources
    const totalResources = useMemo(() => {
        return resources.reduce((total, category) => total + category.items.length, 0)
    }, [resources])

    // Count filtered resources
    const filteredCount = useMemo(() => {
        return filteredResources.reduce((total, category) => total + category.items.length, 0)
    }, [filteredResources])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <Button variant="outline" onClick={toggleAllCategories} className="whitespace-nowrap">
                    {expandAll ? (
                        <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Collapse All
                        </>
                    ) : (
                        <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Expand All
                        </>
                    )}
                </Button>
            </div>

            {searchQuery && (
                <div className="text-sm text-muted-foreground">
                    Showing {filteredCount} of {totalResources} resources
                </div>
            )}

            <div className="grid gap-6">
                {filteredResources.map((category) => (
                    <div key={category.category} className="border rounded-lg shadow-sm">
                        {/* Category Header - Clickable */}
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleCategory(category.category)}
                        >
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold">{category.category}</h2>
                                <Badge variant="outline">{category.items.length}</Badge>
                            </div>
                            {openCategories[category.category] ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </div>

                        {/* Category Content */}
                        {openCategories[category.category] && (
                            <>
                                <Separator />
                                <div className="p-4">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {category.items.map((item) => (
                                            <Card key={item.name} className="h-full">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pb-2">
                                                    <CardDescription className="line-clamp-3">{item.description}</CardDescription>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button variant="outline" size="sm" asChild className="w-full">
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center"
                                                        >
                                                            Visit <ExternalLink className="ml-2 h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium">No resources found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search query</p>
                </div>
            )}
        </div>
    )
}

