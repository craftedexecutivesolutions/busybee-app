import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BusyBee - Civil Service Commission",
  description: "Professional AI-powered meeting recording and transcription system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased paradise-bg">
        {children}
      </body>
    </html>
  );
}