import { useMemo, useState } from "react";
import { Button } from "./components/ui/button";

const API_URL = "http://localhost:3001/api";

const defaultForm = { name: "", email: "", password: "" };

function App() {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState(defaultForm);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const persistSession = (authToken, authUser) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "login" : "register";
      const payload = mode === "login"
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha ao autenticar");
      }

      if (!data.token) {
        setMode("login");
        setFormData(defaultForm);
        setError(data.message || "Conta criada! Faça login após confirmar seu e-mail.");
        return;
      }

      persistSession(data.token, data.user);
      setFormData(defaultForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setError("");
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível carregar seu perfil.");
      }
      setUser((prev) => ({ ...prev, ...data }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...data }));
    } catch (fetchError) {
      setError(fetchError.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setFormData(defaultForm);
  };

  if (isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-5 p-6">
        <section className="rounded-lg border bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Home</p>
          <h1 className="mt-2 text-2xl font-bold">Olá, {user.name} 👋</h1>
          <p className="mt-3 text-slate-600">Seu e-mail: {user.email}</p>
          {user.created_at ? <p className="text-slate-600">Conta criada em: {new Date(user.created_at).toLocaleString()}</p> : null}

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={fetchProfile}>Atualizar perfil</Button>
            <Button onClick={logout}>Sair</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <section className="rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="mt-1 text-sm text-slate-600">Sistema com React + Node.js + Supabase</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" ? (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">Nome</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={updateField}
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={updateField}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Senha</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={updateField}
              className="w-full rounded-md border px-3 py-2"
              minLength={6}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? "Carregando..." : mode === "login" ? "Entrar" : "Registrar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
          className="mt-4 text-sm text-slate-600 underline"
        >
          {mode === "login" ? "Ainda não tem conta? Registre-se" : "Já possui conta? Faça login"}
        </button>
      </section>
    </main>
  );
}

export default App;
