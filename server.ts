import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Minimal health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Silencly" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Silencly Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
