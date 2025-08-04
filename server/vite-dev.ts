import type { Express } from "express";
import type { Server } from "node:http";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    plugins: [react()],
  });

  app.use(vite.middlewares);
}
