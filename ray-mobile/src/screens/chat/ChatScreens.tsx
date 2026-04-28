import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Image,
} from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, Send, Phone, Flag, Shield, X } from 'lucide-react-native'
import { db } from '@/services/firebase'
import { chatApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/theme/colors'
import { STRINGS } from '@/constants'
import type { Conversation, Message } from '@/types'

// ─────────────────────────────────────────────
// ChatListScreen
// ─────────────────────────────────────────────
export const ChatListScreen = () => {
  const navigation          = useNavigation<any>()
  const { user }            = useAuthStore()
  const [convos, setConvos] = useState<Conversation[]>([])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setConvos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)))
    })
    return unsub
  }, [user])

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m    = Math.floor(diff / 60000)
    if (m < 1)    return 'now'
    if (m < 60)   return `${m}m`
    if (m < 1440) return `${Math.floor(m / 60)}h`
    return `${Math.floor(m / 1440)}d`
  }

  return (
    <View style={listStyles.container}>
      <View style={listStyles.header}>
        <Text style={listStyles.title}>{STRINGS.chat.title}</Text>
      </View>

      <FlatList
        data={convos}
        keyExtractor={(c) => c.id}
        contentContainerStyle={convos.length === 0 && listStyles.emptyContainer}
        ListEmptyComponent={
          <View style={listStyles.emptyState}>
            <Text style={listStyles.emptyEmoji}>💬</Text>
            <Text style={listStyles.emptyText}>No conversations yet</Text>
            <Text style={listStyles.emptySubtext}>Chat with a seller to get started</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={listStyles.row}
            onPress={() => navigation.navigate('ChatDetail', { conversationId: item.id })}
          >
            {/* Avatar */}
            <View style={listStyles.avatar}>
              {item.otherUser?.avatar
                ? <Image source={{ uri: item.otherUser.avatar }} style={listStyles.avatarImg} />
                : <Text style={listStyles.avatarInitial}>
                    {item.otherUser?.displayName?.[0]?.toUpperCase() ?? '?'}
                  </Text>}
              <View style={listStyles.onlineDot} />
            </View>

            {/* Content */}
            <View style={listStyles.rowContent}>
              <View style={listStyles.rowTop}>
                <Text style={listStyles.senderName} numberOfLines={1}>
                  {item.otherUser?.displayName ?? 'User'}
                </Text>
                <Text style={listStyles.timestamp}>{timeAgo(item.updatedAt)}</Text>
              </View>
              <Text style={listStyles.lastMsg} numberOfLines={1}>
                {item.lastMessage?.content ?? 'Start the conversation'}
              </Text>
              <Text style={listStyles.listingRef} numberOfLines={1}>
                {item.listingSnapshot?.title}
                {item.listingSnapshot?.price
                  ? ` · Rwf ${item.listingSnapshot.price.toLocaleString()}`
                  : ''}
              </Text>
            </View>

            {/* Unread badge */}
            {item.unreadCount > 0 && (
              <View style={listStyles.badge}>
                <Text style={listStyles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

// ─────────────────────────────────────────────
// ChatDetailScreen
// ─────────────────────────────────────────────
type ChatDetailParams = { ChatDetail: { conversationId: string } }

export const ChatDetailScreen = () => {
  const route      = useRoute<RouteProp<ChatDetailParams, 'ChatDetail'>>()
  const navigation = useNavigation<any>()
  const { user }   = useAuthStore()

  const [convo, setConvo]     = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    const { conversationId } = route.params
    chatApi.getConversation(conversationId).then(setConvo)

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    })
    chatApi.markRead(conversationId).catch(() => {})
    return unsub
  }, [route.params])

  const sendMessage = useCallback(async () => {
    if (!text.trim() || !user || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: route.params.conversationId,
        senderId:       user.id,
        type:           'text',
        content,
        timestamp:      serverTimestamp(),
        read:           false,
      })
    } finally {
      setSending(false)
    }
  }, [text, user, sending, route.params])

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <KeyboardAvoidingView
      style={detailStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={detailStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={detailStyles.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        {convo && (
          <>
            <View style={detailStyles.headerInfo}>
              <Text style={detailStyles.headerName} numberOfLines={1}>
                {convo.otherUser?.displayName}
              </Text>
              <Text style={detailStyles.headerListing} numberOfLines={1}>
                {convo.listingSnapshot?.title}
              </Text>
            </View>
            {convo.listingSnapshot?.coverImage && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ListingDetail', { listingId: convo.listingId })}
              >
                <Image
                  source={{ uri: convo.listingSnapshot.coverImage }}
                  style={detailStyles.listingThumb}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={detailStyles.iconBtn}>
              <Phone size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={detailStyles.iconBtn}>
              <Flag size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Safety banner */}
      {!dismissed && (
        <View style={detailStyles.safetyBanner}>
          <Shield size={14} color={Colors.warning} />
          <Text style={detailStyles.safetyText} numberOfLines={2}>
            {STRINGS.chat.safetyBanner}
          </Text>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <X size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={detailStyles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id
          return (
            <View style={[detailStyles.bubbleWrap, isMine && detailStyles.bubbleWrapMine]}>
              <View style={[detailStyles.bubble, isMine ? detailStyles.bubbleMine : detailStyles.bubbleTheirs]}>
                <Text style={[detailStyles.bubbleText, isMine && { color: '#fff' }]}>
                  {item.content}
                </Text>
              </View>
              <Text style={detailStyles.bubbleTime}>{formatTime(item.timestamp)}</Text>
            </View>
          )
        }}
      />

      {/* Quick replies */}
      <FlatList
        horizontal
        data={STRINGS.chat.quickReplies}
        keyExtractor={(q) => q}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={detailStyles.quickReplies}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={detailStyles.quickChip}
            onPress={() => setText(item)}
          >
            <Text style={detailStyles.quickChipText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Input bar */}
      <View style={detailStyles.inputBar}>
        <TextInput
          style={detailStyles.input}
          placeholder={STRINGS.chat.inputPlaceholder}
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[detailStyles.sendBtn, !text.trim() && detailStyles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          <Send size={18} color={text.trim() ? '#fff' : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ─── List styles ─────────────────────────────
const listStyles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  header:         { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:          { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  emptyContainer: { flex: 1 },
  emptyState:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji:     { fontSize: 48 },
  emptyText:      { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtext:   { color: Colors.textSecondary, fontSize: 14 },
  row:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar:         { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceModal, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarImg:      { width: 48, height: 48, borderRadius: 24 },
  avatarInitial:  { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  onlineDot:      { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.background },
  rowContent:     { flex: 1, gap: 2 },
  rowTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  senderName:     { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', flex: 1 },
  timestamp:      { color: Colors.textMuted, fontSize: 11 },
  lastMsg:        { color: Colors.textSecondary, fontSize: 13 },
  listingRef:     { color: Colors.textMuted, fontSize: 11 },
  badge:          { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeText:      { color: '#fff', fontSize: 10, fontWeight: '800' },
})

// ─── Detail styles ────────────────────────────
const detailStyles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  header:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 54, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surfaceCard },
  backBtn:          { padding: 4 },
  headerInfo:       { flex: 1 },
  headerName:       { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  headerListing:    { color: Colors.textSecondary, fontSize: 11 },
  listingThumb:     { width: 40, height: 40, borderRadius: 10 },
  iconBtn:          { padding: 6 },
  safetyBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.warning + '15', borderBottomWidth: 1, borderBottomColor: Colors.warning + '25' },
  safetyText:       { flex: 1, color: Colors.textSecondary, fontSize: 11, lineHeight: 16 },
  messageList:      { padding: 16, gap: 12 },
  bubbleWrap:       { alignItems: 'flex-start', gap: 3 },
  bubbleWrapMine:   { alignItems: 'flex-end' },
  bubble:           { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine:       { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs:     { backgroundColor: Colors.surfaceModal, borderBottomLeftRadius: 4 },
  bubbleText:       { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
  bubbleTime:       { color: Colors.textMuted, fontSize: 10, paddingHorizontal: 4 },
  quickReplies:     { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  quickChip:        { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.surfaceModal, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  quickChipText:    { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  inputBar:         { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 28, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surfaceCard },
  input:            { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: Colors.surfaceModal, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: Colors.textPrimary, fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  sendBtn:          { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:  { backgroundColor: Colors.surfaceModal },
})
