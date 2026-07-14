import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import logo from "@/assets/asl-logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Painel" },
  { to: "/clientes", label: "Clientes" },
  { to: "/agenda", label: "Agenda de Retorno" },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("asl_auth")) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("asl_auth");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logo} alt="ASL" className="w-10 h-10 rounded bg-background p-1" />
            <div className="leading-tight">
              <div className="font-bold text-sm">ASL</div>
              <div className="text-xs opacity-70">Management</div>
            </div>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border w-72 p-0">
              <SheetHeader className="p-4 border-b border-sidebar-border">
                <SheetTitle className="text-sidebar-foreground text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex-1 p-3 space-y-1">
                {NAV.map((item) => {
                  const active =
                    location.pathname === item.to ||
                    (item.to === "/clientes" && location.pathname.startsWith("/clientes"));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={
                        "block px-3 py-2 rounded-md text-sm transition-colors " +
                        (active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          : "hover:bg-sidebar-accent")
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-sidebar-border">
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 min-w-0 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
