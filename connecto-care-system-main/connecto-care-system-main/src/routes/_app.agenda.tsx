import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadClients, formatDate, type Client } from "@/lib/store";
import { StatusBadge } from "@/lib/status-badge";

export const Route = createFileRoute("/_app/agenda")({
  head: () => ({ meta: [{ title: "Agenda — ASL Management" }] }),
  component: Agenda,
});

function Agenda() {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => {
    const refresh = () => setClients(loadClients());
    refresh();
    window.addEventListener("asl-clients-changed", refresh);
    return () => window.removeEventListener("asl-clients-changed", refresh);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const withFollowUp = clients
    .filter((c) => c.followUpDate)
    .sort((a, b) => (a.followUpDate ?? "").localeCompare(b.followUpDate ?? ""));

  const overdue = withFollowUp.filter((c) => (c.followUpDate ?? "") < today);
  const todayList = withFollowUp.filter((c) => c.followUpDate === today);
  const upcoming = withFollowUp.filter((c) => (c.followUpDate ?? "") > today);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Agenda de Retorno</h1>
        <p className="text-muted-foreground">Retornos agendados para os clientes.</p>
      </header>

      <Group title="⚠ Atrasados" items={overdue} highlight="border-destructive bg-destructive/10" />
      <Group title="📅 Hoje" items={todayList} highlight="border-[oklch(0.78_0.15_75)] bg-[oklch(0.78_0.15_75)]/15" />
      <Group title="Próximos" items={upcoming} highlight="border-border bg-card" />
    </div>
  );
}

function Group({ title, items, highlight }: { title: string; items: Client[]; highlight: string }) {
  return (
    <section>
      <h2 className="font-semibold mb-2">{title} <span className="text-muted-foreground text-sm">({items.length})</span></h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg px-4 py-6 text-center">
          Nada por aqui.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className={"rounded-lg border p-4 flex items-center justify-between gap-3 " + highlight}>
              <div className="min-w-0">
                <Link to="/clientes/$id" params={{ id: c.id }} className="font-medium hover:underline">
                  {c.name}
                </Link>
                <div className="text-xs text-muted-foreground">{c.city} · {c.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{formatDate(c.followUpDate!)}</div>
                <StatusBadge status={c.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
