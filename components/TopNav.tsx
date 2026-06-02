"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Bell, User, Sun, Moon, LogOut, Shield } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

type UserInfo = {
  id: string;
  username: string;
  nombre: string | null;
  avatar_url: string | null;
  is_admin?: boolean;
} | null;

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserInfo>(null);

  const syncUser = () => {
    const storedUsername = localStorage.getItem("rr_username");

    // Si no hay username guardado, mostrar como no logueado
    if (!storedUsername) {
      setUser(null);
    }

    // Hacer fetch para obtener datos completos del usuario
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("rr_username", data.user.username);
        } else {
          // Solo limpiar si NO hay username en localStorage
          // (evita race condition: cookie no lista aún)
          if (!localStorage.getItem("rr_username")) {
            setUser(null);
            localStorage.removeItem("rr_username");
          }
        }
      })
      .catch(() => {
        // Error de red: mantener usuario de localStorage si existe
        if (!localStorage.getItem("rr_username")) {
          setUser(null);
          localStorage.removeItem("rr_username");
        }
      });
  };

  useEffect(() => {
    syncUser();
    window.addEventListener("rr-auth-change", syncUser);
    return () => window.removeEventListener("rr-auth-change", syncUser);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("rr_username");
    window.dispatchEvent(new Event("rr-auth-change"));
    setUser(null);
    router.push("/auth");
    router.refresh();
  };

  const navLinks = [
    { name: "Feed", href: "/feed" },
    { name: "Biblioteca", href: "/library" },
    user
      ? { name: "Perfil", href: `/profile/${user.username}` }
      : { name: "Iniciar sesión", href: "/auth" },
    ...(user?.is_admin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  return (
    <nav className="w-full h-20 px-8 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex-1" />

      <ul className="flex items-center gap-8 flex-1 justify-center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.name} className="relative">
              <Link
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-on-surface ${
                  isActive ? "text-on-surface" : "text-on-surface-variant"
                }`}
              >
                {link.name}
              </Link>
              {isActive && (
                <div className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary rounded-t-md shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-6 flex-1 justify-end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const q = formData.get("q") as string;
            if (q.trim()) {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }
          }}
          className="relative group hidden md:block"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            name="q"
            placeholder="Search artists..."
            className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:bg-surface-container transition-all w-64"
          />
        </form>

        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="relative text-on-surface-variant hover:text-on-surface transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border border-background" />
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-on-surface">{user.nombre ?? user.username}</span>
            <Link href={`/profile/${user.username}`} className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-primary/30 hover:border-primary transition-colors overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
              {user.is_admin && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-white ring-2 ring-background" title="Admin">
                  <Shield className="h-2 w-2" />
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-primary/30 hover:border-primary transition-colors overflow-hidden"
          >
            <User className="w-4 h-4 text-on-surface-variant" />
          </Link>
        )}
      </div>
    </nav>
  );
}
