from uuid import uuid4
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix='/api/v1/files', tags=['files'])

_FILES: dict[str, dict] = {}

@router.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid4())
    content = await file.read()
    _FILES[file_id] = {
        'id': file_id,
        'name': file.filename,
        'type': file.content_type,
        'size': len(content),
        'storage_path': f'in-memory://{file_id}/{file.filename}',
        'embedded': False,
    }
    return _FILES[file_id]

@router.get('')
def list_files():
    return list(_FILES.values())

@router.delete('/{file_id}')
def delete_file(file_id: str):
    if file_id not in _FILES:
        raise HTTPException(status_code=404, detail='File not found')
    _FILES.pop(file_id)
    return {'deleted': True}

@router.post('/{file_id}/embed')
def embed_file(file_id: str):
    if file_id not in _FILES:
        raise HTTPException(status_code=404, detail='File not found')
    _FILES[file_id]['embedded'] = True
    _FILES[file_id]['embedding_id'] = f'emb-{file_id}'
    return {'id': file_id, 'embedding_id': _FILES[file_id]['embedding_id']}

@router.get('/{file_id}/download')
def download_file(file_id: str):
    if file_id not in _FILES:
        raise HTTPException(status_code=404, detail='File not found')
    metadata = _FILES[file_id]
    return {'download_url': metadata['storage_path'], 'name': metadata['name']}
