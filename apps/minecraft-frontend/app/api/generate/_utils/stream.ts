import { failure, RenderFailed, type Failure } from "@/errors";

export type Line = { image: string } | { done: true } | Failure;

const encoder = new TextEncoder();

function line(value: Line) {
  return encoder.encode(JSON.stringify(value) + "\n");
}

export function stream(frames: AsyncGenerator<{ image: string }>) {
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await frames.next();

        controller.enqueue(line(done ? { done: true } : value));

        if (done) controller.close();
      } catch (cause) {
        console.error(cause);

        controller.enqueue(
          line(
            failure(
              new RenderFailed(
                "Skin rendering failed midway through the stream.",
              ),
            ),
          ),
        );

        controller.close();
      }
    },

    cancel() {
      frames.return(undefined);
    },
  });
}
