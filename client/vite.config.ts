import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:4000";
const PORT = Number(process.env.PORT ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
});
