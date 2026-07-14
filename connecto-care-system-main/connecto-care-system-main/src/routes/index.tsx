import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/asl-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASL Management — Login" },
      { name: "description", content: "Sistema de gerenciamento de clientes ASL Management." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@asl.com");
  const [senha, setSenha] = useState("admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("asl_auth", "1");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left: logo */}
      <div className="flex items-center justify-center bg-secondary p-8">
        <img src={logo} alt="ASL Management" className="max-w-xs w-full h-auto" />
      </div>

      {/* Right: login form */}
      <div
        className="flex items-center justify-center p-8"
        style={{ background: "var(--gradient-primary)" }}
      >
        <form onSubmit={handleSubmit} className="w-full max-w-sm text-primary-foreground">
          <h1 className="text-4xl font-bold text-center tracking-wide mb-8">LOGIN</h1>

          <label className="block mb-4">
            <span className="text-sm font-medium">Email:</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Insira seu email..."
              className="mt-1 w-full rounded-full bg-background text-foreground px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          <label className="block mb-2">
            <span className="text-sm font-medium">Senha:</span>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Insira sua senha..."
              className="mt-1 w-full rounded-full bg-background text-foreground px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          <div className="text-center text-xs opacity-80 mb-4 mt-3">
            <a href="#" className="hover:underline">Esqueci minha senha</a>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-background text-primary font-bold py-2 tracking-widest hover:bg-accent transition-colors"
          >
            LOGAR
          </button>

          <p className="text-center text-xs opacity-70 mt-6">
            Mockup — qualquer usuário/senha entra
          </p>
        </form>
      </div>
    </div>
  );
}
