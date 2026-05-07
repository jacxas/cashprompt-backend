export function AgentRunner() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold">Gestor de agentes</h3>
      <ul className="space-y-2 text-sm text-slate-300">
        <li>Research Agent · idle</li>
        <li>Sales Agent · running</li>
        <li>Ops Agent · idle</li>
      </ul>
    </section>
  );
}
