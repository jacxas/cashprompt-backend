from uuid import uuid4
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from apps.api.schemas.chat import ChatCompletionRequest, ConversationCreateRequest

router = APIRouter(prefix='/api/v1/chat', tags=['chat'])

_CONVERSATIONS: dict[str, dict] = {}
_MESSAGES: dict[str, list[dict]] = {}

@router.post('/completions')
async def chat_completions(payload: ChatCompletionRequest):
    text = f"[model={payload.model}] {payload.message}"
    if payload.stream:
        async def gen():
            for token in text.split(' '):
                yield token + ' '
        return StreamingResponse(gen(), media_type='text/plain')
    return {'output': text}

@router.post('/conversations')
def create_conversation(payload: ConversationCreateRequest):
    cid = str(uuid4())
    _CONVERSATIONS[cid] = {'id': cid, 'title': payload.title, 'model': payload.model}
    _MESSAGES[cid] = []
    return _CONVERSATIONS[cid]

@router.get('/conversations')
def list_conversations():
    return list(_CONVERSATIONS.values())

@router.get('/conversations/{conversation_id}')
def get_conversation(conversation_id: str):
    data = _CONVERSATIONS.get(conversation_id)
    if not data:
        raise HTTPException(status_code=404, detail='Conversation not found')
    return data

@router.delete('/conversations/{conversation_id}')
def delete_conversation(conversation_id: str):
    if conversation_id not in _CONVERSATIONS:
        raise HTTPException(status_code=404, detail='Conversation not found')
    _CONVERSATIONS.pop(conversation_id)
    _MESSAGES.pop(conversation_id, None)
    return {'deleted': True}

@router.get('/conversations/{conversation_id}/messages')
def get_conversation_messages(conversation_id: str):
    if conversation_id not in _CONVERSATIONS:
        raise HTTPException(status_code=404, detail='Conversation not found')
    return _MESSAGES.get(conversation_id, [])
