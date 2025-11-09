export default function TodoSection({ ui }) {
  return (
    <section id="todo" className="bg-slate-50 max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold">{ui.todo.headline}</h2>
      <p className="mt-2 text-slate-600">{ui.todo.note}</p>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {ui.todo.items.map((item, i) => (
          <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="mt-2 text-slate-700 text-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
