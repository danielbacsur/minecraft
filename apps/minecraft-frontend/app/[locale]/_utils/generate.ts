import type { Failure } from "@/errors";
import { DONE, ERROR, FRAME } from "@/utils/wire";

const OFFLINE: Failure = {
  code: "NETWORK_FAILED",
  message: "The generation request did not complete.",
};

export type Result =
  | { ok: true; id: string }
  | { ok: false; failure: Failure }
  | { aborted: true };

let inflight: AbortController | null = null;

async function inflate(packed: Uint8Array) {
  const stream = new Blob([packed as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function reader(body: ReadableStream<Uint8Array>) {
  const source = body.getReader();

  let buffer = new Uint8Array();

  return async function next() {
    while (true) {
      if (buffer.length >= 5) {
        const view = new DataView(
          buffer.buffer,
          buffer.byteOffset,
          buffer.byteLength,
        );

        const length = view.getUint32(1);

        if (buffer.length >= 5 + length) {
          const type = buffer[0];
          const payload = buffer.slice(5, 5 + length);

          buffer = buffer.slice(5 + length);

          return { type, payload };
        }
      }

      const chunk = await source.read();

      if (chunk.done) return null;

      const merged = new Uint8Array(buffer.length + chunk.value.length);

      merged.set(buffer);
      merged.set(chunk.value, buffer.length);

      buffer = merged;
    }
  };
}

export async function generate(
  query: string,
  paint: (pixels: Uint8ClampedArray<ArrayBuffer>) => void,
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

    const next = reader(response.body);

    while (true) {
      const packet = await next();

      if (!packet) return { ok: false, failure: OFFLINE };

      if (packet.type === ERROR) {
        return {
          ok: false,
          failure: JSON.parse(new TextDecoder().decode(packet.payload)),
        };
      }

      if (packet.type === DONE) return { ok: true, id };

      if (packet.type !== FRAME) return { ok: false, failure: OFFLINE };

      const pixels = await inflate(packet.payload);

      if (signal.aborted) return { aborted: true };

      paint(new Uint8ClampedArray(pixels));
    }
  } catch {
    if (signal.aborted) return { aborted: true };

    return { ok: false, failure: OFFLINE };
  }
}
