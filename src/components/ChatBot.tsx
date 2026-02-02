"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Eres el asistente virtual de Ulises Fairlie, profesor de inglés. Tu trabajo es ayudar a los visitantes de la página web con sus dudas sobre las clases.

Información importante:
- Ulises ofrece clases de inglés personalizadas online via Google Meet
- Cada clase dura 60 minutos
- Al registrarse, los usuarios obtienen 1 clase gratuita sin compromiso

Planes disponibles:
1. Starter ($45.000 CLP/mes): 4 clases, conversación básica, vocabulario cotidiano
2. Progress ($80.000 CLP/mes): 8 clases, gramática + conversación, preparación entrevistas (más popular)
3. Intensive ($110.000 CLP/mes): 12 clases, inmersión total, Business English, certificaciones

Metodología:
- 80% práctica oral
- Material personalizado
- Horarios flexibles de lunes a sábado

Responde de forma amable, breve y en español. Si te preguntan algo que no sabes, sugiere contactar directamente por WhatsApp o registrarse para la clase gratuita.`;

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el asistente de Ulises Fairlie. ¿En qué puedo ayudarte con las clases de inglés?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }]
        })
      });

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Lo siento, hubo un error. Por favor intenta de nuevo o contáctanos por WhatsApp."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Abrir chat de ayuda"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">Asistente Virtual</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
