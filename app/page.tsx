"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    stop,
    rerunWithEdit,
    loading,
    error,
  } = useChat();

  return (
    <main className="max-w-xl mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Chatbot</h1>

      <div className="border p-4 h-96 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong> {msg.content}
            {msg.role === "user" && (
              <button
                className="text-xs underline ml-2"
                onClick={() => {
                  const newText = prompt("Modifier :", msg.content);
                  if (!newText) return;

                  rerunWithEdit(msg.id, newText);
                }}
              >
                edit
              </button>
            )}
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} />

        <Button onClick={sendMessage}>Send</Button>

        <Button variant="destructive" onClick={stop}>
          Stop
        </Button>
      </div>
    </main>
  );
}
