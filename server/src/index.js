import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "animax-dev-secret";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../database.sqlite");

app.use(cors());
app.use(express.json());

const db = await open({
  filename: dbPath,
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "1d",
  });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente." });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido." });
  }
};

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "A senha deve ter ao menos 6 caracteres." });
  }

  const existingUser = await db.get("SELECT id FROM users WHERE email = ?", email);

  if (existingUser) {
    return res.status(409).json({ message: "E-mail já cadastrado." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    name,
    email,
    hashedPassword,
  );

  const user = { id: result.lastID, name, email };
  const token = createToken(user);

  return res.status(201).json({ token, user });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e senha." });
  }

  const user = await db.get("SELECT * FROM users WHERE email = ?", email);

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const token = createToken(user);

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/api/me", authMiddleware, async (req, res) => {
  const user = await db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  return res.json(user);
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
