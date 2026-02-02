import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Check } from "lucide-react";
import { plans, formatPrice } from "@/lib/data";

export default function PlanesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-muted/50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Planes de clases
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Elige el plan que mejor se adapte a tus objetivos y disponibilidad.
                Todos incluyen clases personalizadas one-to-one.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular
                      ? "border-primary shadow-lg scale-105"
                      : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Más popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.classesPerMonth} clases de 60 min
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/registro" className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-accent hover:bg-accent/90"
                        }`}
                      >
                        Elegir plan
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                ¿No estás seguro? Prueba primero con una clase gratuita.
              </p>
              <Link href="/registro">
                <Button variant="outline" size="lg">
                  Agenda tu clase gratuita
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Preguntas frecuentes
            </h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-2">
                  ¿Puedo cambiar de plan después?
                </h3>
                <p className="text-muted-foreground">
                  Sí, puedes cambiar tu plan en cualquier momento. El cambio se
                  aplicará en tu siguiente ciclo de facturación.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-2">
                  ¿Qué pasa si no puedo asistir a una clase?
                </h3>
                <p className="text-muted-foreground">
                  Puedes cancelar o reprogramar tu clase con al menos 24 horas de
                  anticipación sin perder el crédito.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-2">
                  ¿Las clases no usadas se acumulan?
                </h3>
                <p className="text-muted-foreground">
                  Las clases no utilizadas se pueden acumular hasta el mes siguiente.
                  Después de eso, expiran.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  ¿Cómo son las clases?
                </h3>
                <p className="text-muted-foreground">
                  Las clases son online a través de Google Meet. Duran 60 minutos y
                  están 100% enfocadas en tus necesidades específicas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
