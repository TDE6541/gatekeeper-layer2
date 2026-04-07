export const GOOGLE_CONNECTION =
  process.env.AUTH0_GOOGLE_CONNECTION || "google-oauth2";

type FreeBusyResult = {
  kind: string;
  timeMin: string;
  timeMax: string;
  calendars: Record<
    string,
    { busy: Array<{ start: string; end: string }>; errors?: unknown[] }
  >;
};

export async function callGoogleCalendarFreeBusy(
  accessToken: string
): Promise<FreeBusyResult> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/freeBusy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: tomorrow.toISOString(),
        timeZone: "UTC",
        items: [{ id: "primary" }],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `google_api_error: Calendar FreeBusy returned ${res.status}: ${body}`
    );
  }

  return res.json();
}
