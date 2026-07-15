import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" so the production build also works when served from a static sub-path.
export default defineConfig({
  plugins: [react()],
  base: "./",
  // Honor a harness-assigned port (autoPort) via PORT; fall back to 5173 locally.
  server: { port: Number(process.env.PORT) || 5173, host: true },
});
