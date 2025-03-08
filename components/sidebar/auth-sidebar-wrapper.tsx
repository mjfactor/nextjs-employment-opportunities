import { auth } from "@/auth"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import type * as React from "react"

export default async function AuthSidebarWrapper(props: React.ComponentPropsWithoutRef<typeof AppSidebar>) {
    const session = await auth()
    const userData = session?.user ? {
        name: session.user.name || "Unknown User", // Provide default for name
        email: session.user.email || "", // Provide default for email
        image: session.user.image || undefined // Convert null to undefined
    } : null
    return <AppSidebar userData={userData} {...props} />

}
