from hishel import BaseFilter, FilterPolicy, Response
from hishel.httpx import SyncCacheTransport
from httpx import Client, HTTPTransport


class SuccessfulResponsesOnly(BaseFilter[Response]):
    def apply(self, item: Response, body: bytes | None) -> bool:
        return 200 <= item.status_code < 300

    def needs_body(self) -> bool:
        return False


class SyncCacheClient(Client):
    def __init__(self, **kwargs) -> None:
        kwargs.setdefault("follow_redirects", True)
        kwargs.setdefault("timeout", 30)
        kwargs.setdefault(
            "transport",
            SyncCacheTransport(
                next_transport=HTTPTransport(retries=3),
                policy=FilterPolicy(response_filters=[SuccessfulResponsesOnly()]),
            ),
        )

        super().__init__(**kwargs)
