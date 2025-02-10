import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import UsersPage from "./pages/users";
import NotFound from "@/pages/not-found";
import { ConfigProvider } from "antd";

const theme = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorError: "#f5222d",
    colorBgBase: "#f0f2f5",
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
        <Router />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
