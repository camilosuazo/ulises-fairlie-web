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
  Loader2,
  FolderOpen,
  Plus,
  FileText,
  Link as LinkIcon,
  Headphones,
  UserPlus,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ScheduledClass, Availability, BlockedDate, Resource, StudentResource } from "@/lib/supabase/types";

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
  const [resources, setResources] = useState<Resource[]>([]);
  const [studentResources, setStudentResources] = useState<StudentResource[]>([]);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isAssigningResource, setIsAssigningResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedStudentsForResource, setSelectedStudentsForResource] = useState<string[]>([]);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "Vocabulario",
    level: "Todos",
    resource_type: "pdf",
    url: ""
  });
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

      // Load resources
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (resourcesData) {
        setResources(resourcesData);
      }

      // Load student resources assignments
      const { data: studentResourcesData } = await supabase
        .from('student_resources')
        .select('*, resources(*), profiles(*)');

      if (studentResourcesData) {
        setStudentResources(studentResourcesData);
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

  const addResource = async () => {
    if (!newResource.title || !newResource.url) return;

    try {
      await supabase
        .from('resources')
        .insert({
          title: newResource.title,
          description: newResource.description || null,
          category: newResource.category,
          level: newResource.level,
          resource_type: newResource.resource_type,
          url: newResource.url
        });

      setNewResource({
        title: "",
        description: "",
        category: "Vocabulario",
        level: "Todos",
        resource_type: "pdf",
        url: ""
      });
      setIsAddingResource(false);
      await loadData();
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);
      await loadData();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const assignResourceToStudents = async () => {
    if (!selectedResource || selectedStudentsForResource.length === 0) return;

    try {
      const assignments = selectedStudentsForResource.map(studentId => ({
        student_id: studentId,
        resource_id: selectedResource.id
      }));

      await supabase
        .from('student_resources')
        .upsert(assignments, { onConflict: 'student_id,resource_id' });

      setIsAssigningResource(false);
      setSelectedResource(null);
      setSelectedStudentsForResource([]);
      await loadData();
    } catch (error) {
      console.error('Error assigning resource:', error);
    }
  };

  const removeResourceFromStudent = async (studentResourceId: string) => {
    try {
      await supabase
        .from('student_resources')
        .delete()
        .eq('id', studentResourceId);
      await loadData();
    } catch (error) {
      console.error('Error removing resource:', error);
    }
  };

  const getStudentsWithResource = (resourceId: string) => {
    return studentResources.filter(sr => sr.resource_id === resourceId);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "audio":
        return <Headphones className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "link":
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Ulises Fairlie</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
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
            <TabsTrigger value="resources">Recursos</TabsTrigger>
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
                          <Link href={`/admin/alumnos/${student.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver perfil
                            </Button>
                          </Link>
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

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="space-y-6">
              {/* Add Resource Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Gestionar Recursos</h2>
                  <p className="text-sm text-muted-foreground">
                    Agrega materiales y asígnalos a tus alumnos
                  </p>
                </div>
                <Button onClick={() => setIsAddingResource(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar recurso
                </Button>
              </div>

              {/* Resources List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Mis Recursos ({resources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resources.length > 0 ? (
                    <div className="space-y-4">
                      {resources.map((resource) => {
                        const assignedStudents = getStudentsWithResource(resource.id);
                        return (
                          <div
                            key={resource.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                  {getResourceIcon(resource.resource_type)}
                                </div>
                                <div>
                                  <h3 className="font-medium">{resource.title}</h3>
                                  {resource.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {resource.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{resource.category}</Badge>
                                    {resource.level && (
                                      <Badge variant="secondary">{resource.level}</Badge>
                                    )}
                                  </div>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-2 block"
                                  >
                                    Ver enlace
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedResource(resource);
                                    setIsAssigningResource(true);
                                  }}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Asignar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => deleteResource(resource.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Assigned Students */}
                            {assignedStudents.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-medium mb-2">
                                  Asignado a {assignedStudents.length} alumno(s):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {assignedStudents.map((sr) => (
                                    <Badge
                                      key={sr.id}
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      {sr.profiles?.full_name || sr.profiles?.email}
                                      <button
                                        onClick={() => removeResourceFromStudent(sr.id)}
                                        className="ml-1 hover:text-red-500"
                                      >
                                        <XCircle className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No hay recursos todavía
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsAddingResource(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar primer recurso
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <LinkIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">¿Cómo subir recursos?</p>
                      <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                        <li>Sube tu archivo (PDF, audio, etc.) a Google Drive</li>
                        <li>Clic derecho → "Compartir" → "Cualquier persona con el enlace"</li>
                        <li>Copia el enlace y pégalo aquí al crear el recurso</li>
                        <li>Asigna el recurso a los alumnos que quieras</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

      {/* Add Resource Dialog */}
      <Dialog open={isAddingResource} onOpenChange={setIsAddingResource}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar nuevo recurso</DialogTitle>
            <DialogDescription>
              Agrega un material de estudio para tus alumnos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Vocabulario de Negocios"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción del material..."
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={newResource.category}
                  onValueChange={(value) => setNewResource({ ...newResource, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vocabulario">Vocabulario</SelectItem>
                    <SelectItem value="Gramática">Gramática</SelectItem>
                    <SelectItem value="Entrevistas">Entrevistas</SelectItem>
                    <SelectItem value="Listening">Listening</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Speaking">Speaking</SelectItem>
                    <SelectItem value="Recursos Externos">Recursos Externos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nivel</Label>
                <Select
                  value={newResource.level}
                  onValueChange={(value) => setNewResource({ ...newResource, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos los niveles</SelectItem>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de recurso</Label>
              <Select
                value={newResource.resource_type}
                onValueChange={(value) => setNewResource({ ...newResource, resource_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF / Documento</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Enlace externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Enlace de Google Drive *</Label>
              <Input
                id="url"
                placeholder="https://drive.google.com/..."
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingResource(false)}>
              Cancelar
            </Button>
            <Button
              onClick={addResource}
              disabled={!newResource.title || !newResource.url}
            >
              Agregar recurso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Resource Dialog */}
      <Dialog open={isAssigningResource} onOpenChange={setIsAssigningResource}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar recurso a alumnos</DialogTitle>
            <DialogDescription>
              {selectedResource?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-4">Selecciona los alumnos:</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {students.map((student) => {
                const isAssigned = studentResources.some(
                  sr => sr.student_id === student.id && sr.resource_id === selectedResource?.id
                );
                return (
                  <div
                    key={student.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={student.id}
                      checked={selectedStudentsForResource.includes(student.id) || isAssigned}
                      disabled={isAssigned}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudentsForResource([...selectedStudentsForResource, student.id]);
                        } else {
                          setSelectedStudentsForResource(
                            selectedStudentsForResource.filter(id => id !== student.id)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={student.id}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      <span className="font-medium">{student.full_name || 'Sin nombre'}</span>
                      <span className="text-muted-foreground ml-2">{student.email}</span>
                      {isAssigned && (
                        <Badge variant="secondary" className="ml-2 text-xs">Ya asignado</Badge>
                      )}
                    </label>
                  </div>
                );
              })}
              {students.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay alumnos registrados
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssigningResource(false);
                setSelectedResource(null);
                setSelectedStudentsForResource([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={assignResourceToStudents}
              disabled={selectedStudentsForResource.length === 0}
            >
              Asignar a {selectedStudentsForResource.length} alumno(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
