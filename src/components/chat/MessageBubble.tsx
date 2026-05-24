import Image from "next/image";
import { Check, CheckCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { timeAgo } from "@/lib/utils/format";

export interface ChatMessage {
  id: string;
  content: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isRead: boolean;
  senderId: string;
  createdAt: string | Date;
}

/** A single chat message. Delivery/read ticks per the spec. */
export function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-3 py-2",
          mine ? "rounded-br-sm bg-primary text-text-primary" : "rounded-bl-sm bg-surface-card text-text-primary",
        )}
      >
        {message.imageUrl && (
          <div className="relative mb-1 h-40 w-48 overflow-hidden rounded-md bg-surface-modal">
            <Image src={message.imageUrl} alt="Shared photo" fill className="object-cover" />
          </div>
        )}
        {message.latitude != null && message.longitude != null && (
          <a
            href={`https://maps.google.com/?q=${message.latitude},${message.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1 flex items-center gap-1 text-sm underline"
          >
            <MapPin size={14} /> Shared location
          </a>
        )}
        {message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}
        <div className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10px]", mine ? "text-text-primary/70" : "text-text-muted")}>
          {timeAgo(message.createdAt)}
          {mine && (message.isRead ? <CheckCheck size={13} /> : <Check size={13} />)}
        </div>
      </div>
    </div>
  );
}
