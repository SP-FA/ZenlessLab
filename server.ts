import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// When packaged with pkg, we need to handle the static path differently
const isPackaged = (process as any).pkg !== undefined;
const staticPath = isPackaged 
  ? path.join(__dirname, "..", "dist") // pkg bundles assets relative to the bin
  : path.join(__dirname, "dist");

const db = new Database(config.DB_PATH);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    stats TEXT NOT NULL,
    team TEXT,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec("ALTER TABLE profiles ADD COLUMN team TEXT");
} catch (e) {
  // Column already exists
}

async function startServer() {
  const app = express();
  const PORT = config.PORT;
  const HOST = config.HOST;

  app.use(express.json());

  // API Routes
  app.get("/api/profiles", (req, res) => {
    const profiles = db.prepare("SELECT * FROM profiles ORDER BY updated_at DESC").all();
    res.json(profiles.map((p: any) => ({ 
      ...p, 
      stats: JSON.parse(p.stats),
      team: p.team ? JSON.parse(p.team) : undefined
    })));
  });

  app.post("/api/profiles", (req, res) => {
    const { name, type, stats, team, notes } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO profiles (name, type, stats, team, notes) VALUES (?, ?, ?, ?, ?)"
      ).run(name, type, JSON.stringify(stats), team ? JSON.stringify(team) : null, notes);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("Insert failed", err);
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  app.put("/api/profiles/:id", (req, res) => {
    const { id } = req.params;
    const { name, type, stats, team, notes } = req.body;
    try {
      db.prepare(
        "UPDATE profiles SET name = ?, type = ?, stats = ?, team = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(name, type, JSON.stringify(stats), team ? JSON.stringify(team) : null, notes, id);
      res.json({ success: true });
    } catch (err) {
      console.error("Update failed", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
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
    app.use(express.static(staticPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
