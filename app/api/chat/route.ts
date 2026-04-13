import { NextResponse } from "next/server";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY!,
  model: "mistral-large-latest",

  temperature: 0.7,
  maxTokens: 300,
});

const memory: { role: string; content: string }[] = [];

export const bannedWords = [
  // violence
  "tuer", "meurtre", "assassiner", "bombe", "arme", "guerre",

  // drogues
  "drogue", "cocaïne", "héroïne", "cannabis", "overdose",

  // hacking
  "hack", "piratage", "virus", "malware", "phishing",

  // nsfw
  "sexe", "porno", "nudité", "masturbation", "bdsm",

  // self-harm
  "suicide", "automutilation", "me pendre",

  // haine
  "racisme", "nazi", "hitler", "génocide"
];



const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
Tu es un assistant IA.

Règles:
- Réponds de façon claire et concise
- Maximum 5 phrases
- Si tu ne sais pas, dis-le
- Ne donne pas de réponses inutiles
- Style: simple et pédagogique
- N'agrémente pas tes réponses de # ou de chiffres
- Si tu ne sais pas, poses des questions pour t'aider
- La discussion doit restée concentrée sur le sujet suivant : la photographie, si l'utilisateur s'éloigne, tu lui expliques que tu ne réponds pas à ce genre de question que ce n'est pas ta fonction
`,
  ],
  ["user", "{question}"],
]);

function extractText(content: any): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content.map((c) => ("text" in c ? c.text : "")).join("");
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message manquant" }, { status: 400 });
    }

    if (bannedWords.some(w => message.includes(w))) {
  return NextResponse.json({
    reply: "Je ne peux pas répondre à cette demande."
  });
}

    // 1. Ajouter message user à la mémoire
    memory.push({ role: "user", content: message });

    const formattedPrompt = await prompt.formatMessages({
      question: memory.map((m) => `${m.role}: ${m.content}`).join("\n"),
    });

    const response = await model.invoke(formattedPrompt);

    const content = extractText(response?.content);

    if (!content) {
      return NextResponse.json(
        { error: "Réponse vide du modèle" },
        { status: 500 },
      );
    }

    // 2. Ajouter réponse bot à la mémoire
    memory.push({ role: "assistant", content });

    return NextResponse.json({
      reply: content,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
