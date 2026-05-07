const items = ['Dashboard','Chat','Agents','Prompts','Files','Content','Automations','Projects','Settings'];

export function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-900/70 p-4 lg:block">
      <h2 className="mb-4 text-sm font-semibold text-slate-300">AI OS</h2>
      <nav className="space-y-1">
        {items.map((item) => (
          <button key={item} className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800" type="button">{item}</button>
        ))}
      </nav>
    </aside>
  );
}
