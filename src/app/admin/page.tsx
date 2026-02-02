"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Users,
  Video,
  LogOut,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  Ban,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ScheduledClass, Availability, BlockedDate } from "@/lib/supabase/types";

const DAYS = [
  { id: 0, name: "Domingo", short: "Dom" },
  { id: 1, name: "Lunes", short: "Lun" },
  { id: 2, name: "Martes", short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves", short: "Jue" },
  { id: 5, name: "Viernes", short: "Vie" },
  { id: 6, name: "Sábado", short: "Sáb" },
];

const ALL_TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

interface ScheduledClassWithProfile extends ScheduledClass {
  profiles: Profile;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClassWithProfile[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [classToCancel, setClassToCancel] = useState<string | null>(null);
  const [dateToBlock, setDateToBlock] = useState<Date | undefined>(undefined);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    classesThisMonth: 0,
    revenue: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all scheduled classes with user profiles
      const { data: classes } = await supabase
        .from('scheduled_classes')
        .select('*, profiles(*)')
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true });

      if (classes) {
        setScheduledClasses(classes as ScheduledClassWithProfile[]);
      }

      // Load availability
      const { data: avail } = await supabase
        .from('availability')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (avail) {
        setAvailability(avail);
      }

      // Load blocked dates
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });

      if (blocked) {
        setBlockedDates(blocked);
      }

      // Load students
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (profiles) {
        setStudents(profiles);
        setStats(prev => ({
          ...prev,
          totalStudents: profiles.length,
          activeStudents: profiles.filter(p => p.current_plan || p.classes_remaining > 0).length,
        }));
      }

      // Calculate classes this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { count: classesCount } = await supabase
        .from('scheduled_classes')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth);

      if (classesCount !== null) {
        setStats(prev => ({ ...prev, classesThisMonth: classesCount }));
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CL", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const classesForSelectedDate = scheduledClasses.filter((c) => {
    if (!selectedDate) return false;
    const classDate = new Date(c.scheduled_date + 'T00:00:00');
    return classDate.toDateString() === selectedDate.toDateString();
  });

  const toggleTimeSlot = async (dayId: number, time: string) => {
    const existing = availability.find(a => a.day_of_week === dayId && a.time_slot === time);

    try {
      if (existing) {
        // Toggle availability
        await supabase
          .from('availability')
          .update({ is_available: !existing.is_available })
          .eq('id', existing.id);
      } else {
        // Create new
        await supabase
          .from('availability')
          .insert({ day_of_week: dayId, time_slot: time, is_available: true });
      }
      await loadData();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const isTimeSlotActive = (dayId: number, time: string) => {
    const slot = availability.find(a => a.day_of_week === dayId && a.time_slot === time);
    return slot?.is_available ?? false;
  };

  const cancelClass = async (classId: string) => {
    try {
      // Get class info first
      const classToDelete = scheduledClasses.find(c => c.id === classId);

      await supabase
        .from('scheduled_classes')
        .update({ status: 'cancelled' })
        .eq('id', classId);

      // Return class credit to user
      if (classToDelete) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('classes_remaining')
          .eq('id', classToDelete.user_id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ classes_remaining: profile.classes_remaining + 1 })
            .eq('id', classToDelete.user_id);
        }
      }

      await loadData();
      setClassToCancel(null);
    } catch (error) {
      console.error('Error cancelling class:', error);
    }
  };

  const blockDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      await supabase
        .from('blocked_dates')
        .insert({ blocked_date: dateStr });
      await loadData();
      setDateToBlock(undefined);
    } catch (error) {
      console.error('Error blocking date:', error);
    }
  };

  const unblockDate = async (id: string) => {
    try {
      await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);
      await loadData();
    } catch (error) {
      console.error('Error unblocking date:', error);
    }
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(b => b.blocked_date === dateStr);
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Ulises Fairlie</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona tus clases, alumnos y disponibilidad
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total alumnos</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alumnos activos</p>
                  <p className="text-2xl font-bold">{stats.activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clases este mes</p>
                  <p className="text-2xl font-bold">{stats.classesThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos mes</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="students">Alumnos</TabsTrigger>
          </TabsList>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      blocked: blockedDates.map(b => new Date(b.blocked_date + 'T00:00:00')),
                    }}
                    modifiersStyles={{
                      blocked: { backgroundColor: "#FEE2E2", color: "#DC2626" }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Classes for selected date */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {selectedDate ? formatDate(selectedDate) : "Selecciona una fecha"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDate && isDateBlocked(selectedDate) ? (
                      <span className="text-red-500">Este día está bloqueado</span>
                    ) : (
                      `${classesForSelectedDate.length} clase(s) agendada(s)`
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {classesForSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                      {classesForSelectedDate.map((classItem) => (
                        <div
                          key={classItem.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <Video className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{classItem.profiles?.full_name || 'Usuario'}</p>
                              <p className="text-sm text-muted-foreground">
                                {classItem.scheduled_time} hrs - {classItem.profiles?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {classItem.meet_link && (
                              <a
                                href={classItem.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" className="bg-primary hover:bg-primary/90">
                                  Iniciar Meet
                                </Button>
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setClassToCancel(classItem.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay clases agendadas para este día
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All upcoming classes */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Todas las clases próximas</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledClasses.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Video className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{classItem.profiles?.full_name || 'Usuario'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(classItem.scheduled_date)} - {classItem.scheduled_time} hrs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            Confirmada
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setClassToCancel(classItem.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay clases agendadas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Horarios semanales
                  </CardTitle>
                  <CardDescription>
                    Define tus horarios disponibles para cada día
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {DAYS.map((day) => (
                      <div key={day.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{day.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {availability.filter(a => a.day_of_week === day.id && a.is_available).length} horarios
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ALL_TIMES.map((time) => {
                            const isActive = isTimeSlotActive(day.id, time);
                            return (
                              <Button
                                key={`${day.id}-${time}`}
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                className={`text-xs ${isActive ? "bg-primary" : "opacity-50"}`}
                                onClick={() => toggleTimeSlot(day.id, time)}
                              >
                                {time}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Block Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ban className="w-5 h-5" />
                    Bloquear fechas
                  </CardTitle>
                  <CardDescription>
                    Bloquea días específicos (vacaciones, feriados, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Selecciona fecha a bloquear:</p>
                      <Calendar
                        mode="single"
                        selected={dateToBlock}
                        onSelect={setDateToBlock}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                      {dateToBlock && (
                        <Button
                          className="w-full mt-4 bg-red-500 hover:bg-red-600"
                          onClick={() => blockDate(dateToBlock)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Bloquear {formatShortDate(dateToBlock)}
                        </Button>
                      )}
                    </div>

                    {blockedDates.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Fechas bloqueadas:</p>
                        <div className="space-y-2">
                          {blockedDates.map((blocked) => (
                            <div
                              key={blocked.id}
                              className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                            >
                              <span className="text-sm">{formatDate(blocked.blocked_date)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-100"
                                onClick={() => unblockDate(blocked.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">¿Cómo funciona?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los horarios que actives aquí serán los que los alumnos podrán seleccionar al agendar sus clases.
                      Las fechas bloqueadas no estarán disponibles para ningún alumno.
                      Los cambios se guardan automáticamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Alumnos
                </CardTitle>
                <CardDescription>
                  {students.length} alumnos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {student.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name || 'Sin nombre'}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant={student.current_plan ? "default" : "secondary"}>
                              {student.current_plan || "Clase gratuita"}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {student.classes_remaining} clases restantes
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay alumnos registrados
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cancel Class Dialog */}
      <Dialog open={!!classToCancel} onOpenChange={() => setClassToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar clase</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de cancelar esta clase? Se devolverá el crédito al alumno.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassToCancel(null)}>
              No, mantener
            </Button>
            <Button variant="destructive" onClick={() => classToCancel && cancelClass(classToCancel)}>
              Sí, cancelar clase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
