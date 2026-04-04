import type { Metadata } from "next";
import { Instrument_Serif, Barlow } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: "italic",
  variable: "--font-heading",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Healix — Privacy-First Healthcare Platform",
  description:
    "A role-based healthcare platform where patients control document access, doctors use AI summaries, hospitals get only permitted records, and medicine authenticity is verified through blockchain-backed hashes.",
  keywords: [
    "healthcare",
    "medical records",
    "privacy",
    "role-based",
    "prescription",
    "medicine verification",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${instrumentSerif.variable} ${barlow.variable} font-body antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
