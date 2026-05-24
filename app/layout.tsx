import React from "react";
import "../styles/globals.css";
import { ThemeProvider } from "@/lib/theme-provider";

export const metadata = {
  title: "RateRecord",
  description: "Music social MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
