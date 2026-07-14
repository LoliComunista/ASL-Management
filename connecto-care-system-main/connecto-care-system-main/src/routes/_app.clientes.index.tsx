import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { loadClients, STATUS_OPTIONS, toCSV, type Client, type ClientStatus, formatDate } from "@/lib/store";
import { StatusBadge } from "@/lib/status-badge";

export const Route = createFileRoute("/_app/clientes/")({
  head: () => ({ meta: [{ title: "Clientes — ASL Management" }] }),
  component: ClientList,
});

type SortKey = "updatedAt" | "createdAt" | "name" | "status";

function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos");
  const [sort, setSort] = useState<SortKey>("updatedAt");

  useEffect(() => {
    const refresh = () => setClients(loadClients());
    refresh();
    window.addEventListener("asl-clients-changed", refresh);
    return () => window.removeEventListener("asl-clients-changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = clients.filter((c) => {
      const matchStatus = statusFilter === "Todos" || c.status === statusFilter;
      if (!matchStatus) return false;
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.status.toLowerCase().includes(term)
      );
    });
    list = list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return a.status.localeCompare(b.status);
      if (sort === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
    return list;
  }, [clients, q, statusFilter, sort]);

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_asl_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">{filtered.length} de {clients.length} clientes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => navigate({ to: "/clientes/$id", params: { id: "novo" } })}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            + Novo Cliente
          </button>

        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, telefone, cidade ou status..."
          className="md:col-span-2 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "Todos")}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <option value="Todos">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <option value="updatedAt">Ordenar: Última atualização</option>
          <option value="createdAt">Ordenar: Data de cadastro</option>
          <option value="name">Ordenar: Nome</option>
          <option value="status">Ordenar: Status</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Nome</th>
              <th className="text-left px-4 py-3 font-semibold">Telefone</th>
              <th className="text-left px-4 py-3 font-semibold">Cidade</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Última atualização</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-accent/40">
                <td className="px-4 py-3">
                  <Link to="/clientes/$id" params={{ id: c.id }} className="font-medium text-primary hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{c.city}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(c.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
