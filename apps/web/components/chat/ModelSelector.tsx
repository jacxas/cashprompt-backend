'use client';

import { useChatStore } from '@/store/chatStore';

const models = ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'];

export default function ModelSelector() {
  const activeModel = useChatStore((s) => s.activeModel);
  const setActiveModel = useChatStore((s) => s.setActiveModel);

  return (
    <select
      value={activeModel}
      onChange={(e) => setActiveModel(e.target.value)}
      className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
    >
      {models.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}
