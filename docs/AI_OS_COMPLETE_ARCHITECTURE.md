# AI OS — Arquitectura Completa

Documento actualizado para reflejar la estructura objetivo del monorepo **exactamente** como fue solicitada.

## Estructura objetivo

```txt
ai-os/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── chat/page.tsx
│   │   │   │   ├── chat/[id]/page.tsx
│   │   │   │   ├── agents/page.tsx
│   │   │   │   ├── agents/[id]/page.tsx
│   │   │   │   ├── prompts/page.tsx
│   │   │   │   ├── files/page.tsx
│   │   │   │   ├── content/page.tsx
│   │   │   │   ├── automations/page.tsx
│   │   │   │   ├── projects/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── api/[...path]/route.ts
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   └── AppShell.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── ModelSelector.tsx
│   │   │   ├── agents/
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   ├── AgentBuilder.tsx
│   │   │   │   └── AgentRunner.tsx
│   │   │   ├── prompts/
│   │   │   │   ├── PromptCard.tsx
│   │   │   │   └── PromptEditor.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── KpiCard.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── ModelUsageChart.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Skeleton.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useAgents.ts
│   │   │   ├── useModels.ts
│   │   │   └── useAuth.ts
│   │   ├── store/
│   │   │   ├── chatStore.ts
│   │   │   ├── agentStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── supabase.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   ├── chat.ts
│   │   │   ├── agent.ts
│   │   │   └── models.ts
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── api/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── auth.py
│       │   └── middleware.py
│       ├── routers/
│       │   ├── chat.py
│       │   ├── agents.py
│       │   ├── prompts.py
│       │   ├── files.py
│       │   ├── models.py
│       │   ├── automations.py
│       │   └── projects.py
│       ├── services/
│       │   ├── llm_service.py
│       │   ├── agent_service.py
│       │   ├── file_service.py
│       │   └── stream_service.py
│       ├── models/
│       │   ├── user.py
│       │   ├── conversation.py
│       │   ├── agent.py
│       │   ├── prompt.py
│       │   └── project.py
│       ├── schemas/
│       │   ├── chat.py
│       │   ├── agent.py
│       │   └── prompt.py
│       ├── requirements.txt
│       └── Dockerfile
├── packages/
│   ├── ui/
│   └── types/
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```
