"use client";

import { WhatsAppButton } from "./WhatsAppButton";
import { ChatBot } from "./ChatBot";

export function FloatingButtons() {
  const whatsappNumber = "56977520630";

  return (
    <>
      <ChatBot />
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </>
  );
}
