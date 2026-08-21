import { ApiError, Internal } from "./errors";
import { failure } from "./failure";

export function withErrors<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      const thrown =
        error instanceof ApiError
          ? error
          : new Internal("Unhandled server error.");

      if (thrown !== error) console.error(error);

      return Response.json(failure(thrown), {
        status: thrown.status,
        headers: { "Cache-Control": "no-store" },
      });
    }
  };
}
