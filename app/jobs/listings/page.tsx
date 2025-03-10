import { Metadata } from "next"
import { formatPageTitle } from "@/lib/utils"

export const metadata: Metadata = {
    title: formatPageTitle("listings"), // "Listings | ForestAI"
    // OR if you want the full path: formatPageTitle("jobs/listings")
    description: "Browse available job opportunities",
}

export default function JobListingsPage() {
    // Page content
}
