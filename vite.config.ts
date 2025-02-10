import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const manifestForPlugIn: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  manifest: {
    name: 'My App',
    short_name: 'MyApp',
    description: 'My awesome app built with React and Vite',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icons/192.png',  // Reference the icon in the public folder
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/512.png',  // Larger icon for better resolution
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    VitePWA(manifestForPlugIn),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
