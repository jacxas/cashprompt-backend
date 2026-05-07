from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix='/api/v1/models', tags=['models'])

MODELS = [
    {'id': 'gpt-4o', 'provider': 'openai'},
    {'id': 'claude-3-5-sonnet', 'provider': 'anthropic'},
    {'id': 'gemini-1.5-pro', 'provider': 'google'},
]

class ModelTestRequest(BaseModel):
    model: str
    api_key: str | None = None

@router.get('')
def list_models():
    return MODELS

@router.get('/providers')
def list_providers():
    providers = sorted(set(m['provider'] for m in MODELS))
    return [{'id': p} for p in providers]

@router.post('/test')
def test_model_connection(payload: ModelTestRequest):
    exists = any(m['id'] == payload.model for m in MODELS)
    return {'model': payload.model, 'ok': exists, 'message': 'Connection simulated'}
