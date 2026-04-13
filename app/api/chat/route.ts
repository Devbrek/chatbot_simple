import { NextResponse } from "next/server";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY!,
  model: "mistral-large-latest",
});

const memory: { role: string; content: string }[] = [];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Tu es un assistant utile et clair."],
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
