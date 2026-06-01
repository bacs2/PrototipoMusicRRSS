"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type UserInfo = {
  id: string;
  username: string;
  nombre: string | null;
  avatar_url: string | null;
} | null;

export default function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("rr_username");
    if (storedUsername) {
      setUser({ id: "", username: storedUsername, nombre: null, avatar_url: null });
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("rr_username", data.user.username);
        } else if (!localStorage.getItem("rr_username")) {
          setUser(null);
        }
      })
      .catch(() => {});

    const handleAuth = () => {
      const stored = localStorage.getItem("rr_username");
      setUser(stored ? { id: "", username: stored, nombre: null, avatar_url: null } : null);
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("rr_username", data.user.username);
          } else if (!localStorage.getItem("rr_username")) {
            setUser(null);
          }
        })
        .catch(() => {});
    };

    window.addEventListener("rr-auth-change", handleAuth);
    return () => window.removeEventListener("rr-auth-change", handleAuth);
  }, []);

  const navItems = [
    { label: "Feed", href: "/feed" },
    { label: "Biblioteca", href: "/library" },
    user
      ? { label: "Perfil", href: `/profile/${user.username}` }
      : { label: "Iniciar sesión", href: "/auth" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-6 pb-safe bg-surface-container-low/80 backdrop-blur-2xl z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all text-[10px] font-semibold ${
              isActive ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
