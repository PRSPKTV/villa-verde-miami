import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { bookingId, paymentIntentId } = await req.json();

    if (!bookingId || !paymentIntentId) {
      return new Response(
        JSON.stringify({ error: "Missing bookingId or paymentIntentId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      }
    );
    const paymentIntent = await stripeResponse.json();

    if (paymentIntent.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Payment has not succeeded" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: booking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError || !booking) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to confirm booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger the branded guest confirmation email via send-guest-email function
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-guest-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ template: "booking_confirmed", bookingId: booking.id }),
      });
    } catch (emailErr) {
      console.error("Email trigger error:", emailErr);
    }

    // Also send host notification
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      function formatCurrency(cents: number): string {
        return new Intl.NumberFormat("en-US", {
          style: "currency", currency: "USD",
          minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(cents / 100);
      }

      const hostHtml = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a5c3a;">New Booking Received!</h2>
          <div style="background: #fafaf5; padding: 20px; border-radius: 8px; border: 1px solid #e8e4d8;">
            <p><strong>Confirmation:</strong> ${booking.confirmation_code}</p>
            <p><strong>Property:</strong> ${booking.property_name}</p>
            <p><strong>Guest:</strong> ${booking.guest_first_name} ${booking.guest_last_name}</p>
            <p><strong>Email:</strong> ${booking.guest_email}</p>
            <p><strong>Phone:</strong> ${booking.guest_phone}</p>
            <p><strong>Check-in:</strong> ${booking.check_in}</p>
            <p><strong>Check-out:</strong> ${booking.check_out}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Nights:</strong> ${booking.nights}</p>
            ${booking.special_requests ? \`<p><strong>Special Requests:</strong> ${booking.special_requests}</p>\` : ""}
            <hr style="border: none; border-top: 1px solid #e8e4d8; margin: 15px 0;" />
            <p style="font-size: 18px;"><strong>Total:</strong> ${formatCurrency(booking.total)}</p>
          </div>
        </div>
      `;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Villa Verde Miami <bookings@collectiveint.com>",
            to: ["jmordan57@gmail.com"],
            subject: `New Booking: ${booking.confirmation_code} \u2014 ${booking.property_name}`,
            html: hostHtml,
          }),
        });
      } catch (hostEmailErr) {
        console.error("Host email error:", hostEmailErr);
      }
    }

    return new Response(
      JSON.stringify({
        booking: {
          id: booking.id,
          confirmationCode: booking.confirmation_code,
          propertySlug: booking.property_slug,
          propertyName: booking.property_name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          guests: booking.guests,
          nights: booking.nights,
          guestFirstName: booking.guest_first_name,
          guestLastName: booking.guest_last_name,
          guestEmail: booking.guest_email,
          total: booking.total,
          status: booking.status,
        },
      }),
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
