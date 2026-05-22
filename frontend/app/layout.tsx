import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobLens.online — AI Job Matching for Fresh Graduates",
  description: "Find jobs that match your skills — not just keywords. AI-powered job matching for fresh graduates.",
  icons: { icon: "/logo/logoicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen">
        {children}
      </body>
    </html>
  );
}
