"use client";

import { useState, type FormEvent } from "react";
import { User, Lock, LogIn, UserPlus, Mail } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, nombre: nombre || username, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setMessage({ text: data.error, error: true });
        } else {
          localStorage.setItem("rr_username", data.username);
          window.dispatchEvent(new Event("rr-auth-change"));
          window.location.href = `/profile/${data.username}`;
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setMessage({ text: data.error, error: true });
        } else {
          localStorage.setItem("rr_username", data.username);
          window.dispatchEvent(new Event("rr-auth-change"));
          window.location.href = `/profile/${data.username}`;
        }
      }
    } catch {
      setMessage({ text: "Error inesperado. Intenta de nuevo.", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-3xl bg-surface-container-low p-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-black text-on-surface">
            RateRecord
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {mode === "login"
              ? "Inicia sesión en tu cuenta"
              : "Crea una nueva cuenta"}
          </p>
        </div>

        <div className="mb-6 flex rounded-xl bg-surface-container p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-gradient-to-br from-primary to-primary-dim text-white shadow-lg"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <LogIn className="mr-1.5 inline h-4 w-4" />
            Entrar
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-gradient-to-br from-primary to-primary-dim text-white shadow-lg"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <UserPlus className="mr-1.5 inline h-4 w-4" />
            Crear
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-md mb-1.5 block">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tu_username"
                required
                minLength={3}
                className="w-full rounded-xl bg-surface-container py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {mode === "signup" ? (
            <>
            <div>
              <label className="label-md mb-1.5 block">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full rounded-xl bg-surface-container py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="label-md mb-1.5 block">Nombre (opcional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl bg-surface-container py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            </>
          ) : null}

          <div>
            <label className="label-md mb-1.5 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={4}
                className="w-full rounded-xl bg-surface-container py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {message ? (
            <p
              className={`rounded-xl px-4 py-2 text-xs ${
                message.error
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {message.text}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-br from-primary to-primary-dim py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Procesando..."
              : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
