"use client";

import { Camera, MapPin } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  type: "camera" | "location";
  onAllow: () => void;
  onDismiss: () => void;
}

const COPY = {
  camera: {
    icon: Camera,
    title: "Access your camera",
    body: "We need camera access so you can snap photos of your item. Your photos will be visible on your public ad — nothing else is captured.",
    allow: "Allow camera",
  },
  location: {
    icon: MapPin,
    title: "Use your location",
    body: "We'll use your location to show your listing to nearby buyers. Only your city and district will appear publicly — your exact position is never stored or shared.",
    allow: "Allow location",
  },
};

/**
 * RAY-branded overlay that explains a permission request before the OS dialog
 * fires. Increases permission grant rate by removing the cold system prompt.
 */
export function PermissionPrompt({ type, onAllow, onDismiss }: Props) {
  const { icon: Icon, title, body, allow } = COPY[type];

  return (
    <Modal open onClose={onDismiss} title="">
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15">
          <Icon size={32} className="text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="text-sm text-text-secondary">{body}</p>
        <Button fullWidth onClick={onAllow}>
          {allow}
        </Button>
        <button
          onClick={onDismiss}
          className="text-sm text-text-muted hover:text-text-secondary"
        >
          Not now
        </button>
      </div>
    </Modal>
  );
}
