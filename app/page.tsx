"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  // state message et input
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // state loading et erreur
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input) return;

    setError(null);
    setLoading(true);

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur API");
      }

      const botMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInput("");
    }
  };
  return (
    <main className="max-w-xl mx-auto p-4 bg-secondary-foreground min-h-screen text-white justify-center flex flex-col w-screen">
      <h1 className="text-2xl font-bold mb-4">Chatbot</h1>

      <div className="border p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.role === "user" ? "Toi" : "Bot"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>
      {loading && <p className="text-sm text-gray-500">Le bot réfléchit...</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question..."
        />

        <Button
          onClick={sendMessage}
          disabled={loading}
          className="bg-accent text-black"
        >
          {loading ? "..." : "Envoyer"}
        </Button>
      </div>
    </main>
  );
}
