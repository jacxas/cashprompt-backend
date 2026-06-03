import { ChatWindow } from '@/components/chat/ChatWindow';
import { AgentRunner } from '@/components/agents/AgentRunner';

export default function DashboardPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <div className="xl:col-span-3"><ChatWindow /></div>
      <div className="xl:col-span-2"><AgentRunner /></div>
    </div>
  );
}
