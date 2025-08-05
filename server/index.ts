// import express, { type Request, Response, NextFunction } from "express";
// import { registerRoutes } from "./routes";
// import { log } from "./utils/log.js";
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }

//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// (async () => {
//   const server = await registerRoutes(app);


//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";

//     res.status(status).json({ message });
//     throw err;
//   });

//   // importantly only setup vite in development and after
//   // setting up all the other routes so the catch-all route
//   // doesn't interfere with the other routes
  

//   // ALWAYS serve the app on the port specified in the environment variable PORT
//   // Other ports are firewalled. Default to 5000 if not specified.
//   // this serves both the API and the client.
//   // It is the only port that is not firewalled.
//   const port = parseInt(process.env.PORT || '5003', 10);

//    if (process.env.NODE_ENV === "development") {
//   const { setupVite } = await import("../dev-only/vite-dev.js"); // 🔥 important: reference .js not .ts
//   await setupVite(app, server);
// } else {
//   const { serveStatic } = await import("./utils/serve-static.js"); // 🔥 important: reference .js not .ts
//   serveStatic(app);
// }


//   server.listen({
//     port,
//     host: "0.0.0.0",
//     reusePort: true,
//   }, () => {
//     log(`serving on port ${port}`);
//   });
// })();

// index.ts (optimized Express server)
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import session from 'express-session';
import MemoryStore from 'memorystore';
import dotenv from 'dotenv';

import { registerRoutes } from './routes';
import { serveStatic } from '../dev-only/vite';
import { log } from './utils/log';

dotenv.config();

const app = express();
const MemoryStoreSession = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.call(this, body, ...args);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let msg = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) msg += ` :: ${JSON.stringify(capturedJson)}`;
      log(msg);
    }
  });

  next();
});

// Session setup
app.use(
  session({
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000, httpOnly: true, secure: false },
  })
);

(async () => {
  const server = createServer(app);

  // Register API routes
  await registerRoutes(app);

  // Serve frontend
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    const { setupVite } = await import('../dev-only/vite'); // dynamic import for dev
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => log(`🚀 Server running on port ${port}`));
})();

