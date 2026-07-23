from hashlib import sha256
from uuid import NAMESPACE_OID, uuid5


def uuidv5(data: bytes) -> str:
    return str(uuid5(NAMESPACE_OID, sha256(data).hexdigest()))
