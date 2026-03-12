import os
from typing import Iterable

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


def build_messages(prompt: str, media_urls: list[str] | None = None) -> list[dict]:
    content: list[dict[str, str]] = [{"type": "text", "text": prompt.strip()}]
    for media_url in media_urls or []:
        if media_url:
            content.append({"type": "input_media", "media_url": media_url})

    return [{"role": "user", "content": content}]


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
    return response.choices[0].message.content


def call_grok_streaming(prompt: str, model: str = "grok-2-latest", media_urls: list[str] | None = None) -> Iterable[str]:
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
