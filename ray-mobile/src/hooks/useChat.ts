import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from '@/store/authStore'
import type { Conversation } from '@/types'

export function useConversations() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [totalUnread, setTotalUnread]     = useState(0)

  useEffect(() => {
    if (!user) return
    
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    )
    
    return onSnapshot(q, (snap) => {
      const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation))
      setConversations(convos)
      setTotalUnread(convos.reduce((s, c) => s + (c.unreadCount ?? 0), 0))
    })
  }, [user])

  return { conversations, totalUnread }
}
