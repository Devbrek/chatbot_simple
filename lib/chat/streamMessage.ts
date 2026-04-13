export async function streamMessage({
  message,
  signal,
  onChunk,
}: {
  message: string;
  signal: AbortSignal;
  onChunk: (chunk: string) => void;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!res.body) throw new Error("No stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const { value, done: d } = await reader.read();
    done = d;

    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}
