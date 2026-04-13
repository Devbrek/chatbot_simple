import dotenv from "dotenv";
dotenv.config();
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY!,
  model: "mistral-large-latest",
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Tu es un assistant pédagogique très simple."],
  ["user", "{question}"],
]);

async function run() {
  const formattedPrompt = await prompt.formatMessages({
    question: "Explique React simplement",
  });

  const response = await model.invoke(formattedPrompt);

  console.log(response.content);
}

run();
