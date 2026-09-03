import { deflateRawSync } from "node:zlib";

import { failure, RenderFailed, type Failure } from "@/errors";
import { DONE, ERROR, FRAME, KEY, key, seal, secret } from "@/utils/wire";

const encoder = new TextEncoder();

function packet(type: number, payload: Uint8Array) {
  const out = new Uint8Array(5 + payload.length);

  out[0] = type;
  new DataView(out.buffer).setUint32(1, payload.length);
  out.set(payload, 5);

  return out;
}

function fault(cause: unknown): Failure {
  console.error(cause);

  return failure(
    new RenderFailed("Skin rendering failed midway through the stream."),
  );
}

export function stream(frames: AsyncGenerator<Uint8Array>) {
  const raw = secret();
  const sealing = key(raw, "encrypt");

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(packet(KEY, raw));
    },

    async pull(controller) {
      try {
        const { value, done } = await frames.next();

        if (done) {
          controller.enqueue(packet(DONE, new Uint8Array()));
          controller.close();
          return;
        }

        const packed = new Uint8Array(deflateRawSync(value));

        controller.enqueue(packet(FRAME, await seal(await sealing, packed)));
      } catch (cause) {
        const payload = encoder.encode(JSON.stringify(fault(cause)));

        controller.enqueue(packet(ERROR, payload));
        controller.close();
      }
    },

    cancel() {
      frames.return(undefined);
    },
  });
}
