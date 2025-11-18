import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghostagotchi - Your AI Ghost Pet",
  description: "Adopt your own AI-powered ghost pet. Feed it, play with it, chat with it, and watch it level up on the leaderboard!",
  keywords: ["ghost pet", "AI", "tamagotchi", "game", "halloween"],
  authors: [{ name: "Ghostagotchi Team" }],
  openGraph: {
    title: "Ghostagotchi - Your AI Ghost Pet",
    description: "Adopt your own AI-powered ghost pet. Feed it, play with it, chat with it, and watch it level up!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f0f1e" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
