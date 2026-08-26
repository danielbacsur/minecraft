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
  | Wire<Capacity>
  | Wire<Internal>
  | Wire<NoMatch>
  | Wire<NotFound>
  | Wire<QuotaExhausted>
  | Wire<RateLimited>
  | Wire<RenderFailed>
  | Wire<SearchFailed>
  | Wire<SubscriptionRequired>
  | Wire<TextureMissing>
  | Wire<TranslationFailed>
  | Wire<Unauthenticated>
  | { code: "NETWORK_FAILED"; message: string };

export function failure(error: ApiError<object>): Failure {
  return {
    code: error.code,
    message: error.message,
    ...error.details,
  } as Failure;
}
