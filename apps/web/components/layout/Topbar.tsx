import ModelSelector from '@/components/chat/ModelSelector';

export function Topbar() {
  return (
    <header className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <input className="w-1/2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm" placeholder="Buscar..." />
      <ModelSelector />
    </header>
  );
}
