import { NextRequest, NextResponse } from "next/server";

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
- Material personalizado según objetivos del alumno
- Horarios flexibles de lunes a sábado
- Clases cancelables hasta 24 horas antes

Responde de forma amable, breve (máximo 2-3 oraciones) y en español. Si te preguntan algo que no sabes, sugiere contactar directamente por WhatsApp o registrarse para la clase gratuita.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { message: "Para más información, te invito a registrarte para tu clase gratuita o contactarnos por WhatsApp." },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10) // Solo últimos 10 mensajes para contexto
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Error calling Groq API");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content ||
      "Lo siento, no pude procesar tu pregunta. ¿Puedes reformularla?";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { message: "Lo siento, hubo un problema. Por favor contáctanos por WhatsApp para ayudarte mejor." },
      { status: 200 }
    );
  }
}
