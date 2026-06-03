export type Conversation = {
  id: string;
  title: string | null;
  model: string;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
