import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Calendar, Video, BookOpen, Target, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-muted/50 to-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Aprende inglés de forma{" "}
                <span className="text-primary">personalizada</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Clases online one-to-one adaptadas a tus objetivos. Mejora tu fluidez,
                prepárate para entrevistas de trabajo o alcanza la certificación que necesitas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/registro">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                    Agenda tu clase gratuita
                  </Button>
                </Link>
                <Link href="/planes">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ver planes
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Sin compromiso. Tu primera clase es gratis.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">UF</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Foto del profesor</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Hola, soy Ulises Fairlie
                </h2>
                <p className="text-muted-foreground mb-4">
                  Soy profesor de inglés con más de 5 años de experiencia enseñando a
                  estudiantes de todos los niveles. Mi enfoque se centra en la comunicación
                  real y práctica.
                </p>
                <p className="text-muted-foreground mb-6">
                  He ayudado a cientos de alumnos a alcanzar sus metas: desde conseguir
                  trabajo en empresas internacionales hasta aprobar exámenes de certificación
                  como TOEFL e IELTS.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Alumnos</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">5+</div>
                    <div className="text-sm text-muted-foreground">Años de experiencia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Method Section */}
        <section id="method" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Mi metodología
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Un enfoque práctico y personalizado que te ayudará a hablar inglés
                con confianza desde la primera clase.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Objetivos claros</h3>
                  <p className="text-sm text-muted-foreground">
                    Definimos tus metas desde el inicio y creamos un plan personalizado
                    para alcanzarlas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Conversación real</h3>
                  <p className="text-sm text-muted-foreground">
                    El 80% de la clase es práctica oral. Aprenderás hablando, no solo
                    estudiando gramática.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Material adaptado</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenido relevante para ti: desde vocabulario de negocios hasta
                    preparación de entrevistas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comenzar es muy sencillo. En solo 3 pasos estarás listo para tu primera clase.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div className="text-sm font-medium text-accent mb-2">Paso 1</div>
                <h3 className="font-semibold mb-2">Crea tu cuenta</h3>
                <p className="text-sm text-muted-foreground">
                  Regístrate gratis y obtén acceso a tu primera clase sin costo.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
                <div className="text-sm font-medium text-accent mb-2">Paso 2</div>
                <h3 className="font-semibold mb-2">Agenda tu clase</h3>
                <p className="text-sm text-muted-foreground">
                  Elige el horario que mejor te acomode desde tu dashboard.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-accent" />
                </div>
                <div className="text-sm font-medium text-accent mb-2">Paso 3</div>
                <h3 className="font-semibold mb-2">Conéctate por Meet</h3>
                <p className="text-sm text-muted-foreground">
                  Recibirás un link de Google Meet para tu clase online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Tu primera clase es completamente gratis. Sin compromiso, sin tarjeta de crédito.
            </p>
            <Link href="/registro">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                Agenda tu clase gratuita
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
