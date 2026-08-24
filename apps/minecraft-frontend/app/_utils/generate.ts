import type { Failure } from "@/errors";
import type { Line } from "@/app/api/generate/_utils/stream";

const OFFLINE: Failure = {
  code: "NETWORK_FAILED",
  message: "The generation request did not complete.",
};

export type Result =
  | { ok: true; id: string }
  | { ok: false; failure: Failure }
  | { aborted: true };

let inflight: AbortController | null = null;

export async function generate(
  query: string,
  paint: (source: CanvasImageSource) => void,
): Promise<Result> {
  inflight?.abort();

  const { signal } = (inflight = new AbortController());

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal,
    });

    if (!response.ok || !response.body) {
      const failure = (await response.json().catch(() => null)) as Failure;

      return { ok: false, failure: failure ?? OFFLINE };
    }

    const id = response.headers.get("x-generation-id");

    if (!id) return { ok: false, failure: OFFLINE };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    reading: while (true) {
      const chunk = await reader.read();

      if (chunk.done) return { ok: false, failure: OFFLINE };

      buffer += decoder.decode(chunk.value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const text of lines) {
        if (!text) continue;

        const line = JSON.parse(text) as Line;

        if ("code" in line) return { ok: false, failure: line };
        if ("done" in line) break reading;

        const image = new Image();
        image.src = line.image;
        await image.decode();

        if (signal.aborted) return { aborted: true };

        paint(image);
      }
    }

    return { ok: true, id };
  } catch {
    if (signal.aborted) return { aborted: true };

    return { ok: false, failure: OFFLINE };
  }
}
