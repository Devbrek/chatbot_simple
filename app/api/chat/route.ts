import { NextResponse } from "next/server";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY!,
  model: "mistral-large-latest",
  temperature: 0.7,
  maxTokens: 300,
  streaming: true,
});

type MemoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const memory: MemoryMessage[] = [];

const bannedWords = [
  "tuer",
  "meurtre",
  "assassiner",
  "bombe",
  "arme",
  "guerre",
  "drogue",
  "cocaïne",
  "héroïne",
  "cannabis",
  "overdose",
  "hack",
  "piratage",
  "virus",
  "malware",
  "phishing",
  "sexe",
  "porno",
  "nudité",
  "masturbation",
  "bdsm",
  "suicide",
  "automutilation",
  "me pendre",
  "racisme",
  "nazi",
  "hitler",
  "génocide",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function isBlocked(message: string) {
  const clean = normalize(message);
  return bannedWords.some((w) => clean.includes(normalize(w)));
}

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
Tu es un assistant IA spécialisé en photographie.

Règles:
- Réponses courtes (max 5 phrases)
- Style simple
- Si hors sujet photographie → refuse et recentre
    `,
  ],
  ["user", "{context}"],
]);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message manquant" }, { status: 400 });
    }

    if (isBlocked(message)) {
      return NextResponse.json({
        reply: "Je ne peux pas répondre à cette demande.",
      });
    }

    memory.push({ role: "user", content: message });

    const context = memory.map((m) => `${m.role}: ${m.content}`).join("\n");

    const formattedPrompt = await prompt.formatMessages({
      context,
    });

    const stream = await model.stream(formattedPrompt);

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        for await (const chunk of stream) {
          const token = typeof chunk.content === "string" ? chunk.content : "";

          if (!token) continue;

          fullResponse += token;

          controller.enqueue(encoder.encode(token));
        }

        memory.push({ role: "assistant", content: fullResponse });

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
