import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Política de Privacidad | Ulises Fairlie",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Política de Privacidad</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Última actualización: 27 de febrero de 2026
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Datos que recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Podemos recopilar nombre, correo electrónico y datos relacionados con clases agendadas, pagos y
                uso de la plataforma para prestar correctamente el servicio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Uso de la información</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Los datos se utilizan para gestionar tu cuenta, coordinar clases, procesar pagos, responder
                consultas y mejorar la experiencia de aprendizaje.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pagos y terceros</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Los pagos son procesados por Mercado Pago. No almacenamos números completos de tarjetas en este
                sitio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Aplicamos medidas razonables para proteger la información personal. Sin embargo, ningún sistema
                es completamente infalible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Derechos del usuario</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Puedes solicitar acceso, rectificación o eliminación de tus datos personales escribiendo a
                contacto@ulisesfairlie.com.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cambios a esta política</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Esta política puede actualizarse. Publicaremos en esta página la fecha de la última modificación.
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
