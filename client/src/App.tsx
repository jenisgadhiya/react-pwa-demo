import { Switch, Route } from "wouter";
import UsersPage from "./pages/users";
import NotFound from "@/pages/not-found";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

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