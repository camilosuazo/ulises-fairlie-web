"use client";

import { WhatsAppButton } from "./WhatsAppButton";
import { ChatBot } from "./ChatBot";

export function FloatingButtons() {
  // Número de WhatsApp del profesor (cambiar por el real)
  const whatsappNumber = "56912345678"; // Formato: código país + número sin espacios

  return (
    <>
      <ChatBot />
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </>
  );
}
