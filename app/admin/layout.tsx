import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import { AppShell } from "../../components/AppShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/auth");
  if (!user.is_admin) redirect("/feed");

  return <AppShell>{children}</AppShell>;
}
