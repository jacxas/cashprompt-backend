from fastapi import FastAPI
from apps.api.routers import agents, automations, chat, files, models, projects, prompts

app = FastAPI(title='AI OS API', version='1.0.0')

@app.get('/health')
def health():
    return {'status': 'ok'}

app.include_router(chat.router)
app.include_router(agents.router)
app.include_router(prompts.router)
app.include_router(files.router)
app.include_router(models.router)
app.include_router(projects.router)
app.include_router(automations.router)
