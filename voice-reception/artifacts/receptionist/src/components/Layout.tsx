import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";

const PRODUCTION_URL = "https://mia-voice-receptionist.onrender.com";

export function Layout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: health } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 },
  });

  function handleLogout() {
    clearToken();
    setLocation("/login");
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6 gap-4">
          <a
            href={PRODUCTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-production-site"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            mia-voice-receptionist.onrender.com
          </a>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={`w-2 h-2 rounded-full ${
                  health?.status === "ok" ? "bg-green-500" : "bg-destructive"
                }`}
              />
              API Status: {health?.status === "ok" ? "Online" : "Offline"}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground h-8 px-2 gap-1.5"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        </header>
        <div className="p-8 max-w-5xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
