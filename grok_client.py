import os
from typing import Any, Iterable

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    def load_dotenv() -> None:
        return None

load_dotenv()


def _get_api_key() -> str:
    api_key = os.getenv("GROK_API_KEY", "").strip()
    if not api_key:
        raise ValueError("Missing GROK_API_KEY. Define it in environment variables or .env.")
    return api_key


def _compose_user_prompt(prompt: str, media_urls: list[str] | None = None) -> str:
    clean_prompt = prompt.strip()
    urls = [url.strip() for url in (media_urls or []) if url and url.strip()]
    if not urls:
        return clean_prompt

    lines = "\n".join(f"- {url}" for url in urls)
    return (
        f"{clean_prompt}\n\n"
        "Media URLs (analyze these resources if the selected model supports it):\n"
        f"{lines}"
    )


def build_messages(prompt: str, media_urls: list[str] | None = None) -> list[dict[str, str]]:
    return [{"role": "user", "content": _compose_user_prompt(prompt, media_urls)}]


def _extract_content(response: Any) -> str:
    choices = getattr(response, "choices", None)
    if not choices:
        raise ValueError("Grok response did not include choices.")

    message = getattr(choices[0], "message", None)
    content = getattr(message, "content", None)
    if content is None or content == "":
        raise ValueError("Grok response content was empty.")

    return content


def call_grok(
    prompt: str,
    model: str = "grok-2-latest",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    media_urls: list[str] | None = None,
) -> str:
    from xai_sdk import Grok

    client = Grok(api_key=_get_api_key())
    response = client.chat.completions.create(
        model=model,
        messages=build_messages(prompt, media_urls),
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return _extract_content(response)


def call_grok_streaming(
    prompt: str,
    model: str = "grok-2-latest",
    media_urls: list[str] | None = None,
) -> Iterable[str]:
    from xai_sdk import Grok

    client = Grok(api_key=_get_api_key())
    stream = client.chat.completions.create(
        model=model,
        messages=build_messages(prompt, media_urls),
        stream=True,
    )

    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
