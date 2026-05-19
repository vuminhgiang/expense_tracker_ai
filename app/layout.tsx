import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ExpensesProvider } from "./providers";
import AppShell from "./AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpendWise — Expense Tracker",
  description: "Track your personal expenses with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ExpensesProvider>
          <AppShell>{children}</AppShell>
        </ExpensesProvider>
      </body>
    </html>
  );
}
