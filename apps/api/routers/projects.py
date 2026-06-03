from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix='/api/v1/projects', tags=['projects'])

class ProjectCreateRequest(BaseModel):
    name: str
    description: str | None = None

class ProjectUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None

_PROJECTS: dict[str, dict] = {}

@router.get('')
def list_projects():
    return list(_PROJECTS.values())

@router.post('')
def create_project(payload: ProjectCreateRequest):
    pid = str(uuid4())
    project = {'id': pid, **payload.model_dump()}
    _PROJECTS[pid] = project
    return project

@router.put('/{project_id}')
def update_project(project_id: str, payload: ProjectUpdateRequest):
    project = _PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    for k, v in payload.model_dump().items():
        if v is not None:
            project[k] = v
    _PROJECTS[project_id] = project
    return project

@router.delete('/{project_id}')
def delete_project(project_id: str):
    if project_id not in _PROJECTS:
        raise HTTPException(status_code=404, detail='Project not found')
    _PROJECTS.pop(project_id)
    return {'deleted': True}
