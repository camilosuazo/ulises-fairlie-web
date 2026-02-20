import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleMeetEvent } from "@/lib/integrations/google-calendar";

interface BookClassBody {
  date?: string;
  time?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookClassBody;
    const date = body.date?.trim();
    const time = body.time?.trim();

    if (!date || !time) {
      return NextResponse.json(
        { error: "Missing date or time." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, classes_remaining, current_plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "No se encontró el perfil del alumno." },
        { status: 404 }
      );
    }

    if (profile.classes_remaining <= 0) {
      return NextResponse.json(
        { error: "No tienes clases disponibles para agendar." },
        { status: 400 }
      );
    }

    const { meetLink } = await createGoogleMeetEvent({
      date,
      time,
      studentEmail: profile.email,
      studentName: profile.full_name,
    });

    const { error: classError } = await supabase.from("scheduled_classes").insert({
      user_id: profile.id,
      scheduled_date: date,
      scheduled_time: time,
      meet_link: meetLink,
      status: "scheduled",
    });

    if (classError) {
      throw classError;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        classes_remaining: profile.classes_remaining - 1,
        free_class_used: profile.classes_remaining === 1 && !profile.current_plan,
      })
      .eq("id", profile.id);

    if (updateProfileError) {
      throw updateProfileError;
    }

    return NextResponse.json({ ok: true, meetLink });
  } catch (error) {
    console.error("Book class error:", error);
    return NextResponse.json(
      { error: "No se pudo agendar la clase con Google Meet." },
      { status: 500 }
    );
  }
}
