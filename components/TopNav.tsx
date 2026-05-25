"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, User, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

const NAV_LINKS = [
  { name: "Feed", href: "/feed" },
  { name: "Explore", href: "/explore" },
  { name: "Lists", href: "/lists" },
  { name: "Artists", href: "/artists" },
  { name: "Biblioteca", href: "/library" },
  { name: "Perfil", href: "/profile/demo" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full h-20 px-8 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex-1" />

      <ul className="flex items-center gap-8 flex-1 justify-center">
        {NAV_LINKS.map((link) => {
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

        <Link
          href="/auth"
          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-primary/30 hover:border-primary transition-colors overflow-hidden"
        >
          <User className="w-4 h-4 text-on-surface-variant" />
        </Link>
      </div>
    </nav>
  );
}
