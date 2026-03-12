import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from grok_client import build_messages


def test_build_messages_without_media():
    messages = build_messages("Hola mundo")
    assert messages[0]["role"] == "user"
    assert messages[0]["content"][0]["text"] == "Hola mundo"


def test_build_messages_with_media():
    messages = build_messages("Analiza", ["https://example.com/demo.mp4"])
    assert len(messages[0]["content"]) == 2
    assert messages[0]["content"][1]["media_url"] == "https://example.com/demo.mp4"
