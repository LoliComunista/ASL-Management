// Simple localStorage-backed store for the ASL Management mockup.
// All data is client-side only.

export type ClientStatus =
  | "Prospecto"
  | "Em andamento"
  | "Aguardando resposta"
  | "Concluído"
  | "Cancelado";

export const STATUS_OPTIONS: ClientStatus[] = [
  "Prospecto",
  "Em andamento",
  "Aguardando resposta",
  "Concluído",
  "Cancelado",
];

export interface HistoryEntry {
  id: string;
  date: string; // ISO
  text: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  status: ClientStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  observations?: string;
  followUpDate?: string; // ISO date (yyyy-mm-dd)
  history: HistoryEntry[];
}

const KEY = "asl_clients_v1";

function seed(): Client[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const inDays = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: crypto.randomUUID(),
      name: "João da Silva",
      phone: "(11) 98765-4321",
      email: "joao@email.com",
      city: "São Paulo",
      status: "Em andamento",
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      observations: "Prefere contato via WhatsApp. Pagamento no PIX.",
      followUpDate: inDays(2),
      history: [
        { id: crypto.randomUUID(), date: daysAgo(5), text: "Cliente solicitou orçamento para instalação elétrica." },
        { id: crypto.randomUUID(), date: daysAgo(1), text: "Enviado orçamento por e-mail. Aguardando retorno." },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Maria Oliveira",
      phone: "(21) 99876-1234",
      email: "maria.o@email.com",
      city: "Rio de Janeiro",
      status: "Prospecto",
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      observations: "",
      history: [
        { id: crypto.randomUUID(), date: daysAgo(2), text: "Primeiro contato via indicação." },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Carlos Pereira",
      phone: "(31) 98111-2233",
      city: "Belo Horizonte",
      status: "Concluído",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(10),
      observations: "Serviço finalizado com sucesso.",
      history: [
        { id: crypto.randomUUID(), date: daysAgo(30), text: "Contrato fechado." },
        { id: crypto.randomUUID(), date: daysAgo(10), text: "Serviço concluído e cliente satisfeito." },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Ana Souza",
      phone: "(41) 99555-8877",
      email: "ana.souza@email.com",
      city: "Curitiba",
      status: "Aguardando resposta",
      createdAt: daysAgo(7),
      updatedAt: daysAgo(3),
      followUpDate: inDays(-1),
      history: [
        { id: crypto.randomUUID(), date: daysAgo(7), text: "Cliente pediu proposta detalhada." },
        { id: crypto.randomUUID(), date: daysAgo(3), text: "Proposta enviada. Aguardando resposta." },
      ],
      observations: "",
    },
  ];
}

export function loadClients(): Client[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Client[];
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]) {
  localStorage.setItem(KEY, JSON.stringify(clients));
  window.dispatchEvent(new Event("asl-clients-changed"));
}

export function upsertClient(client: Client) {
  const all = loadClients();
  const idx = all.findIndex((c) => c.id === client.id);
  if (idx >= 0) all[idx] = client;
  else all.unshift(client);
  saveClients(all);
}

export function deleteClient(id: string) {
  saveClients(loadClients().filter((c) => c.id !== id));
}

export function getClient(id: string): Client | undefined {
  return loadClients().find((c) => c.id === id);
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export function toCSV(clients: Client[]): string {
  const header = ["Nome", "Telefone", "Email", "Cidade", "Status", "Cadastro", "Atualização", "Retorno", "Observações"];
  const rows = clients.map((c) => [
    c.name,
    c.phone,
    c.email ?? "",
    c.city,
    c.status,
    formatDate(c.createdAt),
    formatDate(c.updatedAt),
    c.followUpDate ? formatDate(c.followUpDate) : "",
    (c.observations ?? "").replace(/\n/g, " "),
  ]);
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [header, ...rows].map((r) => r.map(esc).join(";")).join("\n");
}
