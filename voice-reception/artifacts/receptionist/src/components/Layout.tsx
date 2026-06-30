import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: ReactNode }) {
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-end px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${health?.status === "ok" ? "bg-green-500" : "bg-destructive"}`} />
            API Status: {health?.status === "ok" ? "Online" : "Offline"}
          </div>
        </header>
        <div className="p-8 max-w-5xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
