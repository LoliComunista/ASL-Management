import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadClients, type Client } from "@/lib/store";
import { StatusBadge } from "@/lib/status-badge";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Painel — ASL Management" }] }),
  component: Dashboard,
});

function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => {
    const refresh = () => setClients(loadClients());
    refresh();
    window.addEventListener("asl-clients-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("asl-clients-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return clients;
}

function Dashboard() {
  const clients = useClients();
  const total = clients.length;
  const andamento = clients.filter((c) => c.status === "Em andamento").length;
  const concluidos = clients.filter((c) => c.status === "Concluído").length;
  const prospectos = clients.filter((c) => c.status === "Prospecto").length;
  const today = new Date().toISOString().slice(0, 10);
  const retornosPendentes = clients.filter((c) => c.followUpDate && c.followUpDate <= today).length;

  const cards = [
    { label: "Total de clientes", value: total, tone: "bg-primary text-primary-foreground" },
    { label: "Em andamento", value: andamento, tone: "bg-[oklch(0.78_0.15_75)] text-[oklch(0.2_0.05_75)]" },
    { label: "Concluídos", value: concluidos, tone: "bg-[oklch(0.75_0.15_155)] text-[oklch(0.2_0.08_155)]" },
    { label: "Prospectos", value: prospectos, tone: "bg-accent text-accent-foreground" },
    { label: "Retornos pendentes", value: retornosPendentes, tone: "bg-destructive text-destructive-foreground" },
  ];

  const recent = [...clients]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Painel Inicial</h1>
        <p className="text-muted-foreground">Visão geral dos atendimentos.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={"rounded-xl p-4 shadow-sm " + c.tone}>
            <div className="text-xs uppercase tracking-wide opacity-80">{c.label}</div>
            <div className="text-3xl font-bold mt-2">{c.value}</div>
          </div>
        ))}
      </section>

      <section className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Últimos clientes atualizados</h2>
          <Link to="/clientes" className="text-sm text-primary hover:underline">Ver todos →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link to="/clientes/$id" params={{ id: c.id }} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{c.city} · {c.phone}</div>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
