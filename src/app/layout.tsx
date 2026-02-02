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
  title: "Ulises Fairlie | Clases de Inglés Personalizadas",
  description: "Aprende inglés con clases personalizadas online. Mejora tu fluidez, prepárate para entrevistas y alcanza tus metas con un profesor dedicado.",
  keywords: ["clases de inglés", "profesor de inglés", "inglés online", "clases particulares", "Ulises Fairlie"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
