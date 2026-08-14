from json import dumps
from typing import Any


def _join(*groups: Any) -> str:
    seen: dict[str, None] = {}

    for group in groups:
        if not group:
            continue

        for item in group if isinstance(group, list) else [group]:
            if isinstance(item, str) and item.strip():
                seen.setdefault(" ".join(item.split()), None)

    return ", ".join(seen)


def _identity(skin: dict[str, Any]) -> str:
    return dumps(skin["identity"], ensure_ascii=False, sort_keys=True)


def _identity_text(skin: dict[str, Any]) -> str:
    return skin["identity_text"]


def _identity_names(skin: dict[str, Any]) -> str:
    return _join(
        skin["identity"]["name"],
        skin["identity"]["aliases"],
    )


def _identity_keywords(skin: dict[str, Any]) -> str:
    return _join(
        skin["identity"]["franchise"],
        skin["identity"]["keywords"],
    )


def _appearance(skin: dict[str, Any]) -> str:
    return dumps(skin["appearance"], ensure_ascii=False, sort_keys=True)


def _appearance_text(skin: dict[str, Any]) -> str:
    return skin["appearance_text"]


def _appearance_keywords(skin: dict[str, Any]) -> str:
    return _join(
        skin["appearance"]["keywords"],
        skin["appearance"]["subjects"],
        skin["appearance"]["themes"],
        skin["appearance"]["archetypes"],
        skin["appearance"]["vibes"],
    )


def _appearance_attributes(skin: dict[str, Any]) -> str:
    return _join(
        [
            f"{color['name']} {color['item']}".strip()
            for color in skin["appearance"]["colors"]
        ],
        skin["appearance"]["hair"],
        skin["appearance"]["head"],
        skin["appearance"]["face"],
        skin["appearance"]["top"],
        skin["appearance"]["bottom"],
        skin["appearance"]["footwear"],
        skin["appearance"]["accessories"],
        skin["appearance"]["motifs"],
    )


def columns(skin: dict[str, Any]) -> dict[str, str]:
    return {
        "identity": _identity(skin),
        "identity_text": _identity_text(skin),
        "identity_names": _identity_names(skin),
        "identity_keywords": _identity_keywords(skin),
        "appearance": _appearance(skin),
        "appearance_text": _appearance_text(skin),
        "appearance_keywords": _appearance_keywords(skin),
        "appearance_attributes": _appearance_attributes(skin),
    }
