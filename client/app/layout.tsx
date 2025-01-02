import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/context";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RPSLS Arena",
  description: "Rock, Papper, Scissors, Spock, Lizard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body
        className={`min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 bg-no-repeat ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ContextProvider cookies={cookies}>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster duration={8000} position="bottom-left" />
        </ContextProvider>
      </body>
    </html>
  );
}
