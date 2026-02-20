interface CreateMeetEventInput {
  date: string;
  time: string;
  studentEmail: string;
  studentName?: string | null;
}

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleCreateEventResponse {
  id: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return value;
}

function buildEventDateTime(date: string, time: string, timezone: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    start: {
      dateTime: start.toISOString(),
      timeZone: timezone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: timezone,
    },
  };
}

async function getGoogleAccessToken() {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = getEnv("GOOGLE_REFRESH_TOKEN");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token request failed: ${body}`);
  }

  const data = (await response.json()) as GoogleTokenResponse;
  return data.access_token;
}

export async function createGoogleMeetEvent(input: CreateMeetEventInput) {
  const accessToken = await getGoogleAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const timezone = process.env.GOOGLE_CALENDAR_TIMEZONE || "America/Santiago";
  const teacherEmail = process.env.GOOGLE_MEET_OWNER_EMAIL;

  const { start, end } = buildEventDateTime(input.date, input.time, timezone);
  const requestId = `meet-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const attendees = [{ email: input.studentEmail }];
  if (teacherEmail && teacherEmail !== input.studentEmail) {
    attendees.push({ email: teacherEmail });
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `Clase de inglés - ${input.studentName || input.studentEmail}`,
        description: "Clase personalizada de 60 minutos.",
        start,
        end,
        attendees,
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google event creation failed: ${body}`);
  }

  const event = (await response.json()) as GoogleCreateEventResponse;
  const meetLink =
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;

  if (!meetLink) {
    throw new Error("Google event created without meet link.");
  }

  return {
    eventId: event.id,
    meetLink,
  };
}
