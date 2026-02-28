import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Ulises Fairlie</h3>
            <p className="text-sm text-muted-foreground">
              Clases de inglés personalizadas para alcanzar tus metas profesionales y personales.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary">
                Sobre mí
              </Link>
              <Link href="/#method" className="text-sm text-muted-foreground hover:text-primary">
                Metodología
              </Link>
              <Link href="/planes" className="text-sm text-muted-foreground hover:text-primary">
                Planes
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <p>contacto@ulisesfairlie.com</p>
              <p>Santiago, Chile</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6">
          <div className="text-center text-sm text-muted-foreground mb-4">
            <span className="font-medium text-foreground/80 mr-2">Legal:</span>
            <Link href="/terminos" className="hover:text-primary underline-offset-4 hover:underline">
              Términos y condiciones
            </Link>
            <span className="mx-2">·</span>
            <Link href="/privacidad" className="hover:text-primary underline-offset-4 hover:underline">
              Política de privacidad
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ulises Fairlie. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
