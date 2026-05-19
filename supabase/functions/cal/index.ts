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
const CAL_ENFORCED_EVENT_TYPE_ID_RAW = Deno.env.get("CAL_ENFORCED_EVENT_TYPE_ID") ?? "";
const CAL_ENFORCED_EVENT_TYPE_ID = parseEventTypeId(CAL_ENFORCED_EVENT_TYPE_ID_RAW);
const CAL_ENFORCED_EVENT_TYPE_ID_INVALID =
  CAL_ENFORCED_EVENT_TYPE_ID_RAW.trim().length > 0 && CAL_ENFORCED_EVENT_TYPE_ID === null;
const LEAD_TABLE_CANDIDATES = ["crm_leads", "leads"] as const;
const FUNCTION_VERSION = "2026-04-04.1";

// Maps the landing's internal stage values to the admin CRM estado_lead values.
// The admin pipeline uses estado_lead; the landing tracks finer-grained stage internally.
// On lead INSERT we write estado_lead so the admin sees the correct pipeline status.
// On UPDATE we intentionally skip estado_lead to preserve any changes the admin made.
const STAGE_TO_ESTADO_LEAD: Record<string, string> = {
  precall_pending: "pre_call",
  precall_completed: "pre_call",
  precall_booked: "pre_call",
};

function stageToEstadoLead(stage: string | null | undefined): string {
  if (!stage) return "pre_call";
  return STAGE_TO_ESTADO_LEAD[stage] ?? "pre_call";
}
const ACTIVE_APPOINTMENT_STATUSES = ["scheduled", "confirmed", "accepted", "pending"] as const;
let cachedLeadTableName: (typeof LEAD_TABLE_CANDIDATES)[number] | null = null;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "x-cal-function-version": FUNCTION_VERSION,
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

function parseEventTypeId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
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

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingRelationError(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : null;
  if (code === "42P01") return true;

  const message =
    typeof error === "object" && error !== null ? (error as { message?: string }).message : null;
  return typeof message === "string" && message.toLowerCase().includes("does not exist");
}

async function resolveLeadTable(
  adminClient: ReturnType<typeof createClient>,
): Promise<(typeof LEAD_TABLE_CANDIDATES)[number]> {
  if (cachedLeadTableName) return cachedLeadTableName;

  for (const tableName of LEAD_TABLE_CANDIDATES) {
    const { error } = await adminClient.from(tableName).select("id").limit(1);
    if (!error) {
      cachedLeadTableName = tableName;
      return tableName;
    }
    if (!isMissingRelationError(error)) {
      throw Object.assign(new Error(`Failed to resolve lead table: ${tableName}`), {
        status: 500,
        payload: error,
      });
    }
  }

  throw Object.assign(new Error("Lead table not found"), {
    status: 500,
    payload: { candidates: LEAD_TABLE_CANDIDATES },
  });
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizePhone(value: unknown) {
  if (typeof value !== "string") return null;
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 7 ? digitsOnly : null;
}

type LeadRow = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  normalized_email: string | null;
  phone: string | null;
  normalized_phone: string | null;
  stage: string | null;
  source: string | null;
  precall_data: unknown;
  agenda_data: unknown;
  booking_status: string | null;
  last_booking_uid: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  meet_url: string | null;
};

type AppointmentRow = {
  id: string;
  lead_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_phone_normalized: string | null;
  status: string | null;
  start_at: string | null;
  end_at: string | null;
  cal_booking_id: string | null;
  created_at: string | null;
};

type LeadUpsertInput = {
  leadId?: string | null;
  userId?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  stage?: string | null;
  source?: string | null;
  precallData?: Record<string, unknown> | null;
  agendaData?: Record<string, unknown> | null;
  bookingStatus?: string | null;
  lastBookingUid?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  meetUrl?: string | null;
};

function mergeObjects(...values: Array<Record<string, unknown> | null | undefined>) {
  const merged: Record<string, unknown> = {};
  for (const value of values) {
    if (!value) continue;
    Object.assign(merged, value);
  }
  return merged;
}

async function findLeadByContact(
  adminClient: ReturnType<typeof createClient>,
  input: {
    leadId?: string | null;
    userId?: string | null;
    normalizedEmail?: string | null;
    normalizedPhone?: string | null;
  },
) {
  const leadTable = await resolveLeadTable(adminClient);

  if (input.leadId) {
    const { data } = await adminClient
      .from(leadTable)
      .select("*")
      .eq("id", input.leadId)
      .maybeSingle();
    if (data) return data as LeadRow;
  }

  if (input.userId) {
    const { data } = await adminClient
      .from(leadTable)
      .select("*")
      .eq("user_id", input.userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data as LeadRow;
  }

  if (input.normalizedEmail) {
    const { data } = await adminClient
      .from(leadTable)
      .select("*")
      .eq("normalized_email", input.normalizedEmail)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data as LeadRow;
  }

  if (input.normalizedPhone) {
    const { data } = await adminClient
      .from(leadTable)
      .select("*")
      .eq("normalized_phone", input.normalizedPhone)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data as LeadRow;
  }

  return null;
}

async function upsertLead(input: LeadUpsertInput) {
  const adminClient = getAdminClient();
  if (!adminClient) return null;
  const leadTable = await resolveLeadTable(adminClient);

  const normalizedEmail = normalizeEmail(input.email);
  const normalizedPhone = normalizePhone(input.phone);
  const lead = await findLeadByContact(adminClient, {
    leadId: input.leadId ?? null,
    userId: input.userId ?? null,
    normalizedEmail,
    normalizedPhone,
  });

  const nextUserId = input.userId ?? lead?.user_id ?? null;
  const nextNormalizedEmail = normalizedEmail ?? lead?.normalized_email ?? null;
  const nextNormalizedPhone = normalizedPhone ?? lead?.normalized_phone ?? null;
  if (!nextUserId && !nextNormalizedEmail && !nextNormalizedPhone) {
    throw Object.assign(new Error("Lead requires email, phone, or user"), { status: 400 });
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: nextUserId,
    full_name: input.fullName ?? lead?.full_name ?? null,
    email: input.email ?? lead?.email ?? null,
    normalized_email: nextNormalizedEmail,
    phone: input.phone ?? lead?.phone ?? null,
    normalized_phone: nextNormalizedPhone,
    stage: input.stage ?? lead?.stage ?? "precall_pending",
    source: input.source ?? lead?.source ?? "precall",
    precall_data: mergeObjects(asRecord(lead?.precall_data), input.precallData),
    agenda_data: mergeObjects(asRecord(lead?.agenda_data), input.agendaData),
    booking_status: input.bookingStatus ?? lead?.booking_status ?? null,
    last_booking_uid: input.lastBookingUid ?? lead?.last_booking_uid ?? null,
    scheduled_start_at: input.scheduledStartAt ?? lead?.scheduled_start_at ?? null,
    scheduled_end_at: input.scheduledEndAt ?? lead?.scheduled_end_at ?? null,
    meet_url: input.meetUrl ?? lead?.meet_url ?? null,
    last_contact_at: now,
    updated_at: now,
  };

  if (lead?.id) {
    const { data, error } = await adminClient
      .from(leadTable)
      .update(payload)
      .eq("id", lead.id)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("Failed to update lead", { leadTable, payload, error });
      throw Object.assign(new Error("Failed to update lead"), {
        status: 500,
        payload: error,
      });
    }
    return (data as LeadRow | null) ?? null;
  }

  const { data, error } = await adminClient
    .from(leadTable)
    .insert({
      ...payload,
      // estado_lead is the admin CRM pipeline column. We set it only on INSERT so the
      // admin can freely change it later without the landing overwriting their edits.
      estado_lead: stageToEstadoLead(payload.stage),
      created_at: now,
    })
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("Failed to create lead", { leadTable, payload, error });
    throw Object.assign(new Error("Failed to create lead"), {
      status: 500,
      payload: error,
    });
  }
  return (data as LeadRow | null) ?? null;
}

async function insertAppointment(payload: {
  lead_id?: string | null;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone?: string | null;
  guest_phone_normalized?: string | null;
  status?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  cal_booking_id?: string | null;
  meet_url?: string | null;
  precall_data?: unknown;
  payload: unknown;
}) {
  const adminClient = getAdminClient();
  if (!adminClient) return;
  const { error } = await adminClient.from("appointments").insert(payload);
  if (error) {
    throw Object.assign(new Error("Failed to persist appointment"), {
      status: 500,
      payload: error,
    });
  }
}

function isUniqueViolation(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : null;
  return code === "23505";
}

async function updateAppointment(
  bookingIds: string[],
  fields: {
    lead_id?: string | null;
    status?: string | null;
    payload?: unknown;
    start_at?: string | null;
    end_at?: string | null;
    guest_name?: string | null;
    guest_email?: string | null;
    guest_phone?: string | null;
    guest_phone_normalized?: string | null;
    meet_url?: string | null;
    precall_data?: unknown;
  },
) {
  const adminClient = getAdminClient();
  if (!adminClient) return;
  if (bookingIds.length === 0) return;

  const updatePayload: Record<string, unknown> = {};
  if (fields.lead_id !== undefined) updatePayload.lead_id = fields.lead_id;
  if (fields.status) updatePayload.status = fields.status;
  if (fields.payload) updatePayload.payload = fields.payload;
  if (fields.start_at !== undefined) updatePayload.start_at = fields.start_at;
  if (fields.end_at !== undefined) updatePayload.end_at = fields.end_at;
  if (fields.guest_name !== undefined) updatePayload.guest_name = fields.guest_name;
  if (fields.guest_email !== undefined) updatePayload.guest_email = fields.guest_email;
  if (fields.guest_phone !== undefined) updatePayload.guest_phone = fields.guest_phone;
  if (fields.guest_phone_normalized !== undefined) {
    updatePayload.guest_phone_normalized = fields.guest_phone_normalized;
  }
  if (fields.meet_url !== undefined) updatePayload.meet_url = fields.meet_url;
  if (fields.precall_data !== undefined) updatePayload.precall_data = fields.precall_data;

  if (Object.keys(updatePayload).length === 0) return;

  const { data } = await adminClient
    .from("appointments")
    .update(updatePayload)
    .in("cal_booking_id", bookingIds)
    .select("id");

  if (data && data.length > 0) return;

  const insertPayload = {
    lead_id: fields.lead_id ?? null,
    cal_booking_id: bookingIds[0],
    status: fields.status ?? "scheduled",
    payload: fields.payload ?? {},
    start_at: fields.start_at ?? null,
    end_at: fields.end_at ?? null,
    guest_name: fields.guest_name ?? null,
    guest_email: fields.guest_email ?? null,
    guest_phone: fields.guest_phone ?? null,
    guest_phone_normalized: fields.guest_phone_normalized ?? null,
    meet_url: fields.meet_url ?? null,
    precall_data: fields.precall_data ?? null,
  };

  const { error } = await adminClient.from("appointments").insert(insertPayload);
  if (!error) return;

  if (isUniqueViolation(error)) {
    await adminClient
      .from("appointments")
      .update(updatePayload)
      .in("cal_booking_id", bookingIds);
    return;
  }

  throw Object.assign(new Error("Failed to persist appointment"), {
    status: 500,
    payload: error,
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

function toMillis(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const millis = new Date(value).getTime();
  return Number.isNaN(millis) ? null : millis;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringField(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function precallPhone(precallData: Record<string, unknown> | null) {
  if (!precallData) return null;
  return stringField(precallData.whatsapp) ?? stringField(precallData.phone);
}

async function listFutureActiveAppointments(
  adminClient: ReturnType<typeof createClient>,
  input: {
    leadId?: string | null;
    email?: string | null;
    normalizedPhone?: string | null;
  },
) {
  const now = new Date().toISOString();
  const selectFields =
    "id, lead_id, guest_email, guest_phone, guest_phone_normalized, status, start_at, end_at, cal_booking_id, created_at";

  let query = adminClient
    .from("appointments")
    .select(selectFields)
    .gte("start_at", now)
    .in("status", [...ACTIVE_APPOINTMENT_STATUSES])
    .order("start_at", { ascending: true })
    .limit(5);

  if (input.leadId) {
    query = query.eq("lead_id", input.leadId);
  } else if (input.email) {
    query = query.ilike("guest_email", input.email);
  } else if (input.normalizedPhone) {
    query = query.eq("guest_phone_normalized", input.normalizedPhone);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to inspect future active appointments", { input, error });
    throw Object.assign(new Error("Failed to inspect active appointments"), {
      status: 500,
      payload: error,
    });
  }

  const rows = (data as AppointmentRow[] | null) ?? [];
  const seen = new Set<string>();

  return rows.filter((row) => {
    const key = row.cal_booking_id ?? row.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripBookingLocalFields(input: Record<string, unknown>) {
  const payload = { ...input };
  delete payload.precallData;
  delete payload.leadId;
  delete payload.source;
  delete payload.action;
  delete payload.payload;
  return payload;
}

function extractBookings(raw: unknown): Array<Record<string, unknown>> {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item));
  }

  const record = asRecord(raw);
  if (!record) return [];

  const nestedCandidates: unknown[] = [
    record.data,
    record.bookings,
    record.results,
    record.items,
  ];

  const nestedData = asRecord(record.data);
  if (nestedData) {
    nestedCandidates.push(nestedData.data, nestedData.bookings, nestedData.results, nestedData.items);
  }

  for (const candidate of nestedCandidates) {
    const bookings = extractBookings(candidate);
    if (bookings.length > 0) return bookings;
  }

  return [];
}

function bookingEmail(booking: Record<string, unknown>) {
  const directEmail = booking.attendeeEmail ?? booking.email;
  if (typeof directEmail === "string" && directEmail) return directEmail.toLowerCase();

  const attendees = booking.attendees;
  if (Array.isArray(attendees)) {
    for (const attendee of attendees) {
      const record = asRecord(attendee);
      const email = record?.email;
      if (typeof email === "string" && email) return email.toLowerCase();
    }
  }

  return null;
}

function bookingStart(booking: Record<string, unknown>) {
  const value = booking.start ?? booking.startTime;
  return typeof value === "string" ? value : null;
}

function findMatchingBooking(
  bookingsRaw: unknown,
  expectedStart: string | null,
  expectedEmail: string | null,
) {
  const bookings = extractBookings(bookingsRaw);
  if (bookings.length === 0) return null;

  const expectedMillis = toMillis(expectedStart);
  const normalizedEmail = expectedEmail?.toLowerCase() ?? null;

  return bookings.find((booking) => {
    const start = bookingStart(booking);
    const bookingMillis = toMillis(start);
    if (expectedMillis === null || bookingMillis === null) return false;
    if (Math.abs(bookingMillis - expectedMillis) > 60_000) return false;

    if (!normalizedEmail) return true;
    const foundEmail = bookingEmail(booking);
    return foundEmail === normalizedEmail;
  }) ?? null;
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

  if (CAL_ENFORCED_EVENT_TYPE_ID_INVALID) {
    return errorResponse("Invalid env: CAL_ENFORCED_EVENT_TYPE_ID", 500);
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
        const requestedEventTypeId = parseEventTypeId(query.eventTypeId);
        const effectiveEventTypeId = CAL_ENFORCED_EVENT_TYPE_ID ?? requestedEventTypeId;
        if (!effectiveEventTypeId) {
          return errorResponse("Missing eventTypeId", 400);
        }
        query.eventTypeId = effectiveEventTypeId;

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

      case "upsert_lead": {
        const precallData = asRecord(input?.precallData);
        if (!precallData) {
          return errorResponse("Missing precallData", 400);
        }

        const lead = await upsertLead({
          leadId: stringField(input?.leadId),
          fullName: stringField(precallData.nombre),
          email: stringField(precallData.email),
          phone: stringField(precallData.whatsapp) ?? stringField(precallData.phone),
          stage: stringField(input?.stage) ?? "precall_completed",
          source: stringField(input?.source) ?? "precall",
          precallData,
        });

        return jsonResponse({
          data: {
            leadId: lead?.id ?? null,
          },
        });
      }

      case "create_booking": {
        const attendee = (input?.attendee as Record<string, unknown> | undefined) ?? {};
        const requestedEmail = (attendee.email as string | undefined) ?? null;
        const requestedName = (attendee.name as string | undefined) ?? null;
        const requestedTimeZone = (attendee.timeZone as string | undefined) ?? null;
        const requestedStart = (input?.start as string | undefined) ?? null;
        const leadId = stringField(input?.leadId);
        const precallData = asRecord(input?.precallData);
        const bookingSource = stringField(input?.source) ?? "precall";
        const guestPhone = precallPhone(precallData);
        const normalizedRequestedEmail = normalizeEmail(requestedEmail);
        const normalizedGuestPhone = normalizePhone(guestPhone);
        const bookingPayload = stripBookingLocalFields(input as Record<string, unknown>);

        if (!requestedName || !requestedEmail || !requestedStart) {
          return errorResponse("Missing attendee or slot", 400);
        }

        const adminClient = getAdminClient();
        if (!adminClient) {
          return errorResponse("Server not configured", 500);
        }

        const lead = await findLeadByContact(adminClient, {
          leadId,
          normalizedEmail: normalizedRequestedEmail,
          normalizedPhone: normalizedGuestPhone,
        });

        if (leadId && !lead) {
          return errorResponse("LEAD_NOT_FOUND", 409, { leadId });
        }

        const normalizedPrecallEmail = normalizeEmail(stringField(precallData?.email));
        if (normalizedPrecallEmail && normalizedRequestedEmail && normalizedPrecallEmail !== normalizedRequestedEmail) {
          return errorResponse("PRECALL_EMAIL_MISMATCH", 409, {
            leadId,
            requestedEmail,
          });
        }

        if (lead?.normalized_email && normalizedRequestedEmail && lead.normalized_email !== normalizedRequestedEmail) {
          return errorResponse("LEAD_EMAIL_MISMATCH", 409, {
            leadId: lead.id,
            requestedEmail,
          });
        }

        if (lead?.normalized_phone && normalizedGuestPhone && lead.normalized_phone !== normalizedGuestPhone) {
          return errorResponse("LEAD_PHONE_MISMATCH", 409, {
            leadId: lead.id,
          });
        }

        const conflictingAppointments = await listFutureActiveAppointments(adminClient, {
          leadId: lead?.id ?? leadId ?? null,
          email: lead?.id || leadId ? null : normalizedRequestedEmail,
          normalizedPhone: lead?.id || leadId || normalizedRequestedEmail ? null : normalizedGuestPhone,
        });
        const activeConflict = conflictingAppointments[0] ?? null;

        if (activeConflict) {
          return errorResponse("ACTIVE_BOOKING_EXISTS", 409, {
            appointmentId: activeConflict.id,
            bookingUid: activeConflict.cal_booking_id,
            startAt: activeConflict.start_at,
            status: activeConflict.status,
          });
        }

        // If precall data has a phone, include it in the Cal.com attendee object.
        // Cal.com event types configured to require phone will reject bookings without it.
        if (guestPhone && bookingPayload.attendee && typeof bookingPayload.attendee === "object") {
          const attendeeRecord = bookingPayload.attendee as Record<string, unknown>;
          if (!attendeeRecord.phoneNumber) {
            const digits = guestPhone.replace(/\D/g, "");
            attendeeRecord.phoneNumber = digits.startsWith("0") ? `+598${digits.slice(1)}` : `+${digits}`;
          }
        }

        const requestedEventTypeId = parseEventTypeId(bookingPayload.eventTypeId);
        const effectiveEventTypeId = CAL_ENFORCED_EVENT_TYPE_ID ?? requestedEventTypeId;
        if (!effectiveEventTypeId) {
          return errorResponse("Missing eventTypeId", 400);
        }
        bookingPayload.eventTypeId = effectiveEventTypeId;

        let booking: unknown;
        const warnings: string[] = [];
        try {
          booking = await calFetch("/v2/bookings", {
            method: "POST",
            version: CAL_API_VERSION_BOOKINGS,
            body: bookingPayload,
          });
        } catch (createError) {
          const err = createError as { status?: number; payload?: unknown; message?: string };
          console.error("Cal.com create booking failed", err);

          // Cal.com can return 5xx while still creating the booking.
          if (typeof err.status === "number" && err.status >= 500 && requestedStart && requestedEmail) {
            try {
              const listResult = await calFetch("/v2/bookings", {
                version: CAL_API_VERSION_BOOKINGS,
                query: { attendeeEmail: requestedEmail },
              });
              const recovered = findMatchingBooking(listResult, requestedStart, requestedEmail);
              if (recovered) {
                booking = { data: recovered };
                warnings.push("CAL_CREATE_5XX_BUT_BOOKING_RECOVERED");
              }
            } catch (recoveryError) {
              console.error("Cal.com booking recovery failed", recoveryError);
            }
          }

          if (!booking) {
            return errorResponse("CAL_CREATE_BOOKING_FAILED", 502, err.payload ?? err.message);
          }
        }

        const bookingRecord = asRecord(booking);
        const bookingData = asRecord(bookingRecord?.data) ?? bookingRecord;
        const bookingUid =
          stringField(bookingData?.uid)
          ?? stringField(bookingData?.id)
          ?? null;
        const startAt =
          stringField(bookingData?.start)
          ?? stringField(bookingData?.startTime)
          ?? requestedStart;
        const endAt =
          stringField(bookingData?.end)
          ?? stringField(bookingData?.endTime)
          ?? null;
        const meetUrl =
          stringField(bookingData?.meetUrl)
          ?? stringField(bookingData?.meetingUrl)
          ?? stringField(bookingData?.location)
          ?? null;

        const updatedLead = await upsertLead({
          leadId: lead?.id ?? leadId,
          fullName: requestedName,
          email: requestedEmail,
          phone: guestPhone,
          stage: "precall_booked",
          source: bookingSource,
          precallData,
          agendaData: {
            attendee: {
              name: requestedName,
              email: requestedEmail,
              timeZone: requestedTimeZone,
            },
            booking: bookingData ?? booking,
          },
          bookingStatus: "scheduled",
          lastBookingUid: bookingUid,
          scheduledStartAt: startAt,
          scheduledEndAt: endAt,
          meetUrl,
        });

        const appointmentPrecallData = asRecord(updatedLead?.precall_data) ?? precallData;
        const appointmentGuestPhone = stringField(updatedLead?.phone) ?? guestPhone;

        await updateAppointment(extractBookingIds(bookingData ?? bookingRecord ?? {}), {
          lead_id: updatedLead?.id ?? lead?.id ?? leadId ?? null,
          status: "scheduled",
          payload: booking,
          start_at: startAt,
          end_at: endAt,
          guest_name: requestedName,
          guest_email: requestedEmail,
          guest_phone: appointmentGuestPhone,
          guest_phone_normalized: normalizePhone(appointmentGuestPhone),
          meet_url: meetUrl,
          precall_data: appointmentPrecallData,
        });

        return jsonResponse({ data: booking, warnings: warnings.length > 0 ? warnings : null });
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

      case "admin_list_leads": {
        const { user } = await getUserFromRequest(req);
        const allowed = await isAdmin(user?.id ?? null);
        if (!allowed) {
          return errorResponse("Admin only", 403);
        }

        const adminClient = getAdminClient();
        if (!adminClient) {
          return errorResponse("Server not configured", 500);
        }
        const leadTable = await resolveLeadTable(adminClient);

        const { data, error } = await adminClient
          .from(leadTable)
          .select("*")
          .order("updated_at", { ascending: false });
        if (error) {
          return errorResponse("Failed to list leads", 500, error);
        }

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

        const adminClient = getAdminClient();
        if (!adminClient) {
          return errorResponse("Server not configured", 500);
        }
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
          const guestPhone =
            stringField(attendee.phoneNumber)
            ?? stringField(attendee.phone)
            ?? null;
          const startAt = (payload?.startTime as string | undefined) ?? (payload?.start as string | undefined) ?? null;
          const endAt = (payload?.endTime as string | undefined) ?? (payload?.end as string | undefined) ?? null;
          
          // Extract meet URL from webhook payload
          const meetUrl = (payload?.meetUrl as string | undefined) 
            ?? (payload?.meetingUrl as string | undefined)
            ?? (payload?.videoCallData?.url as string | undefined)
            ?? (payload?.location as string | undefined)
            ?? null;

          const lead = await upsertLead({
            fullName: guestName,
            email: guestEmail,
            phone: guestPhone,
            stage: "precall_completed",
            source: "precall",
            agendaData: {
              webhookEvent: event,
              booking: payload ?? null,
            },
            bookingStatus: status,
            lastBookingUid: bookingUid || null,
            scheduledStartAt: startAt,
            scheduledEndAt: endAt,
            meetUrl,
          });

          await updateAppointment(bookingIds, {
            lead_id: lead?.id ?? null,
            status,
            payload: body,
            start_at: startAt,
            end_at: endAt,
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            guest_phone_normalized: normalizePhone(guestPhone),
            meet_url: meetUrl,
          });
        }

        return jsonResponse({ ok: true });
      }

      default:
        return errorResponse("Unknown action", 400);
    }
  } catch (error) {
    const err = error as { status?: number; payload?: unknown; message?: string };
    console.error("Unhandled error in cal function", {
      action,
      message: err.message,
      status: err.status,
      payload: err.payload,
    });
    return errorResponse(err.message ?? "Unexpected error", err.status ?? 500, err.payload);
  }
});
