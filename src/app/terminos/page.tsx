import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Términos y Condiciones | Ulises Fairlie",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Términos y Condiciones</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Última actualización: 27 de febrero de 2026
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Servicio</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Ulises Fairlie ofrece clases online de inglés en modalidades individual, semi-privada y grupal.
                Cada clase tiene una duración de 60 minutos, salvo que se indique lo contrario.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Registro y cuenta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                El usuario es responsable de la veracidad de los datos entregados y del resguardo de sus
                credenciales de acceso.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pagos y planes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Los pagos se procesan mediante Mercado Pago. Los valores de los planes se informan en el sitio
                y pueden actualizarse en el tiempo sin afectar pagos ya aprobados.
              </p>
              <p>
                La activación de clases disponibles se realiza una vez confirmado el pago.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Reprogramación y cancelación</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Las clases pueden reprogramarse o cancelarse con al menos 24 horas de anticipación. En caso de
                inasistencia o aviso fuera de plazo, la clase puede considerarse utilizada.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Reembolsos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Los reembolsos se evalúan caso a caso. Cuando correspondan, se gestionan por el mismo medio de
                pago utilizado por el usuario y según los tiempos de la plataforma de pago.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Propiedad intelectual</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                El material compartido en clases y recursos digitales es para uso personal del estudiante y no
                puede ser distribuido o comercializado sin autorización.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Para consultas sobre estos términos, escribe a: contacto@ulisesfairlie.com
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
