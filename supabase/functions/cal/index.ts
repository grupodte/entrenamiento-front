import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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
}

async function isAdmin(userId: string | null) {
  if (!userId) return false;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) return false;
  return data?.role === "admin";
}

async function insertAppointment(payload: {
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  status: string;
  start_at?: string | null;
  end_at?: string | null;
  cal_booking_id?: string | null;
  payload: unknown;
}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await adminClient.from("appointments").insert(payload);
}

async function updateAppointment(bookingId: string, status: string, payload: unknown) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await adminClient
    .from("appointments")
    .update({ status, payload })
    .eq("cal_booking_id", bookingId);
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
        const data = await calFetch("/v2/slots", {
          version: CAL_API_VERSION_SLOTS,
          query: input as Record<string, string | number | boolean | undefined | null>,
        });

        return jsonResponse({ data });
      }

      case "create_booking": {
        const booking = await calFetch("/v2/bookings", {
          method: "POST",
          version: CAL_API_VERSION_BOOKINGS,
          body: input,
        });

        const { user, email } = await getUserFromRequest(req);
        const attendee = (input?.attendee as Record<string, unknown> | undefined) ?? {};
        const guestEmail = (attendee.email as string | undefined) ?? email ?? null;
        const guestName = (attendee.name as string | undefined) ?? null;

        await insertAppointment({
          user_id: user?.id ?? null,
          guest_name: guestName,
          guest_email: guestEmail,
          status: "scheduled",
          start_at: (booking?.data?.start as string | undefined) ?? null,
          end_at: (booking?.data?.end as string | undefined) ?? null,
          cal_booking_id: (booking?.data?.uid as string | undefined) ?? null,
          payload: booking,
        });

        return jsonResponse({ data: booking });
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

        const data = await calFetch(`/v2/bookings/${bookingUid}/cancel`, {
          method: "POST",
          version: CAL_API_VERSION_BOOKINGS,
          body: input,
        });

        await updateAppointment(bookingUid, "cancelled", data);

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
        const bookingUid = String(payload?.bookingUid ?? payload?.uid ?? "");

        await adminClient.from("webhook_events").insert({
          event,
          cal_booking_id: bookingUid,
          payload: body,
        });

        if (bookingUid) {
          const status = String(payload?.status ?? "");
          if (status) {
            await updateAppointment(bookingUid, status, body);
          }
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
