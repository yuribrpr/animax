import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL || "https://aqxhfwoqmmtkipnuzoqx.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeGhmd29xbW10a2lwbnV6b3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTM0ODAsImV4cCI6MjA4NjU4OTQ4MH0.3PFJkjNta_17j0RG9XYJjDb3ns-s11xjnCG1eHKbBXg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "A senha deve ter ao menos 6 caracteres." });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data.session) {
      return res.status(202).json({
        message: "Conta criada. Confirme seu e-mail para fazer login.",
        token: null,
        user: {
          id: data.user?.id,
          name,
          email: data.user?.email || email,
        },
      });
    }

    return res.status(201).json({
      token: data.session.access_token,
      user: {
        id: data.user?.id,
        name: data.user?.user_metadata?.name || name,
        email: data.user?.email || email,
      },
    });
  } catch {
    return res.status(502).json({ message: "Falha ao conectar ao Supabase." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e senha." });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      return res.status(401).json({ message: error?.message || "Credenciais inválidas." });
    }

    return res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email,
        email: data.user.email,
      },
    });
  } catch {
    return res.status(502).json({ message: "Falha ao conectar ao Supabase." });
  }
});

app.get("/api/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Token inválido." });
    }

    return res.json({
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email,
      email: data.user.email,
      created_at: data.user.created_at,
    });
  } catch {
    return res.status(502).json({ message: "Falha ao conectar ao Supabase." });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
