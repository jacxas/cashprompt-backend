from pydantic import BaseModel
from typing import Literal

class ChatCompletionRequest(BaseModel):
    model: str
    message: str
    stream: bool = True

class ConversationCreateRequest(BaseModel):
    title: str | None = None
    model: str

class MessageOut(BaseModel):
    id: str
    role: Literal['user', 'assistant', 'system']
    content: str

class ConversationOut(BaseModel):
    id: str
    title: str | None
    model: str
