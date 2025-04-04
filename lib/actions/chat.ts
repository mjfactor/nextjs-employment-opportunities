'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { getRedisClient } from '@/lib/redis/config'

const CHAT_VERSION = 'v2'
function getUserChatKey(userId: string) {
    return `user:${CHAT_VERSION}:chat:${userId}`
}

export async function getChats(userId?: string | null) {
    if (!userId) {
        return []
    }

    try {
        const redis = await getRedisClient()
        const chats = await redis.zrange(getUserChatKey(userId), 0, -1, {
            rev: true
        })

        if (chats.length === 0) {
            return []
        }

        const results = await Promise.all(
            chats.map(async chatKey => {
                const chat = await redis.hgetall(chatKey)
                return chat
            })
        )

        return results
            .filter((result): result is Record<string, any> => {
                if (result === null || Object.keys(result).length === 0) {
                    return false
                }
                return true
            })
            .map(chat => {
                const plainChat = { ...chat }
                if (typeof plainChat.messages === 'string') {
                    try {
                        plainChat.messages = JSON.parse(plainChat.messages)
                    } catch (error) {
                        plainChat.messages = []
                    }
                }
                if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
                    plainChat.createdAt = new Date(plainChat.createdAt)
                }
                return plainChat as Chat
            })
    } catch (error) {
        return []
    }
}

export async function getChat(id: string, userId: string = 'anonymous') {
    const redis = await getRedisClient()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat) {
        return null
    }

    // Parse the messages if they're stored as a string
    if (typeof chat.messages === 'string') {
        try {
            chat.messages = JSON.parse(chat.messages)
        } catch (error) {
            chat.messages = []
        }
    }

    // Ensure messages is always an array
    if (!Array.isArray(chat.messages)) {
        chat.messages = []
    }

    return chat
}

export async function clearChats(
    userId: string = 'anonymous',
    shouldRedirect: boolean = false
): Promise<{ error?: string; success?: boolean }> {
    const redis = await getRedisClient()
    const userChatKey = getUserChatKey(userId)
    const chats = await redis.zrange(userChatKey, 0, -1)

    if (!chats.length) {
        return { error: 'No chats to clear' }
    }

    const pipeline = redis.pipeline()

    for (const chat of chats) {
        pipeline.del(chat)
        pipeline.zrem(userChatKey, chat)
    }

    await pipeline.exec()
    revalidatePath('/dashboard/chat/')

    // Only redirect if explicitly requested
    if (shouldRedirect) {
        redirect('/dashboard/chat/')
    }

    return { success: true }
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
    try {
        const redis = await getRedisClient()
        const pipeline = redis.pipeline()

        const chatToSave = {
            ...chat,
            messages: JSON.stringify(chat.messages)
        }

        pipeline.hmset(`chat:${chat.id}`, chatToSave)
        pipeline.zadd(getUserChatKey(userId), Date.now(), `chat:${chat.id}`)

        const results = await pipeline.exec()

        return results
    } catch (error) {
        throw error
    }
}

export async function getSharedChat(id: string) {
    const redis = await getRedisClient()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat || !chat.sharePath) {
        return null
    }

    return chat
}

export async function shareChat(id: string, userId: string = 'anonymous') {
    const redis = await getRedisClient()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat || chat.userId !== userId) {
        return null
    }

    const payload = {
        ...chat,
        sharePath: `/share/${id}`
    }

    await redis.hmset(`chat:${id}`, payload)

    return payload
}

export async function deleteChat(
    chatId: string,
    userId: string = 'anonymous'
): Promise<{ error?: string; success?: boolean }> {
    try {
        const redis = await getRedisClient()
        const userChatKey = getUserChatKey(userId)
        const chatKey = `chat:${chatId}`

        // Check if the chat exists and belongs to the user
        const chat = await redis.hgetall<Chat>(chatKey)
        if (!chat || chat.userId !== userId) {
            return { error: 'Chat not found or access denied' }
        }

        const pipeline = redis.pipeline()

        // Delete the chat and remove from the user's chat list
        pipeline.del(chatKey)
        pipeline.zrem(userChatKey, chatKey)

        await pipeline.exec()
        revalidatePath('/dashboard/chat/')

        return { success: true }
    } catch (error) {
        console.error('Error deleting chat:', error)
        return { error: 'Failed to delete chat' }
    }
}
