import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingButtons } from "@/components/FloatingButtons";

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
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("theme");
                  var dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var root = document.documentElement;
                  root.classList.toggle("dark", dark);
                  root.style.colorScheme = dark ? "dark" : "light";
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FloatingButtons />
      </body>
    </html>
  );
}
