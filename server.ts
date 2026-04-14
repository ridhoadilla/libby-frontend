import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Libby Backend is running" });
  });

  // Placeholder for ebook data (in a real app, this would come from Firestore)
  const mockBooks = [
    { id: "1", title: "Laskar Pelangi", author: "Andrea Hirata", price: 85000, category: "Fiction", cover: "https://picsum.photos/seed/laskar/200/300" },
    { id: "2", title: "Bumi Manusia", author: "Pramoedya Ananta Toer", price: 95000, category: "History", cover: "https://picsum.photos/seed/bumi/200/300" },
    { id: "3", title: "Filosofi Teras", author: "Henry Manampiring", price: 75000, category: "Self-Help", cover: "https://picsum.photos/seed/teras/200/300" },
  ];

  app.get("/api/books", (req, res) => {
    res.json(mockBooks);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
