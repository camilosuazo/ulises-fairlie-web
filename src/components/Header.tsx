"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Ulises Fairlie</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
            Sobre mí
          </Link>
          <Link href="/#method" className="text-sm font-medium hover:text-primary transition-colors">
            Metodología
          </Link>
          <Link href="/planes" className="text-sm font-medium hover:text-primary transition-colors">
            Planes
          </Link>
          <Link href="/#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button size="sm" className="bg-accent hover:bg-accent/90">
              Clase gratuita
            </Button>
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto flex flex-col space-y-4 p-4">
            <Link
              href="/#about"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre mí
            </Link>
            <Link
              href="/#method"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Metodología
            </Link>
            <Link
              href="/planes"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Planes
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-accent hover:bg-accent/90">
                  Clase gratuita
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
