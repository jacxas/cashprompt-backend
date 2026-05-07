export function ChatWindow() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-4 py-3 text-sm">Chat principal multi-modelo</div>
      <div className="min-h-[420px] space-y-3 p-4 text-sm">
        <div className="max-w-[80%] rounded-lg bg-slate-800 p-3">Diseña un MVP SaaS de IA multi-agente.</div>
        <div className="ml-auto max-w-[80%] rounded-lg bg-indigo-600 p-3">Aquí tienes una propuesta en fases y arquitectura técnica...</div>
      </div>
    </section>
  );
}
