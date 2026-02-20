"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar as CalendarIcon, Clock, Video, LogOut, CreditCard, User, Loader2, FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/data";
import type { Profile, ScheduledClass, Availability, BlockedDate, Plan } from "@/lib/supabase/types";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);
  const [isSyncingPayment, setIsSyncingPayment] = useState(false);
  const [hasSyncedReturnPayment, setHasSyncedReturnPayment] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
      }

      // Load user's scheduled classes
      const { data: classes } = await supabase
        .from('scheduled_classes')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true });

      if (classes) {
        setScheduledClasses(classes);
      }

      // Load availability
      const { data: avail } = await supabase
        .from('availability')
        .select('*')
        .eq('is_available', true);

      if (avail) {
        setAvailability(avail);
      }

      // Load blocked dates
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('*');

      if (blocked) {
        setBlockedDates(blocked);
      }

      // Load active plans for checkout
      const { data: activePlans } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (activePlans) {
        setPlans(activePlans);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    const paymentId = searchParams.get("payment_id");

    if (!paymentStatus) return;

    if (paymentStatus === "approved") {
      setPaymentStatusMessage("Pago aprobado. Estamos actualizando tus clases disponibles...");
    } else if (paymentStatus === "pending") {
      setPaymentStatusMessage("Tu pago está pendiente de confirmación. Te avisaremos cuando se acredite.");
    } else {
      setPaymentStatusMessage("No se completó el pago. Puedes intentarlo nuevamente cuando quieras.");
    }

    if (paymentStatus === "approved" && paymentId && !hasSyncedReturnPayment) {
      const syncPayment = async () => {
        try {
          setIsSyncingPayment(true);
          const response = await fetch("/api/payments/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId }),
          });

          if (!response.ok) {
            throw new Error("Sync failed");
          }

          await loadData();
          setPaymentStatusMessage("Pago confirmado. Tus clases ya están disponibles.");
        } catch (error) {
          console.error("Payment sync error:", error);
          setPaymentStatusMessage(
            "Pago aprobado. Si no ves tus clases aún, recarga en unos segundos."
          );
        } finally {
          setIsSyncingPayment(false);
          setHasSyncedReturnPayment(true);
        }
      };

      void syncPayment();
    }
  }, [hasSyncedReturnPayment, loadData, searchParams]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleBookClass = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    setIsBooking(true);

    try {
      // Generate a simple meet link (in production, use Google Calendar API)
      const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

      // Create scheduled class
      const { error: classError } = await supabase
        .from('scheduled_classes')
        .insert({
          user_id: user.id,
          scheduled_date: selectedDate.toISOString().split('T')[0],
          scheduled_time: selectedTime,
          meet_link: meetLink,
          status: 'scheduled'
        });

      if (classError) throw classError;

      // Update user's classes remaining
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          classes_remaining: user.classes_remaining - 1,
          free_class_used: user.classes_remaining === 1 && !user.current_plan
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Reload data
      await loadData();

      setIsBookingDialogOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(null);
    } catch (error) {
      console.error('Error booking class:', error);
      alert('Error al agendar la clase. Intenta de nuevo.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCheckout = async (planId: string) => {
    try {
      setCheckoutPlanId(planId);
      const response = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("No se pudo iniciar el pago. Intenta nuevamente.");
    } finally {
      setCheckoutPlanId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return availability
      .filter(a => a.day_of_week === dayOfWeek)
      .map(a => a.time_slot)
      .sort();
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(b => b.blocked_date === dateStr);
  };

  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true;
    if (date.getDay() === 0) return true; // Sunday
    if (isDateBlocked(date)) return true;
    const dayOfWeek = date.getDay();
    const hasAvailability = availability.some(a => a.day_of_week === dayOfWeek);
    return !hasAvailability;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header del Dashboard */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Ulises Fairlie</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Hola, {user?.full_name?.split(" ")[0] || 'Usuario'}
          </h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de clases de inglés
          </p>
        </div>

        {paymentStatusMessage && (
          <div className="mb-6">
            <Alert>
              <AlertTitle>Estado de pago</AlertTitle>
              <AlertDescription>
                {paymentStatusMessage}
                {isSyncingPayment ? " Validando con Mercado Pago..." : ""}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Clases disponibles
                      </p>
                      <p className="text-2xl font-bold">{user?.classes_remaining || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <User className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plan actual</p>
                      <p className="text-2xl font-bold">
                        {user?.current_plan || "Clase gratuita"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Book Class Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Agendar clase
                </CardTitle>
                <CardDescription>
                  Selecciona una fecha y hora para tu próxima clase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(user?.classes_remaining || 0) > 0 ? (
                  <Dialog
                    open={isBookingDialogOpen}
                    onOpenChange={setIsBookingDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90">
                        Agendar nueva clase
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Selecciona fecha y hora</DialogTitle>
                        <DialogDescription>
                          Elige el mejor momento para tu clase
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Fecha</h4>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              setSelectedTime(null);
                            }}
                            disabled={isDateDisabled}
                            className="rounded-md border mx-auto"
                          />
                        </div>
                        {selectedDate && (
                          <div>
                            <h4 className="text-sm font-medium mb-3">
                              Horarios disponibles para {formatDate(selectedDate)}
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {getAvailableTimesForDate(selectedDate).map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className={selectedTime === time ? "bg-primary" : ""}
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                            {getAvailableTimesForDate(selectedDate).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No hay horarios disponibles para este día
                              </p>
                            )}
                          </div>
                        )}
                        {selectedDate && selectedTime && (
                          <Button
                            className="w-full bg-accent hover:bg-accent/90"
                            onClick={handleBookClass}
                            disabled={isBooking}
                          >
                            {isBooking ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Agendando...
                              </>
                            ) : (
                              "Confirmar clase"
                            )}
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center">
                      Ya usaste tu clase disponible. Elige un plan y paga con Mercado Pago para continuar.
                    </p>
                    {plans.length > 0 ? (
                      <div className="grid md:grid-cols-3 gap-3">
                        {plans.map((plan) => (
                          <div key={plan.id} className="border rounded-lg p-4 bg-muted/20">
                            <p className="font-semibold">{plan.name}</p>
                            <p className="text-2xl font-bold mt-1">
                              {formatPrice(plan.price, plan.currency)}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {plan.classes_per_month} clases / mes
                            </p>
                            <Button
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => handleCheckout(plan.id)}
                              disabled={checkoutPlanId !== null}
                            >
                              {checkoutPlanId === plan.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Redirigiendo...
                                </>
                              ) : (
                                "Pagar con Mercado Pago"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                          No pudimos cargar los planes en este momento.
                        </p>
                        <Link href="/planes">
                          <Button variant="outline">Ver planes</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Próximas clases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledClasses.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Video className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatDate(classItem.scheduled_date)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {classItem.scheduled_time} hrs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-accent/10 text-accent"
                          >
                            Agendada
                          </Badge>
                          {classItem.meet_link && (
                            <a
                              href={classItem.meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                Ir a Meet
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No tienes clases agendadas
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Card */}
            {!user?.current_plan && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">Continúa aprendiendo</CardTitle>
                  <CardDescription>
                    Después de tu clase gratuita, elige un plan para seguir
                    mejorando tu inglés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/planes">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Ver planes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Resources Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  Recursos
                </CardTitle>
                <CardDescription>
                  Material de apoyo para complementar tus clases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/recursos">
                  <Button variant="outline" className="w-full">
                    Ver materiales
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información útil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Duración de clase</p>
                  <p className="text-sm text-muted-foreground">60 minutos</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Plataforma</p>
                  <p className="text-sm text-muted-foreground">Google Meet</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Cancelación</p>
                  <p className="text-sm text-muted-foreground">
                    Hasta 24 horas antes sin penalización
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Contacto</p>
                  <p className="text-sm text-muted-foreground">
                    contacto@ulisesfairlie.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
