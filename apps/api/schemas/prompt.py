from pydantic import BaseModel

class PromptCreateRequest(BaseModel):
    title: str
    content: str
    category: str | None = None
    tags: list[str] = []
    is_public: bool = False

class PromptUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_public: bool | None = None
