type Frame = { step: number; image: string };

let inflight: AbortController | null = null;

export async function generate(
  query: string,
  callback: (source: CanvasImageSource) => void,
) {
  inflight?.abort();

  const { signal } = (inflight = new AbortController());

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok || !response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line) continue;
      const frame = JSON.parse(line) as Frame;

      const image = new Image();
      image.src = frame.image;
      await image.decode();

      if (signal.aborted) return;

      callback(image);
    }
  }
}
