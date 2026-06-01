import TopNav from "./TopNav";
import MobileNav from "./MobileNav";

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav />
      <main className="pt-24 px-6 md:px-12 lg:px-16 pb-24">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};
