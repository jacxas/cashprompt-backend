import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Conversation, Message } from '@/types/chat';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeModel: string;
  messages: Record<string, Message[]>;
  isStreaming: boolean;
  setActiveModel: (model: string) => void;
  sendMessage: (content: string) => Promise<void>;
  loadConversations: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  activeModel: 'gpt-4o',
  messages: {},
  isStreaming: false,
  setActiveModel: (model) => set({ activeModel: model }),
  sendMessage: async (content) => {
    const state = get();
    if (!state.activeConversationId) {
      const created = await api.post<Conversation>('/chat/conversations', {
        title: 'Nueva conversación',
        model: state.activeModel,
      });
      set((s) => ({
        activeConversationId: created.id,
        conversations: [created, ...s.conversations],
      }));
    }

    const conversationId = get().activeConversationId as string;
    const userMsg: Message = { role: 'user', content };
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), userMsg],
      },
      isStreaming: true,
    }));

    const result = await api.post<{ output: string }>('/chat/completions', {
      model: get().activeModel,
      message: content,
      stream: false,
    });

    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [
          ...(s.messages[conversationId] ?? []),
          { role: 'assistant', content: result.output },
        ],
      },
      isStreaming: false,
    }));
  },
  loadConversations: async () => {
    const data = await api.get<Conversation[]>('/chat/conversations');
    set({ conversations: data });
  },
}));
