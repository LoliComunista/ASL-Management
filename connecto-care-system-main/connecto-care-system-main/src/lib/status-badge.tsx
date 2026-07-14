import type { ClientStatus } from "./store";

const MAP: Record<ClientStatus, string> = {
  Prospecto: "bg-accent text-accent-foreground",
  "Em andamento": "bg-[oklch(0.78_0.15_75)] text-[oklch(0.2_0.05_75)]",
  "Aguardando resposta": "bg-[oklch(0.85_0.09_230)] text-[oklch(0.2_0.1_230)]",
  Concluído: "bg-[oklch(0.75_0.15_155)] text-[oklch(0.2_0.08_155)]",
  Cancelado: "bg-destructive text-destructive-foreground",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + MAP[status]}>
      {status}
    </span>
  );
}
