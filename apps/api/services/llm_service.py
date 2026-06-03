from typing import AsyncGenerator
import litellm

MODELS_CONFIG = {
    'gpt-4o': {'provider': 'openai', 'context': 128000},
    'gpt-4o-mini': {'provider': 'openai', 'context': 128000},
    'claude-3-5-sonnet': {'provider': 'anthropic', 'context': 200000},
    'claude-3-haiku': {'provider': 'anthropic', 'context': 200000},
    'gemini-1.5-pro': {'provider': 'google', 'context': 1000000},
    'llama-3.3-70b': {'provider': 'groq', 'context': 32768},
    'mistral-large': {'provider': 'mistral', 'context': 128000},
}


async def stream_completion(
    model: str,
    messages: list[dict],
    system_prompt: str | None = None,
) -> AsyncGenerator[str, None]:
    payload = list(messages)
    if system_prompt:
        payload.insert(0, {'role': 'system', 'content': system_prompt})

    response = await litellm.acompletion(model=model, messages=payload, stream=True)
    async for chunk in response:
        delta = chunk.choices[0].delta
        if getattr(delta, 'content', None):
            yield delta.content
