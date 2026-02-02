"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Download,
  BookOpen,
  Headphones,
  Video,
  Link as LinkIcon,
  ArrowLeft,
  Loader2,
  FolderOpen
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "audio" | "video" | "link";
  category: string;
  url: string;
  level?: string;
}

// Recursos de ejemplo - estos se pueden mover a la base de datos después
const SAMPLE_RESOURCES: Resource[] = [
  {
    id: "1",
    title: "Vocabulario de Negocios - Nivel Básico",
    description: "Lista de 100 palabras esenciales para el mundo empresarial con pronunciación y ejemplos.",
    type: "pdf",
    category: "Vocabulario",
    url: "#",
    level: "Básico"
  },
  {
    id: "2",
    title: "Guía de Tiempos Verbales",
    description: "Resumen completo de todos los tiempos verbales en inglés con ejemplos prácticos.",
    type: "pdf",
    category: "Gramática",
    url: "#",
    level: "Intermedio"
  },
  {
    id: "3",
    title: "Frases para Entrevistas de Trabajo",
    description: "Las 50 preguntas más comunes en entrevistas y cómo responderlas en inglés.",
    type: "pdf",
    category: "Entrevistas",
    url: "#",
    level: "Intermedio"
  },
  {
    id: "4",
    title: "Podcast: Conversaciones Cotidianas",
    description: "Audio de 15 minutos con diálogos naturales para mejorar tu comprensión auditiva.",
    type: "audio",
    category: "Listening",
    url: "#",
    level: "Básico"
  },
  {
    id: "5",
    title: "Phrasal Verbs más Usados",
    description: "Los 50 phrasal verbs que necesitas saber con ejemplos y ejercicios.",
    type: "pdf",
    category: "Vocabulario",
    url: "#",
    level: "Intermedio"
  },
  {
    id: "6",
    title: "Recursos Online Recomendados",
    description: "Lista curada de las mejores páginas, apps y canales de YouTube para practicar inglés.",
    type: "link",
    category: "Recursos Externos",
    url: "#",
    level: "Todos"
  },
];

const CATEGORIES = ["Todos", "Vocabulario", "Gramática", "Entrevistas", "Listening", "Recursos Externos"];

export default function RecursosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase.auth]);

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "audio":
        return <Headphones className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "link":
        return <LinkIcon className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case "Básico":
        return "bg-green-100 text-green-800";
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredResources = selectedCategory === "Todos"
    ? SAMPLE_RESOURCES
    : SAMPLE_RESOURCES.filter(r => r.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Recursos y Materiales</h1>
            </div>
            <p className="text-muted-foreground">
              Material de apoyo para complementar tus clases. Descarga PDFs, escucha audios y accede a recursos externos.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay recursos en esta categoría todavía.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getIcon(resource.type)}
                      </div>
                      {resource.level && (
                        <Badge variant="secondary" className={getLevelColor(resource.level)}>
                          {resource.level}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{resource.category}</Badge>
                      <Button size="sm" variant="outline" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        {resource.type === "link" ? "Abrir" : "Descargar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">¿Necesitas material específico?</h3>
                  <p className="text-sm text-muted-foreground">
                    Si necesitas recursos sobre un tema en particular, házmelo saber en nuestra próxima clase
                    o escríbeme por WhatsApp. Puedo preparar material personalizado según tus necesidades.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
