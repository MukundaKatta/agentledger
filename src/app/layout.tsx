import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "agentledger — agent observability on the zero stack",
  description:
    "Every agent run, tool call, token and dollar — stored in Amazon DynamoDB, served on Vercel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link className="brand" href="/">
            agent<span>ledger</span>
          </Link>
          <span className="tag">Vercel × DynamoDB · zero-ops agent observability</span>
        </header>
        <main className="container">{children}</main>
        <footer className="foot">
          Built for H0 · backed by Amazon DynamoDB · deployed on Vercel
        </footer>
      </body>
    </html>
  );
}
