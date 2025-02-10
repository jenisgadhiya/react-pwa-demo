import { Switch, Route } from "wouter";
import UsersPage from "./pages/users";
import NotFound from "@/pages/not-found";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useEffect, useState } from "react";
import { testConnection } from "./lib/supabase";
import { Loader2 } from "lucide-react";

const theme = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorError: "#f5222d",
    colorBgBase: "#ffffff",
    borderRadius: 4,
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={UsersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    testConnection()
      .then((isConnected) => {
        if (!isConnected) {
          setConnectionError("Failed to connect to Supabase. Please check your configuration.");
        }
      })
      .catch((error) => {
        setConnectionError(error.message);
      })
      .finally(() => {
        setIsConnecting(false);
      });
  }, []);

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Connecting to Supabase...</span>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{connectionError}</p>
          <p className="text-muted-foreground">
            Please check your Supabase configuration and ensure the database is properly set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <div className="min-h-screen bg-background">
            <Router />
          </div>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;