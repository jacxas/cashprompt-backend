import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from grok_client import _compose_user_prompt, build_messages


def test_build_messages_without_media():
    messages = build_messages("Hola mundo")
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "Hola mundo"


def test_build_messages_with_media():
    messages = build_messages("Analiza", ["https://example.com/demo.mp4"])
    assert "Media URLs" in messages[0]["content"]
    assert "https://example.com/demo.mp4" in messages[0]["content"]


def test_compose_prompt_filters_empty_urls():
    payload = _compose_user_prompt("Analiza", ["", "   ", "https://example.com/a.png"])
    assert "https://example.com/a.png" in payload
    assert "- " in payload
