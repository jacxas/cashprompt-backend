from uuid import uuid4
from fastapi import APIRouter, HTTPException
from apps.api.schemas.agent import AgentCreateRequest, AgentRunRequest, AgentUpdateRequest

router = APIRouter(prefix='/api/v1/agents', tags=['agents'])

_AGENTS: dict[str, dict] = {}
_RUNS: dict[str, list[dict]] = {}

@router.get('')
def list_agents():
    return list(_AGENTS.values())

@router.post('')
def create_agent(payload: AgentCreateRequest):
    agent_id = str(uuid4())
    agent = {'id': agent_id, **payload.model_dump()}
    _AGENTS[agent_id] = agent
    _RUNS[agent_id] = []
    return agent

@router.get('/{agent_id}')
def get_agent(agent_id: str):
    agent = _AGENTS.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail='Agent not found')
    return agent

@router.put('/{agent_id}')
def update_agent(agent_id: str, payload: AgentUpdateRequest):
    agent = _AGENTS.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail='Agent not found')
    agent.update({k: v for k, v in payload.model_dump().items() if v is not None})
    _AGENTS[agent_id] = agent
    return agent

@router.delete('/{agent_id}')
def delete_agent(agent_id: str):
    if agent_id not in _AGENTS:
        raise HTTPException(status_code=404, detail='Agent not found')
    _AGENTS.pop(agent_id)
    _RUNS.pop(agent_id, None)
    return {'deleted': True}

@router.post('/{agent_id}/run')
def run_agent(agent_id: str, payload: AgentRunRequest):
    if agent_id not in _AGENTS:
        raise HTTPException(status_code=404, detail='Agent not found')
    run_id = str(uuid4())
    run = {
        'id': run_id,
        'agent_id': agent_id,
        'status': 'success',
        'input': payload.input,
        'output': {'message': 'Agent executed successfully'}
    }
    _RUNS[agent_id].append(run)
    return run

@router.get('/{agent_id}/runs')
def list_agent_runs(agent_id: str):
    if agent_id not in _AGENTS:
        raise HTTPException(status_code=404, detail='Agent not found')
    return _RUNS.get(agent_id, [])

@router.get('/{agent_id}/runs/{run_id}')
def get_agent_run(agent_id: str, run_id: str):
    if agent_id not in _AGENTS:
        raise HTTPException(status_code=404, detail='Agent not found')
    for run in _RUNS.get(agent_id, []):
        if run['id'] == run_id:
            return run
    raise HTTPException(status_code=404, detail='Run not found')
