import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  deleteClient,
  formatDateTime,
  getClient,
  STATUS_OPTIONS,
  upsertClient,
  type Client,
  type ClientStatus,
} from "@/lib/store";

export const Route = createFileRoute("/_app/clientes/$id")({
  head: () => ({ meta: [{ title: "Cliente — ASL Management" }] }),
  component: ClientDetail,
});

function emptyClient(): Client {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "",
    phone: "",
    email: "",
    city: "",
    status: "Prospecto",
    createdAt: now,
    updatedAt: now,
    observations: "",
    followUpDate: "",
    history: [],
  };
}

function ClientDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "novo";

  const [client, setClient] = useState<Client | null>(null);
  const [newNote, setNewNote] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isNew) {
      setClient(emptyClient());
    } else {
      const found = getClient(id);
      if (!found) setNotFound(true);
      else setClient(found);
    }
  }, [id, isNew]);

  if (notFound) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <button className="mt-4 text-primary underline" onClick={() => navigate({ to: "/clientes" })}>
          Voltar
        </button>
      </div>
    );
  }
  if (!client) return null;

  const set = <K extends keyof Client>(k: K, v: Client[K]) => setClient({ ...client, [k]: v });

  const save = () => {
    if (!client.name.trim() || !client.phone.trim() || !client.city.trim()) {
      alert("Nome, telefone e cidade são obrigatórios.");
      return;
    }
    const updated: Client = { ...client, updatedAt: new Date().toISOString() };
    upsertClient(updated);
    navigate({ to: "/clientes/$id", params: { id: updated.id } });
  };

  const remove = () => {
    if (confirm(`Excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) {
      deleteClient(client.id);
      navigate({ to: "/clientes" });
    }
  };

  const addNote = () => {
    const text = newNote.trim();
    if (!text) return;
    const entry = { id: crypto.randomUUID(), date: new Date().toISOString(), text };
    const updated: Client = {
      ...client,
      history: [entry, ...client.history],
      updatedAt: new Date().toISOString(),
    };
    setClient(updated);
    if (!isNew) upsertClient(updated);
    setNewNote("");
  };

  const deleteNote = (nid: string) => {
    if (!confirm("Excluir esta anotação?")) return;
    const updated: Client = { ...client, history: client.history.filter((h) => h.id !== nid) };
    setClient(updated);
    if (!isNew) upsertClient(updated);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => navigate({ to: "/clientes" })} className="text-sm text-muted-foreground hover:underline mb-1">
            ← Clientes
          </button>
          <h1 className="text-3xl font-bold">{isNew ? "Novo Cliente" : client.name || "Sem nome"}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button onClick={remove} className="rounded-md border border-destructive text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground">
              Excluir
            </button>
          )}
          <button onClick={save} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
            Salvar
          </button>
        </div>
      </header>

      {/* Dados */}
      <section className="bg-card border border-border rounded-xl p-5 grid md:grid-cols-2 gap-4">
        <Field label="Nome completo *">
          <input className={inp} value={client.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Telefone *">
          <input className={inp} value={client.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="E-mail (opcional)">
          <input type="email" className={inp} value={client.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Cidade *">
          <input className={inp} value={client.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Status">
          <select className={inp} value={client.status} onChange={(e) => set("status", e.target.value as ClientStatus)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Agenda de retorno">
          <input type="date" className={inp} value={client.followUpDate ?? ""} onChange={(e) => set("followUpDate", e.target.value)} />
        </Field>
        <Field label="Data do cadastro">
          <input disabled className={inp + " opacity-70"} value={formatDateTime(client.createdAt)} />
        </Field>
        <Field label="Última atualização">
          <input disabled className={inp + " opacity-70"} value={formatDateTime(client.updatedAt)} />
        </Field>
      </section>

      {/* Observações */}
      <section className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-2">Observações Gerais</h2>
        <p className="text-xs text-muted-foreground mb-2">
          Endereço, preferências, forma de pagamento, informações importantes.
        </p>
        <textarea
          rows={4}
          className={inp}
          value={client.observations ?? ""}
          onChange={(e) => set("observations", e.target.value)}
        />
      </section>

      {/* Histórico */}
      <section className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Histórico de Atendimento</h2>
        <div className="flex gap-2 mb-4">
          <input
            className={inp}
            placeholder="Nova anotação..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button onClick={addNote} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 whitespace-nowrap">
            Adicionar
          </button>
        </div>
        {client.history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma anotação registrada.</p>
        ) : (
          <ul className="space-y-3">
            {client.history.map((h) => (
              <li key={h.id} className="border-l-4 border-primary bg-secondary/60 rounded-r-md px-3 py-2 flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{formatDateTime(h.date)}</div>
                  <div className="text-sm whitespace-pre-wrap">{h.text}</div>
                </div>
                <button onClick={() => deleteNote(h.id)} className="text-xs text-destructive hover:underline shrink-0">
                  remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const inp = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
