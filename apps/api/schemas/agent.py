from pydantic import BaseModel

class AgentCreateRequest(BaseModel):
    name: str
    model: str
    system_prompt: str
    description: str | None = None

class AgentUpdateRequest(BaseModel):
    name: str | None = None
    model: str | None = None
    system_prompt: str | None = None
    description: str | None = None

class AgentRunRequest(BaseModel):
    input: dict = {}
