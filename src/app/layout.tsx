import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Invitorg",
  description: "Küçük etkinlikler için davet, ödeme ve girişi tek yerde çöz.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={cn(geistSans.variable, geistMono.variable, "h-full antialiased")}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
