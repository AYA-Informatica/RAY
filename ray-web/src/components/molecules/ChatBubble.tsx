import { clsx } from 'clsx'
import type { Message } from '@/types'

export interface ChatBubbleProps {
  message: Message
  isMine: boolean
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * ChatBubble molecule — message bubble for chat detail screen.
 * Mine: right-aligned primary color. Theirs: left-aligned dark surface.
 */
export const ChatBubble = ({ message, isMine }: ChatBubbleProps) => {
  return (
    <div
      className={clsx(
        'flex flex-col max-w-[75%] gap-0.5',
        isMine ? 'self-end items-end' : 'self-start items-start'
      )}
    >
      {message.type === 'image' && message.imageUrl ? (
        <div
          className={clsx(
            'rounded-2xl overflow-hidden',
            isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'
          )}
        >
          <img
            src={message.imageUrl}
            alt="Shared image"
            className="max-w-[240px] max-h-[240px] object-cover"
          />
        </div>
      ) : message.type === 'system' ? (
        <p className="text-xs text-text-muted font-sans text-center px-3 py-1 bg-surface-modal rounded-full">
          {message.content}
        </p>
      ) : message.type === 'phone_shared' ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-success/20 border border-success/30">
          <span className="text-success text-sm font-semibold font-sans">{message.content}</span>
        </div>
      ) : (
        <div
          className={clsx(
            'px-4 py-2.5 rounded-2xl font-sans text-sm leading-relaxed',
            isMine
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-surface-modal text-text-primary rounded-tl-sm'
          )}
        >
          {message.content}
        </div>
      )}
      <span className="text-[10px] text-text-muted font-sans px-1">
        {formatTime(message.timestamp)}
        {isMine && (
          <span className={clsx('ml-1', message.read ? 'text-primary' : 'text-text-muted')}>
            {message.read ? '✓✓' : '✓'}
          </span>
        )}
      </span>
    </div>
  )
}
