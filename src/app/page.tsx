import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PaymentMethodsCard } from "@/components/PaymentMethodsCard";
import { CheckCircle, HelpCircle, Target } from "lucide-react";

const methodologyPoints = [
  "Enfoque comunicativo",
  "Clases personalizadas según tus objetivos",
  "Inglés general y profesional",
  "Corrección clara y feedback constante",
  "Material adaptado a tu nivel y necesidades",
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-muted/50 to-white py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Inglés con <span className="text-primary">fluidez, precisión y confianza</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Profesor de inglés certificado por Cambridge (CELTA) y traductor profesional
                con más de 5 años de experiencia. Clases online personalizadas para inglés
                general, académico y profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/registro">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                    Reservar clase
                  </Button>
                </Link>
                <Link href="/planes">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ver planes y valores
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl border bg-muted">
                <Image
                  src="/ulises-fairlie.png"
                  alt="Ulises Fairlie, profesor de inglés"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Presentación</h2>
                <p className="text-primary font-semibold mb-3">Ulises Fairlie</p>
                <p className="text-muted-foreground mb-4">
                  Profesor de inglés certificado por Cambridge (CELTA) y traductor profesional
                  con más de 5 años de experiencia.
                </p>
                <p className="text-muted-foreground mb-4">
                  Ayudo a estudiantes y profesionales a desarrollar fluidez, precisión y
                  confianza en inglés general y profesional.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="method" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Metodología</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Mi enfoque está basado en la metodología comunicativa aprendida en la
                certificación CELTA de Cambridge, centrada en el uso real del idioma desde la
                primera clase.
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-start">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Las clases son 100% personalizadas según tus objetivos: inglés general,
                    preparación académica o inglés profesional para el trabajo.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Trabajo el desarrollo equilibrado de speaking, listening, reading y writing,
                    con especial énfasis en la comunicación efectiva, la corrección precisa y la
                    confianza al expresarte en situaciones reales.
                  </p>
                  <p className="text-muted-foreground">
                    Mi objetivo es que no solo estudies inglés, sino que realmente lo uses con
                    seguridad en contextos reales.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">En cada plan incluye</h3>
                  </div>
                  <ul className="space-y-3">
                    {methodologyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="max-w-5xl mx-auto mt-8">
              <PaymentMethodsCard />
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas frecuentes</h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    ¿Cómo son las clases?
                  </AccordionTrigger>
                  <AccordionContent>
                    Las clases son online, duran 60 minutos y se enfocan en comunicación real,
                    corrección precisa y aplicación práctica desde la primera sesión.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    ¿Qué modalidades están disponibles?
                  </AccordionTrigger>
                  <AccordionContent>
                    Hay planes individual, semi-privado (2 personas), grupal (3 personas),
                    grupal (4 personas) y programa flexible individual de 1 vez por semana.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    ¿Qué incluyen todos los planes?
                  </AccordionTrigger>
                  <AccordionContent>
                    Metodología comunicativa, material digital personalizado, seguimiento,
                    feedback constante y enfoque en inglés general y profesional.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Reserva tu cupo</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Compromiso, constancia y resultados reales.
            </p>
            <Link href="/planes">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                Revisar planes
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
