"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ExternalLink, ChevronDown, ChevronUp, X, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

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

    const clearSearch = () => {
        setSearchQuery("")
    }

    return (
        <div className="space-y-6 w-full max-w-[70rem] mx-auto">
            {/* Header with statistics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <h1 className="text-2xl font-bold">Job Resources</h1>
                </div>
                <p className="text-muted-foreground">
                    Browse through {totalResources} curated resources to help with your job search.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 w-full bg-background/80 backdrop-blur-sm border-muted"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={toggleAllCategories}
                    className="whitespace-nowrap transition-all hover:bg-muted/80"
                >
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
                <div className="text-sm text-muted-foreground bg-muted/30 py-2 px-4 rounded-md inline-block">
                    Showing {filteredCount} of {totalResources} resources
                </div>
            )}

            <div className="grid gap-6">
                {filteredResources.map((category) => (
                    <motion.div
                        key={category.category}
                        className="border rounded-xl shadow-sm overflow-hidden bg-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Category Header - Clickable */}
                        <div
                            className="flex justify-between items-center p-5 cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => toggleCategory(category.category)}
                        >
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold">{category.category}</h2>
                                <Badge variant="secondary" className="ml-2">{category.items.length}</Badge>
                            </div>
                            <motion.div
                                animate={{ rotate: openCategories[category.category] ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="h-5 w-5" />
                            </motion.div>
                        </div>

                        {/* Category Content */}
                        <AnimatePresence>
                            {openCategories[category.category] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Separator />
                                    <div className="p-5">
                                        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                                            {category.items.map((item) => (
                                                <motion.div
                                                    key={item.name}
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                >
                                                    <Card className="h-full transition-all hover:shadow-md flex flex-col border-muted">
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-lg">{item.name}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pb-2 flex-grow">
                                                            <CardDescription className="line-clamp-3">{item.description}</CardDescription>
                                                        </CardContent>
                                                        <CardFooter>
                                                            <Button variant="outline" size="sm" asChild className="w-full group">
                                                                <a
                                                                    href={item.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center"
                                                                >
                                                                    Visit
                                                                    <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                                                </a>
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <motion.div
                    className="text-center py-12 bg-muted/30 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-xl font-medium">No resources found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search query</p>
                    <Button variant="secondary" onClick={clearSearch} className="mt-4">
                        Clear Search
                    </Button>
                </motion.div>
            )}
        </div>
    )
}

