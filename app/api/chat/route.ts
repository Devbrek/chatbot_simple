import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // evite undefined
    const content = response.choices?.[0]?.message?.content;
    
    // temporaire debug
    console.log(JSON.stringify(response, null, 2));

    // evite undefined
    if (!content) {
      return NextResponse.json(
        { error: "Pas de réponse du modèle" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      reply: content,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
