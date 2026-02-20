"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  Payment,
  Profile,
  Resource,
  ScheduledClass,
  StudentResource,
  Subscription,
} from "@/lib/supabase/types";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileText,
  Loader2,
  User,
  Video,
} from "lucide-react";

interface StudentResourceWithResource extends StudentResource {
  resources?: Resource;
}

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const studentId = typeof params?.id === "string" ? params.id : "";

  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<Profile | null>(null);
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [resources, setResources] = useState<StudentResourceWithResource[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!studentId) return;

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push("/admin/login");
          return;
        }

        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authData.user.id)
          .single();

        if (!adminProfile?.is_admin) {
          router.push("/dashboard");
          return;
        }

        const [
          { data: studentData, error: studentError },
          { data: classesData, error: classesError },
          { data: resourcesData, error: resourcesError },
          { data: paymentsData, error: paymentsError },
          { data: subscriptionData, error: subscriptionError },
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", studentId).single(),
          supabase
            .from("scheduled_classes")
            .select("*")
            .eq("user_id", studentId)
            .order("scheduled_date", { ascending: false })
            .order("scheduled_time", { ascending: false }),
          supabase
            .from("student_resources")
            .select("*, resources(*)")
            .eq("student_id", studentId)
            .order("assigned_at", { ascending: false }),
          supabase
            .from("payments")
            .select("*")
            .eq("user_id", studentId)
            .order("created_at", { ascending: false }),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", studentId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (studentError) throw studentError;
        if (classesError) throw classesError;
        if (resourcesError) throw resourcesError;
        if (paymentsError) throw paymentsError;
        if (subscriptionError) throw subscriptionError;

        setStudent(studentData);
        setClasses(classesData ?? []);
        setResources((resourcesData as StudentResourceWithResource[]) ?? []);
        setPayments(paymentsData ?? []);
        setSubscription(subscriptionData ?? null);
      } catch (loadError) {
        console.error("Error loading student profile:", loadError);
        setError("No se pudo cargar el perfil del alumno.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudentProfile();
  }, [router, studentId, supabase]);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  const classStats = useMemo(() => {
    const scheduled = classes.filter((c) => c.status === "scheduled").length;
    const completed = classes.filter((c) => c.status === "completed").length;
    const cancelled = classes.filter((c) => c.status === "cancelled").length;
    return { scheduled, completed, cancelled, total: classes.length };
  }, [classes]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-muted/30">
        <main className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>{error ?? "Alumno no encontrado."}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/admin">
              <Button variant="outline">Volver al panel admin</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Perfil de alumno</h1>
            <p className="text-muted-foreground">
              Información, clases y recursos asignados
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al admin
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {student.full_name || "Sin nombre"}
              </CardTitle>
              <CardDescription>{student.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant={student.current_plan ? "default" : "secondary"}>
                  {student.current_plan || "Clase gratuita"}
                </Badge>
                <Badge variant="outline">{student.classes_remaining} clases disponibles</Badge>
                <Badge variant="outline">
                  {student.free_class_used ? "Clase gratuita usada" : "Clase gratuita pendiente"}
                </Badge>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clases totales</p>
                  <p className="text-xl font-semibold">{classStats.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próximas</p>
                  <p className="text-xl font-semibold">{classStats.scheduled}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-xl font-semibold">{classStats.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Canceladas</p>
                  <p className="text-xl font-semibold">{classStats.cancelled}</p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Registrado el {formatDate(student.created_at)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Suscripción actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-2">
                  <Badge>{subscription.status}</Badge>
                  <p className="text-sm text-muted-foreground">
                    Plan ID: {subscription.plan_id}
                  </p>
                  {subscription.current_period_start && (
                    <p className="text-sm text-muted-foreground">
                      Inicio: {formatDate(subscription.current_period_start)}
                    </p>
                  )}
                  {subscription.current_period_end && (
                    <p className="text-sm text-muted-foreground">
                      Fin: {formatDate(subscription.current_period_end)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este alumno no tiene suscripción registrada.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Historial de clases
              </CardTitle>
              <CardDescription>
                Clases agendadas, completadas y canceladas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length > 0 ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {classes.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {formatDate(item.scheduled_date)} - {item.scheduled_time} hrs
                        </p>
                        <Badge variant={item.status === "completed" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                      {item.meet_link && (
                        <a
                          href={item.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 inline-flex items-center"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Ver Meet
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no tiene clases registradas.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recursos asignados
              </CardTitle>
              <CardDescription>Materiales que el profesor ya le asignó</CardDescription>
            </CardHeader>
            <CardContent>
              {resources.length > 0 ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {resources.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.resources?.title || "Recurso sin título"}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.resources?.category || "Sin categoría"} ·{" "}
                        {item.resources?.resource_type || "material"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Asignado: {formatDate(item.assigned_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tiene recursos asignados aún.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pagos del alumno</CardTitle>
            <CardDescription>Últimos pagos y su estado</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <Badge
                        variant={payment.status === "approved" ? "default" : "secondary"}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Plan: {payment.plan_id || "N/A"} · {formatDate(payment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay pagos registrados.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
