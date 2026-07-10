import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import { getStoredToken, clearToken, isUnauthorizedError } from "@/lib/auth";

// Pages
import Dashboard from "@/pages/Dashboard";
import Conversations from "@/pages/Conversations";
import ConversationDetail from "@/pages/ConversationDetail";
import Bookings from "@/pages/Bookings";
import WidgetDemo from "@/pages/WidgetDemo";
import WidgetEmbed from "@/pages/WidgetEmbed";
import TextChatEmbed from "@/pages/TextChatEmbed";

function AuthGuard({ children }: { children: React.ReactNode }) {
  if (!getStoredToken()) {
    return <Redirect to="/login" />;
  }
  return <>{children}</>;
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        clearToken();
        window.location.href = "/login";
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error)) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Login — no auth required */}
      <Route path="/login" component={LoginPage} />

      {/* Bare, chrome-free widgets for embedding in iframes (no admin layout, no auth) */}
      <Route path="/embed" component={WidgetEmbed} />
      <Route path="/embed-text" component={TextChatEmbed} />

      {/* All admin routes behind AuthGuard */}
      <Route>
        <AuthGuard>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/conversations" component={Conversations} />
              <Route path="/conversations/:id" component={ConversationDetail} />
              <Route path="/bookings" component={Bookings} />
              <Route path="/widget" component={WidgetDemo} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
