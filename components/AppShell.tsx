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
      <aside className="hidden lg:flex fixed left-0 h-screen w-64 flex-col bg-background shadow-[20px_0_40px_rgba(0,0,0,0.4)] pt-24">
        <div className="px-8">
          <h2 className="font-headline text-xl font-black text-primary">
            The Curator
          </h2>
          <p className="label-md mt-1">Digital Vinyl Gallery</p>
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 px-8 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface hover:translate-x-1 transition-all"
            >
              <span className="text-[10px] uppercase tracking-widest">
                {item.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="mt-auto px-8 pb-8">
          <button className="w-full rounded-full bg-gradient-to-br from-primary to-primary-dim py-3 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform">
            Log Activity
          </button>
        </div>
      </aside>
      <main className="lg:ml-64 pt-24 px-6 md:px-12 lg:px-16 pb-24">
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
