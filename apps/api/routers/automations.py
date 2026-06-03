from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix='/api/v1/automations', tags=['automations'])

class AutomationCreateRequest(BaseModel):
    name: str
    description: str | None = None
    trigger_type: str = 'manual'
    trigger_config: dict = {}
    steps: list[dict] = []

class AutomationUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    trigger_type: str | None = None
    trigger_config: dict | None = None
    steps: list[dict] | None = None

_AUTOMATIONS: dict[str, dict] = {}
_AUTOMATION_LOGS: dict[str, list[dict]] = {}

@router.get('')
def list_automations():
    return list(_AUTOMATIONS.values())

@router.post('')
def create_automation(payload: AutomationCreateRequest):
    aid = str(uuid4())
    data = {**payload.model_dump(), 'id': aid, 'run_count': 0}
    _AUTOMATIONS[aid] = data
    _AUTOMATION_LOGS[aid] = []
    return data

@router.put('/{automation_id}')
def update_automation(automation_id: str, payload: AutomationUpdateRequest):
    if automation_id not in _AUTOMATIONS:
        raise HTTPException(status_code=404, detail='Automation not found')
    for k, v in payload.model_dump().items():
        if v is not None:
            _AUTOMATIONS[automation_id][k] = v
    return _AUTOMATIONS[automation_id]

@router.post('/{automation_id}/run')
def run_automation(automation_id: str):
    if automation_id not in _AUTOMATIONS:
        raise HTTPException(status_code=404, detail='Automation not found')
    _AUTOMATIONS[automation_id]['run_count'] += 1
    run_id = str(uuid4())
    log = {'run_id': run_id, 'status': 'success', 'message': 'Automation executed'}
    _AUTOMATION_LOGS[automation_id].append(log)
    return log

@router.get('/{automation_id}/logs')
def get_automation_logs(automation_id: str):
    if automation_id not in _AUTOMATIONS:
        raise HTTPException(status_code=404, detail='Automation not found')
    return _AUTOMATION_LOGS.get(automation_id, [])
