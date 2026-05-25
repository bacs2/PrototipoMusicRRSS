import TopNav from "./TopNav";

type AppShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Feed", href: "/feed" },
  { label: "Biblioteca", href: "/library" },
  { label: "Perfil", href: "/profile/demo" },
];

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav />
      <main className="pt-24 px-6 md:px-12 lg:px-16 pb-24">
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-6 pb-safe bg-surface-container-low/80 backdrop-blur-2xl z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-all text-[10px] font-semibold"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};
