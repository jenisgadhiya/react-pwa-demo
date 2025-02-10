import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { testConnection } from "./lib/supabase";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Test Supabase connection on startup
testConnection().then((isConnected) => {
  if (!isConnected) {
    console.error("Failed to connect to Supabase. Please check your configuration.");
  }
});

createRoot(rootElement).render(<App />);