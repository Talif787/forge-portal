import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "Forge Portal",
  description: "Internal developer platform control plane",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 overflow-x-hidden">
              <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
            </main>
          </div>
          <CommandPalette />
        </AppProviders>
      </body>
    </html>
  );
}
