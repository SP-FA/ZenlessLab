import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("zzz_calc.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    stats TEXT NOT NULL,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/profiles", (req, res) => {
    const profiles = db.prepare("SELECT * FROM profiles ORDER BY updated_at DESC").all();
    res.json(profiles.map((p: any) => ({ ...p, stats: JSON.parse(p.stats) })));
  });

  app.post("/api/profiles", (req, res) => {
    const { name, type, stats, notes } = req.body;
    const info = db.prepare(
      "INSERT INTO profiles (name, type, stats, notes) VALUES (?, ?, ?, ?)"
    ).run(name, type, JSON.stringify(stats), notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/profiles/:id", (req, res) => {
    const { id } = req.params;
    const { name, type, stats, notes } = req.body;
    db.prepare(
      "UPDATE profiles SET name = ?, type = ?, stats = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(name, type, JSON.stringify(stats), notes, id);
    res.json({ success: true });
  });

  app.delete("/api/profiles/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM profiles WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
