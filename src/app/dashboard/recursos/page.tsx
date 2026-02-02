"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import type { Resource } from "@/lib/supabase/types";
import {
  FileText,
  Download,
  BookOpen,
  Headphones,
  Video,
  Link as LinkIcon,
  ArrowLeft,
  Loader2,
  FolderOpen,
  ExternalLink
} from "lucide-react";

interface StudentResourceWithResource {
  id: string;
  student_id: string;
  resource_id: string;
  assigned_at: string;
  resources: Resource;
}

export default function RecursosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    const loadResources = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Load resources assigned to this student
      const { data: studentResources } = await supabase
        .from('student_resources')
        .select('*, resources(*)')
        .eq('student_id', user.id);

      if (studentResources) {
        const assignedResources = studentResources
          .map((sr: StudentResourceWithResource) => sr.resources)
          .filter(Boolean);
        setResources(assignedResources);
      }

      setLoading(false);
    };

    loadResources();
  }, [router, supabase]);

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

  const getLevelColor = (level?: string | null) => {
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

  const categories = ["Todos", ...new Set(resources.map(r => r.category))];

  const filteredResources = selectedCategory === "Todos"
    ? resources
    : resources.filter(r => r.category === selectedCategory);

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
              <h1 className="text-3xl font-bold">Mis Recursos</h1>
            </div>
            <p className="text-muted-foreground">
              Material de apoyo asignado por tu profesor para complementar tus clases.
            </p>
          </div>

          {resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No tienes recursos asignados</h3>
                <p className="text-muted-foreground">
                  Tu profesor te asignará materiales a medida que avances en tus clases.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Category Filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {categories.map((category) => (
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
              )}

              {/* Resources Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getIcon(resource.resource_type)}
                        </div>
                        {resource.level && (
                          <Badge variant="secondary" className={getLevelColor(resource.level)}>
                            {resource.level}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-3">{resource.title}</CardTitle>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{resource.category}</Badge>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {resource.resource_type === "link" ? "Abrir" : "Descargar"}
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
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
