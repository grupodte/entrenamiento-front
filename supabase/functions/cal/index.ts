import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE") ??
  Deno.env.get("CAL_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  "";

const CAL_API_KEY = Deno.env.get("CAL_API_KEY") ?? "";
const CAL_API_BASE_URL = Deno.env.get("CAL_API_BASE_URL") ?? "https://api.cal.com";
const CAL_API_VERSION_BOOKINGS = Deno.env.get("CAL_API_VERSION_BOOKINGS") ?? "2024-08-13";
const CAL_API_VERSION_SLOTS = Deno.env.get("CAL_API_VERSION_SLOTS") ?? "2024-09-04";
const CAL_API_VERSION_EVENT_TYPES = Deno.env.get("CAL_API_VERSION_EVENT_TYPES") ?? "2024-06-14";
const CAL_WEBHOOK_SECRET = Deno.env.get("CAL_WEBHOOK_SECRET") ?? "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ error: message, details }, status);
}

async function readBody(req: Request) {
  const raw = await req.text();
  if (!raw) return { raw: "", json: null };
  try {
    return { raw, json: JSON.parse(raw) };
  } catch {
    return { raw, json: null };
  }
}

function requireEnv(name: string, value: string) {
  if (!value) throw new Error(`Missing env: ${name}`);
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>) {
  const url = new URL(path, CAL_API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url;
}

async function calFetch(
  path: string,
  opts: {
    method?: string;
    version: string;
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  },
) {
  requireEnv("CAL_API_KEY", CAL_API_KEY);

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${CAL_API_KEY}`,
      "Content-Type": "application/json",
      "cal-api-version": opts.version,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw Object.assign(new Error("Cal API error"), {
      status: res.status,
      payload: data ?? text,
    });
  }

  return data;
}

async function getUserFromRequest(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { user: null, email: null };
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader) return { user: null, email: null };

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data, error } = await client.auth.getUser();
    if (error) return { user: null, email: null };

    return { user: data.user, email: data.user?.email ?? null };
  } catch (error) {
    console.error("Failed to resolve user from request", error);
    return { user: null, email: null };
  }
}

async function isAdmin(userId: string | null) {
  if (!userId) return false;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: profileData, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profileError && profileData) {
    return profileData.role === "admin";
  }

  const { data: perfilesData, error: perfilesError } = await adminClient
    .from("perfiles")
    .select("rol")
    .eq("id", userId)
    .maybeSingle();

  if (perfilesError) return false;
  return perfilesData?.rol === "admin";
}

async function insertAppointment(payload: {
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  status?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  cal_booking_id?: string | null;
  payload: unknown;
}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await adminClient.from("appointments").insert(payload);
  if (error) {
    throw Object.assign(new Error("Failed to persist appointment"), {
      status: 500,
      payload: error,
    });
  }
}

async function updateAppointment(
  bookingIds: string[],
  fields: {
    status?: string | null;
    payload?: unknown;
    start_at?: string | null;
    end_at?: string | null;
    guest_name?: string | null;
    guest_email?: string | null;
  },
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  if (bookingIds.length === 0) return;

  const updatePayload: Record<string, unknown> = {};
  if (fields.status) updatePayload.status = fields.status;
  if (fields.payload) updatePayload.payload = fields.payload;
  if (fields.start_at !== undefined) updatePayload.start_at = fields.start_at;
  if (fields.end_at !== undefined) updatePayload.end_at = fields.end_at;
  if (fields.guest_name !== undefined) updatePayload.guest_name = fields.guest_name;
  if (fields.guest_email !== undefined) updatePayload.guest_email = fields.guest_email;

  if (Object.keys(updatePayload).length === 0) return;

  const { data } = await adminClient
    .from("appointments")
    .update(updatePayload)
    .in("cal_booking_id", bookingIds)
    .select("id");

  if (data && data.length > 0) return;

  await adminClient.from("appointments").insert({
    cal_booking_id: bookingIds[0],
    status: fields.status ?? "scheduled",
    payload: fields.payload ?? {},
    start_at: fields.start_at ?? null,
    end_at: fields.end_at ?? null,
    guest_name: fields.guest_name ?? null,
    guest_email: fields.guest_email ?? null,
  });
}

function extractBookingIds(payload: Record<string, unknown> | null | undefined) {
  const candidates = [
    payload?.bookingUid,
    payload?.uid,
    payload?.id,
    payload?.bookingId,
    (payload?.booking as Record<string, unknown> | undefined)?.uid,
    (payload?.booking as Record<string, unknown> | undefined)?.id,
  ];
  return Array.from(
    new Set(
      candidates
        .filter((value) => value !== undefined && value !== null && value !== "")
        .map((value) => String(value)),
    ),
  );
}

function normalizeStatus(value: unknown, event?: string) {
  if (typeof value === "string" && value.trim()) {
    return value.toLowerCase();
  }
  const upperEvent = (event ?? "").toUpperCase();
  if (upperEvent.includes("CANCEL")) return "cancelled";
  if (upperEvent.includes("RESCHEDULE")) return "rescheduled";
  if (upperEvent.includes("REJECT")) return "rejected";
  if (upperEvent.includes("CREATED") || upperEvent.includes("BOOKED")) return "scheduled";
  return null;
}

async function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!CAL_WEBHOOK_SECRET) return false;
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = encoder.encode(CAL_WEBHOOK_SECRET);
  const data = encoder.encode(rawBody);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected.toLowerCase() === signature.toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const { raw, json } = await readBody(req);
  const body = json as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid JSON body", 400);
  }

  const signature = req.headers.get("x-cal-signature-256");
  let action = body.action as string | undefined;
  if (!action && (signature || body.triggerEvent)) {
    action = "webhook";
  }

  const { payload, action: _ignored, ...rest } = body;
  const input = (payload as Record<string, unknown> | undefined) ?? rest;

  if (!action || typeof action !== "string") {
    return errorResponse("Missing action", 400);
  }

  try {
    switch (action) {
      case "health": {
        return jsonResponse({ ok: true });
      }

      case "event_types": {
        const data = await calFetch("/v2/event-types", {
          version: CAL_API_VERSION_EVENT_TYPES,
          query: input as Record<string, string | number | boolean | undefined | null>,
        });

        return jsonResponse({ data });
      }

      case "availability": {
        const query = {
          ...(input as Record<string, string | number | boolean | undefined | null>),
        } as Record<string, string | number | boolean | undefined | null>;

        if (query.startTime && !query.start) {
          query.start = query.startTime;
          delete query.startTime;
        }
        if (query.endTime && !query.end) {
          query.end = query.endTime;
          delete query.endTime;
        }

        const data = await calFetch("/v2/slots", {
          version: CAL_API_VERSION_SLOTS,
          query,
        });

        return jsonResponse({ data });
      }

      case "create_booking": {
        const booking = await calFetch("/v2/bookings", {
          method: "POST",
          version: CAL_API_VERSION_BOOKINGS,
          body: input,
        });

        let warning: string | null = null;
        try {
          const { user, email } = await getUserFromRequest(req);
          const attendee = (input?.attendee as Record<string, unknown> | undefined) ?? {};
          const guestEmail = (attendee.email as string | undefined) ?? email ?? null;
          const guestName = (attendee.name as string | undefined) ?? null;
          const bookingData = booking?.data as Record<string, unknown> | undefined;
          const [bookingId] = extractBookingIds(bookingData);

          await insertAppointment({
            user_id: user?.id ?? null,
            guest_name: guestName,
            guest_email: guestEmail,
            status: "scheduled",
            start_at: (bookingData?.start as string | undefined) ?? null,
            end_at: (bookingData?.end as string | undefined) ?? null,
            cal_booking_id: bookingId ?? null,
            payload: booking,
          });
        } catch (persistError) {
          console.error("Booking created in Cal.com but local persistence failed", persistError);
          warning = "BOOKING_CREATED_BUT_PERSIST_FAILED";
        }

        return jsonResponse({ data: booking, warning });
      }

      case "list_bookings": {
        const { user, email } = await getUserFromRequest(req);
        if (!user || !email) {
          return errorResponse("Authentication required", 401);
        }

        const data = await calFetch("/v2/bookings", {
          version: CAL_API_VERSION_BOOKINGS,
          query: {
            ...(input as Record<string, string | number | boolean | undefined | null>),
            attendeeEmail: email,
          },
        });

        return jsonResponse({ data });
      }

      case "cancel_booking": {
        const bookingUid = input?.bookingUid as string | undefined;
        if (!bookingUid) {
          return errorResponse("Missing bookingUid", 400);
        }

        const cancelPayload: Record<string, unknown> = {};
        const cancellationReason = input?.cancellationReason as string | undefined;
        if (typeof cancellationReason === "string" && cancellationReason.trim()) {
          cancelPayload.cancellationReason = cancellationReason.trim();
        }
        const cancelSubsequent = input?.cancelSubsequentBookings as boolean | undefined;
        if (typeof cancelSubsequent === "boolean") {
          cancelPayload.cancelSubsequentBookings = cancelSubsequent;
        }

        const data = await calFetch(`/v2/bookings/${bookingUid}/cancel`, {
          method: "POST",
          version: CAL_API_VERSION_BOOKINGS,
          body: Object.keys(cancelPayload).length > 0 ? cancelPayload : undefined,
        });

        await updateAppointment([bookingUid], { status: "cancelled", payload: data });

        return jsonResponse({ data });
      }

      case "admin_list_bookings": {
        const { user } = await getUserFromRequest(req);
        const allowed = await isAdmin(user?.id ?? null);
        if (!allowed) {
          return errorResponse("Admin only", 403);
        }

        const data = await calFetch("/v2/bookings", {
          version: CAL_API_VERSION_BOOKINGS,
          query: input as Record<string, string | number | boolean | undefined | null>,
        });

        return jsonResponse({ data });
      }

      case "webhook": {
        const valid = await verifyWebhookSignature(raw, signature);
        if (!valid) {
          return errorResponse("Invalid webhook signature", 401);
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
          return errorResponse("Server not configured", 500);
        }

        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const event = String(body.triggerEvent ?? "unknown");
        const payload = body.payload as Record<string, unknown> | undefined;
        const bookingIds = extractBookingIds(payload);
        const bookingUid = bookingIds[0] ?? "";

        await adminClient.from("webhook_events").insert({
          event,
          cal_booking_id: bookingUid,
          payload: body,
        });

        if (bookingIds.length > 0) {
          const status = normalizeStatus(payload?.status, event);
          const attendees = (payload?.attendees as Array<Record<string, unknown>> | undefined) ?? [];
          const attendee = attendees[0] ?? {};
          const guestName = (attendee.name as string | undefined) ?? null;
          const guestEmail = (attendee.email as string | undefined) ?? null;
          const startAt = (payload?.startTime as string | undefined) ?? (payload?.start as string | undefined) ?? null;
          const endAt = (payload?.endTime as string | undefined) ?? (payload?.end as string | undefined) ?? null;

          await updateAppointment(bookingIds, {
            status,
            payload: body,
            start_at: startAt,
            end_at: endAt,
            guest_name: guestName,
            guest_email: guestEmail,
          });
        }

        return jsonResponse({ ok: true });
      }

      default:
        return errorResponse("Unknown action", 400);
    }
  } catch (error) {
    const err = error as { status?: number; payload?: unknown; message?: string };
    return errorResponse(err.message ?? "Unexpected error", err.status ?? 500, err.payload);
  }
});
