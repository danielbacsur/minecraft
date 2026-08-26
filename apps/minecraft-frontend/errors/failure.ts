import type {
  ApiError,
  BadRequest,
  Capacity,
  Internal,
  NoMatch,
  NotFound,
  QuotaExhausted,
  RateLimited,
  RenderFailed,
  SearchFailed,
  SubscriptionRequired,
  TextureMissing,
  TranslationFailed,
  Unauthenticated,
} from "./errors";

type Wire<E extends ApiError<object>> = {
  code: E["code"];
  message: string;
} & E["details"];

export type Failure =
  | Wire<BadRequest>
  | Wire<Unauthenticated>
  | Wire<QuotaExhausted>
  | Wire<SubscriptionRequired>
  | Wire<NotFound>
  | Wire<NoMatch>
  | Wire<RateLimited>
  | Wire<TextureMissing>
  | Wire<RenderFailed>
  | Wire<Internal>
  | Wire<TranslationFailed>
  | Wire<SearchFailed>
  | Wire<Capacity>
  | { code: "NETWORK_FAILED"; message: string };

export function failure(error: ApiError<object>): Failure {
  return {
    code: error.code,
    message: error.message,
    ...error.details,
  } as Failure;
}
