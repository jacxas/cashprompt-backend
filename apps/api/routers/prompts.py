from uuid import uuid4
from fastapi import APIRouter, HTTPException, Query
from apps.api.schemas.prompt import PromptCreateRequest, PromptUpdateRequest

router = APIRouter(prefix='/api/v1/prompts', tags=['prompts'])

_PROMPTS: dict[str, dict] = {}

@router.get('')
def list_prompts(category: str | None = Query(default=None), q: str | None = Query(default=None)):
    values = list(_PROMPTS.values())
    if category:
        values = [p for p in values if p.get('category') == category]
    if q:
        values = [p for p in values if q.lower() in p.get('title', '').lower()]
    return values

@router.post('')
def create_prompt(payload: PromptCreateRequest):
    pid = str(uuid4())
    item = {**payload.model_dump(), 'id': pid, 'use_count': 0}
    _PROMPTS[pid] = item
    return item

@router.put('/{prompt_id}')
def update_prompt(prompt_id: str, payload: PromptUpdateRequest):
    if prompt_id not in _PROMPTS:
        raise HTTPException(status_code=404, detail='Prompt not found')
    for k, v in payload.model_dump().items():
        if v is not None:
            _PROMPTS[prompt_id][k] = v
    return _PROMPTS[prompt_id]

@router.delete('/{prompt_id}')
def delete_prompt(prompt_id: str):
    if prompt_id not in _PROMPTS:
        raise HTTPException(status_code=404, detail='Prompt not found')
    _PROMPTS.pop(prompt_id)
    return {'deleted': True}

@router.post('/{prompt_id}/use')
def use_prompt(prompt_id: str):
    if prompt_id not in _PROMPTS:
        raise HTTPException(status_code=404, detail='Prompt not found')
    _PROMPTS[prompt_id]['use_count'] += 1
    return {'id': prompt_id, 'use_count': _PROMPTS[prompt_id]['use_count']}

@router.get('/public')
def public_prompts():
    return [p for p in _PROMPTS.values() if p.get('is_public')]
