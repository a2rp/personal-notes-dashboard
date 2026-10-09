import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/personal-notes-dashboard/",
  build: { sourcemap: false },
  plugins: [react()],
});

