type Details<D> = {} extends D ? [details?: never] : [details: D];

export abstract class ApiError<D extends object = {}> extends Error {
  abstract readonly code: string;
  abstract readonly status: number;

  readonly details: D;

  constructor(message: string, ...[details]: Details<D>) {
    super(message);
    this.details = (details ?? {}) as D;
  }
}

export class BadRequest extends ApiError {
  readonly code = "BAD_REQUEST";
  readonly status = 400;
}

export class Unauthenticated extends ApiError {
  readonly code = "UNAUTHENTICATED";
  readonly status = 401;
}

export class QuotaExhausted extends ApiError<{ scope: "anonymous" | "free" }> {
  readonly code = "QUOTA_EXHAUSTED";
  readonly status = 402;
}

export class SubscriptionRequired extends ApiError {
  readonly code = "SUBSCRIPTION_REQUIRED";
  readonly status = 402;
}

export class NotFound extends ApiError {
  readonly code = "NOT_FOUND";
  readonly status = 404;
}

export class NoMatch extends ApiError {
  readonly code = "NO_MATCH";
  readonly status = 404;
}

export class RateLimited extends ApiError<{ retryAfter: number }> {
  readonly code = "RATE_LIMITED";
  readonly status = 429;
}

export class TextureMissing extends ApiError<{ textureId: string }> {
  readonly code = "TEXTURE_MISSING";
  readonly status = 500;
}

export class RenderFailed extends ApiError {
  readonly code = "RENDER_FAILED";
  readonly status = 500;
}

export class Internal extends ApiError {
  readonly code = "INTERNAL";
  readonly status = 500;
}

export class TranslationFailed extends ApiError {
  readonly code = "TRANSLATION_FAILED";
  readonly status = 502;
}

export class SearchFailed extends ApiError {
  readonly code = "SEARCH_FAILED";
  readonly status = 502;
}
