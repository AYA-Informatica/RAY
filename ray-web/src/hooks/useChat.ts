import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { chatApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Conversation, Message } from '@/types'

/**
 * useConversations — real-time conversation list for the current user.
 */
export function useConversations() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    console.log('[web.useChat] Setting up conversations listener', { userId: user.id })

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation))
      console.log('[web.useChat] Conversations updated', {
        count: convos.length,
        unread: convos.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0),
      })
      setConversations(convos)
      setTotalUnread(convos.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0))
      setIsLoading(false)
    })

    return unsub
  }, [user])

  return { conversations, isLoading, totalUnread }
}

/**
 * useChatMessages — real-time messages for a single conversation.
 */
export function useChatMessages(conversationId: string | undefined) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) return
    console.log('[web.useChat] Setting up messages listener', { conversationId })

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      console.log('[web.useChat] Messages updated', {
        conversationId,
        count: snap.docs.length,
      })
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
      setIsLoading(false)
    })

    // Mark as read
    chatApi.markRead(conversationId).catch(() => {})

    return unsub
  }, [conversationId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !user) return
      console.log('[web.useChat] Sending message', { conversationId, contentLength: content.length })
      // Optimistic: write directly to Firestore so the sender sees it instantly
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.id,
        type: 'text',
        content,
        timestamp: serverTimestamp(),
        read: false,
      })
      console.log('[web.useChat] Message sent')
    },
    [conversationId, user]
  )

  return { messages, isLoading, sendMessage }
}
