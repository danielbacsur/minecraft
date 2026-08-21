import {
  ApiError,
  BadRequest,
  Unauthenticated,
  QuotaExhausted,
  SubscriptionRequired,
  NotFound,
  NoMatch,
  RateLimited,
  TextureMissing,
  RenderFailed,
  Internal,
  TranslationFailed,
  SearchFailed,
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
  | { code: "NETWORK_FAILED"; message: string };

export function failure(error: ApiError<object>): Failure {
  return {
    code: error.code,
    message: error.message,
    ...error.details,
  } as Failure;
}
