import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Search, ArrowLeft, Phone, Flag, Send, Image as ImageIcon,
  ShieldCheck, X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { Avatar } from '@/components/atoms/Avatar'
import { ChatBubble } from '@/components/molecules/ChatBubble'
import { Skeleton } from '@/components/atoms/Skeleton'
import { db } from '@/services/firebase'
import { chatApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { STRINGS } from '@/constants/strings'
import type { Conversation, Message } from '@/types'

// ─────────────────────────────────────────────
// Chat List Page
// ─────────────────────────────────────────────
export const ChatListPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) return
    console.log('[ChatList] 💬 Loading conversations for user', { userId: user.id })
    setIsLoading(true)

    // Real-time listener via Firestore
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation))
      console.log('[ChatList] ✅ Conversations loaded', { count: convos.length })
      setConversations(convos)
      setIsLoading(false)
    })

    return unsub
  }, [user])

  const filtered = conversations.filter((c) =>
    c.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.listingSnapshot.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    if (mins < 1440) return `${Math.floor(mins / 60)}h`
    return `${Math.floor(mins / 1440)}d`
  }

  return (
    <>
      <Helmet><title>Messages | RAY</title></Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto lg:max-w-none flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-0 bg-surface-card rounded-3xl border border-border overflow-hidden min-h-[600px]">

          {/* ── Conversation list panel ── */}
          <div className="flex flex-col border-r border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h1 className="font-display font-bold text-text-primary text-lg">
                {STRINGS.chat.title}
              </h1>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={STRINGS.chat.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 bg-surface-modal rounded-xl border border-border text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Conversation rows */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Skeleton className="w-12 h-12 flex-shrink-0" rounded="full" />
                    <div className="flex-1 flex flex-col gap-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
                  <span className="text-4xl">💬</span>
                  <p className="text-sm text-text-secondary font-sans text-center">
                    No conversations yet. Chat with a seller to get started.
                  </p>
                </div>
              ) : (
                filtered.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => navigate(`/chat/${convo.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-surface-modal transition-colors text-left"
                  >
                    <Avatar src={convo.otherUser.avatar} alt={convo.otherUser.displayName} size="md" online />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-text-primary font-sans truncate">
                          {convo.otherUser.displayName}
                        </span>
                        <span className="text-xs text-text-muted font-sans flex-shrink-0">
                          {timeAgo(convo.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary font-sans truncate mt-0.5">
                        {convo.lastMessage?.content ?? 'Start the conversation'}
                      </p>
                      <p className="text-[10px] text-text-muted font-sans truncate">
                        {convo.listingSnapshot.title} · {' '}
                        <span className="text-primary font-semibold">
                          Rwf {convo.listingSnapshot.price.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold font-sans">
                        {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Empty chat state (desktop) ── */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-4 text-center px-8">
            <span className="text-6xl">💬</span>
            <h2 className="font-display font-bold text-text-primary text-xl">
              Select a conversation
            </h2>
            <p className="text-sm text-text-secondary font-sans max-w-xs">
              Choose a conversation from the left to start chatting.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

// ─────────────────────────────────────────────
// Chat Detail Page
// ─────────────────────────────────────────────
export const ChatDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [safetyBannerDismissed, setSafetyBannerDismissed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    console.log('[ChatDetail] 💬 Loading conversation', { conversationId: id })

    chatApi.getConversation(id).then((c) => {
      console.log('[ChatDetail] ✅ Conversation loaded', {
        conversationId: id,
        otherUser: c.otherUser.displayName,
        listingTitle: c.listingSnapshot.title,
      })
      setConversation(c)
      setIsLoading(false)
      chatApi.markRead(id)
    })

    // Real-time messages
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', id),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message))
      console.log('[ChatDetail] 📨 Messages updated', { count: msgs.length })
      setMessages(msgs)
    })

    return unsub
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!messageText.trim() || !id) return
    console.log('[ChatDetail] 📤 Sending message', {
      conversationId: id,
      messageLength: messageText.trim().length,
    })
    setIsSending(true)
    try {
      await chatApi.sendMessage(id, messageText.trim())
      console.log('[ChatDetail] ✅ Message sent successfully')
      setMessageText('')
    } catch (err) {
      console.error('[ChatDetail] ❌ Failed to send message', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickReply = (text: string) => {
    setMessageText(text)
  }

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={clsx('h-10', i % 2 === 0 ? 'w-2/3 self-start' : 'w-1/2 self-end')} />
        ))}
      </main>
    )
  }

  return (
    <>
      <Helmet>
        <title>
          {conversation ? `${conversation.otherUser.displayName} | RAY` : 'Chat | RAY'}
        </title>
      </Helmet>

      <main className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-64px)]">

        {/* ── Chat header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-card flex-shrink-0">
          <button
            onClick={() => navigate('/chat')}
            className="p-1.5 rounded-xl hover:bg-surface-modal text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {conversation && (
            <>
              <Avatar src={conversation.otherUser.avatar} size="sm" online />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary font-sans truncate">
                  {conversation.otherUser.displayName}
                </p>
                <Link
                  to={`/listing/${conversation.listingId}`}
                  className="text-xs text-text-secondary font-sans truncate hover:text-primary transition-colors"
                >
                  {conversation.listingSnapshot.title} ·{' '}
                  <span className="text-primary font-semibold">
                    Rwf {conversation.listingSnapshot.price.toLocaleString()}
                  </span>
                </Link>
              </div>

              {/* Listing thumbnail */}
              <Link to={`/listing/${conversation.listingId}`} className="flex-shrink-0">
                <img
                  src={conversation.listingSnapshot.coverImage}
                  alt={conversation.listingSnapshot.title}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </Link>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <button className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-modal transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl text-text-secondary hover:text-danger hover:bg-surface-modal transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Safety banner ── */}
        {!safetyBannerDismissed && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-warning/10 border-b border-warning/20 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-xs font-sans text-text-secondary flex-1">
              {STRINGS.chat.safetyBanner}
            </p>
            <button
              onClick={() => setSafetyBannerDismissed(true)}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
              <span className="text-4xl">👋</span>
              <p className="text-sm text-text-secondary font-sans">
                Start the conversation. Ask about availability, price, or meeting point.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === user?.id}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick replies ── */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          {STRINGS.chat.quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-border bg-surface-modal text-xs font-sans text-text-secondary hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* ── Input bar ── */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-surface-card flex-shrink-0">
          <button className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-modal transition-colors flex-shrink-0">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={STRINGS.chat.inputPlaceholder}
            className="flex-1 h-10 px-4 bg-surface-modal border border-border rounded-2xl text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className={clsx(
              'p-2.5 rounded-2xl transition-all duration-150 flex-shrink-0',
              messageText.trim()
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-surface-modal text-text-muted cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </main>
    </>
  )
}
