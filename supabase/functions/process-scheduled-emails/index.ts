import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/*
  Delivery schedule (all times Eastern):
  ┌────────────────────────┬──────────────────────────────────┐
  │ 9 AM  ET  (13:00 UTC)  │ morning_after                    │
  │ 12 PM ET  (16:00 UTC)  │ 8_days_before                    │
  │ 2 PM  ET  (18:00 UTC)  │ day_before_arrival, post_checkout │
  │ 6 PM  ET  (22:00 UTC)  │ day_before_checkout               │
  └────────────────────────┴──────────────────────────────────┘
  booking_confirmed → sent immediately by confirm-booking function
  checkin_ready     → sent manually by host
*/

type TemplateType =
  | "8_days_before"
  | "day_before_arrival"
  | "morning_after"
  | "day_before_checkout"
  | "post_checkout";

interface DateRule {
  field: "check_in" | "check_out";
  offsetDays: number; // negative = before, positive = after
}

const templateRules: Record<TemplateType, DateRule> = {
  "8_days_before":      { field: "check_in",  offsetDays: -8 },
  "day_before_arrival": { field: "check_in",  offsetDays: -1 },
  "morning_after":      { field: "check_in",  offsetDays:  1 },
  "day_before_checkout":{ field: "check_out", offsetDays: -1 },
  "post_checkout":      { field: "check_out", offsetDays:  0 },
};

function getTodayET(): string {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const yyyy = et.getFullYear();
  const mm = String(et.getMonth() + 1).padStart(2, "0");
  const dd = String(et.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const requestedTemplates: TemplateType[] = body.templates || Object.keys(templateRules);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const todayET = getTodayET();
    console.log(`Processing scheduled emails for ${todayET} ET, templates: ${requestedTemplates.join(", ")}`);

    const results: { template: string; bookingId: string; guestEmail: string; status: string }[] = [];

    for (const template of requestedTemplates) {
      const rule = templateRules[template];
      if (!rule) continue;

      // Calculate which booking date should match today
      // If rule says check_in with offset -8, then check_in = today + 8
      const targetDate = addDays(todayET, -rule.offsetDays);

      // Find confirmed bookings where the target field matches
      const { data: bookings, error: bookingsErr } = await supabase
        .from("bookings")
        .select("id, guest_email, guest_first_name, check_in, check_out")
        .eq("status", "confirmed")
        .eq(rule.field, targetDate);

      if (bookingsErr) {
        console.error(`Error fetching bookings for ${template}:`, bookingsErr);
        continue;
      }

      if (!bookings || bookings.length === 0) continue;

      // Check which bookings already have this email sent
      const bookingIds = bookings.map((b: any) => b.id);
      const { data: sentLogs } = await supabase
        .from("guest_emails_log")
        .select("booking_id")
        .eq("template", template)
        .in("booking_id", bookingIds);

      const alreadySent = new Set((sentLogs || []).map((l: any) => l.booking_id));

      for (const booking of bookings) {
        if (alreadySent.has(booking.id)) {
          results.push({ template, bookingId: booking.id, guestEmail: booking.guest_email, status: "already_sent" });
          continue;
        }

        // Send via send-guest-email function
        try {
          const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-guest-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ template, bookingId: booking.id }),
          });

          const emailResult = await emailRes.json();

          if (emailRes.ok && emailResult.success) {
            results.push({ template, bookingId: booking.id, guestEmail: booking.guest_email, status: "sent" });
            console.log(`Sent ${template} to ${booking.guest_email} for booking ${booking.id}`);
          } else {
            results.push({ template, bookingId: booking.id, guestEmail: booking.guest_email, status: `error: ${emailResult.error || "unknown"}` });
            console.error(`Failed ${template} for ${booking.id}:`, emailResult);
          }
        } catch (sendErr) {
          results.push({ template, bookingId: booking.id, guestEmail: booking.guest_email, status: `error: ${sendErr}` });
          console.error(`Exception sending ${template} for ${booking.id}:`, sendErr);
        }
      }
    }

    const sent = results.filter(r => r.status === "sent").length;
    const skipped = results.filter(r => r.status === "already_sent").length;
    const errors = results.filter(r => r.status.startsWith("error")).length;

    console.log(`Done: ${sent} sent, ${skipped} skipped, ${errors} errors`);

    return new Response(
      JSON.stringify({ date: todayET, sent, skipped, errors, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
