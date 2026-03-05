import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "VV-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    const {
      propertySlug,
      propertyName,
      checkIn,
      checkOut,
      guests,
      nights,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      specialRequests = "",
      nightlyRate,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
    } = body;

    const requiredFields = [
      "propertySlug",
      "propertyName",
      "checkIn",
      "checkOut",
      "guests",
      "nights",
      "guestFirstName",
      "guestLastName",
      "guestEmail",
      "guestPhone",
      "nightlyRate",
      "subtotal",
      "cleaningFee",
      "serviceFee",
      "taxes",
      "total",
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const confirmationCode = generateConfirmationCode();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        confirmation_code: confirmationCode,
        property_slug: propertySlug,
        property_name: propertyName,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        guests,
        guest_first_name: guestFirstName,
        guest_last_name: guestLastName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        special_requests: specialRequests || null,
        nightly_rate: nightlyRate,
        subtotal,
        cleaning_fee: cleaningFee,
        service_fee: serviceFee,
        taxes,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Failed to create booking record", details: bookingError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      metadata: {
        bookingId: booking.id,
        confirmationCode: confirmationCode,
        propertySlug: propertySlug,
        guestEmail: guestEmail,
      },
    });

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq("id", booking.id);

    if (updateError) {
      await supabase.from("bookings").delete().eq("id", booking.id);
      return new Response(
        JSON.stringify({ error: "Failed to link Stripe payment", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id,
        confirmationCode: confirmationCode,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-payment-intent:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
