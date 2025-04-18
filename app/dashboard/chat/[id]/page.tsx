import { Chat } from '@/components/chatBot/chat'
import { getChat } from '@/lib/actions/chat'

import { convertToUIMessages } from '@/lib/utils/index'
import { notFound, redirect } from 'next/navigation'
import AuthSidebarWrapper from "@/components/sidebar/auth-sidebar-wrapper"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/dark-light-toggle/theme-toggle"
import { auth } from "@/auth"
import { Metadata } from "next"

export const maxDuration = 60

export async function generateMetadata(props: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await props.params
    const chat = await getChat(id)
    return {
        title: chat?.title ? `Chat: ${chat.title.toString().slice(0, 50)}` : 'Chat',
        description: "Conversation with career assistant"
    }
}

export default async function SearchPage(props: {
    params: Promise<{ id: string }>,
}) {
    const session = await auth()
    if (!session) {
        redirect("/")
    }

    const userId = session.user?.id || 'anonymous'
    const { id } = await props.params

    const chat = await getChat(id)
    // convertToUIMessages for useChat hook
    const messages = convertToUIMessages(chat?.messages || [])

    if (!chat) {
        redirect('/dashboard/chat/')
    }

    if (chat?.userId !== userId && chat?.userId !== 'anonymous') {
        notFound()
    }


    return (<SidebarProvider>
        <AuthSidebarWrapper />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <ModeToggle />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/dashboard">Employment Opportunities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/dashboard/career-compass">Chatbot</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <Chat id={id} savedMessages={messages} userId={userId} />
        </SidebarInset>
    </SidebarProvider>)
}
