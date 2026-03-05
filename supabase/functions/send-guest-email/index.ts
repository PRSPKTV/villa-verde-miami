import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Booking {
  id: string;
  confirmation_code: string;
  property_slug: string;
  property_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests: string | null;
  nightly_rate: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total: number;
  status: string;
}

type TemplateType =
  | "booking_confirmed"
  | "8_days_before"
  | "day_before_arrival"
  | "checkin_ready"
  | "morning_after"
  | "day_before_checkout"
  | "post_checkout";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDoorCodeDDMM(checkInDate: string): string {
  const d = new Date(checkInDate + "T12:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}${month}`;
}

function getDoorCodeMMDD(checkInDate: string): string {
  const d = new Date(checkInDate + "T12:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${month}${day}`;
}

const LOGO_URL = "https://villaverdemiami.com/wp-content/uploads/2025/03/WhatsApp_Image_2025-03-11_at_00.35.32_c1c8ffc1-removebg-preview.png";

const C = {
  verde500: "#0B4D2C",
  verde700: "#082B1A",
  verde800: "#0A2416",
  cream100: "#FAF6F0",
  cream200: "#F2ECDF",
  cream300: "#E8E1D0",
  gold500: "#C9A84C",
  gold600: "#B8943D",
  surface: "#FFFFFF",
  textPrimary: "#0A2416",
  textSecondary: "#3A5A3F",
  textMuted: "#6B8A72",
};

const headingFont = "'Cormorant Garamond',Georgia, 'Times New Roman', serif";
const bodyFont = "'DM Sans','Helvetica Neue', Arial, sans-serif";
const dataFont = "'JetBrains Mono',monospace";

function brandWrap(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  ${preheader ? \`<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>\` : ""}
</head>
<body style="margin:0;padding:0;background-color:${C.cream100};-webkit-font-smoothing:antialiased;">
  <!-- Full-width header -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.verde500};">
    <tr>
      <td align="center" style="padding:28px 0 20px;">
        <img src="${LOGO_URL}" alt="Villa Verde Miami" width="120" style="display:block;width:120px;height:auto;filter:drop-shadow(0 0 12px rgba(255,255,255,0.4));" />
      </td>
    </tr>
  </table>

  <!-- Gold divider -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background-color:${C.gold500};height:3px;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>

  <!-- Body on cream background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream100};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
          <tr>
            <td style="background-color:${C.cream100};padding:40px 36px 36px;font-family:${bodyFont};">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.verde800};">
    <tr>
      <td align="center" style="padding:32px 24px;">
        <p style="margin:0 0 4px;font-family:${headingFont};font-size:14px;color:${C.gold500};font-weight:600;letter-spacing:1px;">THE COLLECTIVE INTERNATIONAL</p>
        <p style="margin:0 0 16px;font-family:${bodyFont};font-size:12px;color:${C.textMuted};">Premium Vacation Rentals &bull; Miami, FL</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 10px;font-family:${bodyFont};">
              <a href="mailto:JM@Collectiveint.COM" style="color:${C.cream300};font-size:12px;text-decoration:none;">JM@Collectiveint.COM</a>
            </td>
            <td style="color:${C.textMuted};font-size:12px;">|</td>
            <td style="padding:0 10px;font-family:${bodyFont};">
              <span style="color:${C.cream300};font-size:12px;">(305) 440-0808</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const signatureBlock = `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid ${C.cream200};padding-top:24px;width:100%;">
    <tr>
      <td style="font-family:${bodyFont};">
        <p style="margin:0;font-size:16px;color:${C.verde500};font-weight:600;">Jonnathan Mordan</p>
        <p style="margin:3px 0 0;font-size:12px;color:${C.textMuted};letter-spacing:1px;text-transform:uppercase;">Host &bull; THE COLLECTIVE INTERNATIONAL</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;">
          <tr><td style="padding:0 0 4px;"><span style="font-size:13px;color:${C.textSecondary};">Email: <a href="mailto:JM@Collectiveint.COM" style="color:${C.verde500};text-decoration:none;font-weight:500;">JM@Collectiveint.COM</a></span></td></tr>
          <tr><td style="padding:0 0 4px;"><span style="font-size:13px;color:${C.textSecondary};">Office: (305) 440-0808</span></td></tr>
        </table>
      </td>
    </tr>
  </table>
`;

function bookingCard(b: Booking): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:28px 0;">
      <tr>
        <td style="padding:24px;font-family:${bodyFont};">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="padding:0 0 10px;"><span style="font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">Confirmation</span></td>
              <td style="padding:0 0 10px;text-align:right;"><span style="font-size:16px;color:${C.verde500};font-weight:700;letter-spacing:1px;font-family:${dataFont};">${b.confirmation_code}</span></td>
            </tr>
            <tr><td colspan="2" style="border-top:1px solid ${C.cream300};padding:10px 0;"></td></tr>
            <tr><td style="padding:5px 0;font-size:14px;color:${C.textSecondary};">Property</td><td style="padding:5px 0;font-size:14px;color:${C.textPrimary};text-align:right;font-weight:600;">${b.property_name}</td></tr>
            <tr><td style="padding:5px 0;font-size:14px;color:${C.textSecondary};">Check-in</td><td style="padding:5px 0;font-size:14px;color:${C.textPrimary};text-align:right;">${formatDate(b.check_in)}</td></tr>
            <tr><td style="padding:5px 0;font-size:14px;color:${C.textSecondary};">Check-out</td><td style="padding:5px 0;font-size:14px;color:${C.textPrimary};text-align:right;">${formatDate(b.check_out)}</td></tr>
            <tr><td style="padding:5px 0;font-size:14px;color:${C.textSecondary};">Guests</td><td style="padding:5px 0;font-size:14px;color:${C.textPrimary};text-align:right;">${b.guests}</td></tr>
            <tr><td style="padding:5px 0;font-size:14px;color:${C.textSecondary};">Nights</td><td style="padding:5px 0;font-size:14px;color:${C.textPrimary};text-align:right;">${b.nights}</td></tr>
            <tr><td colspan="2" style="border-top:1px solid ${C.cream300};padding:10px 0;"></td></tr>
            <tr><td style="padding:5px 0;font-size:17px;color:${C.verde500};font-weight:700;">Total Paid</td><td style="padding:5px 0;font-size:17px;color:${C.gold600};text-align:right;font-weight:700;">${formatCurrency(b.total)}</td></tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function checkinDetails_villa_verde_tropical_escape(b: Booking): string {
  const doorCode = getDoorCodeDDMM(b.check_in);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:24px 0;">
      <tr><td style="padding:28px;font-family:${bodyFont};">
        
        <p style="margin:0 0 14px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udccd Address</p>
        <p style="margin:0 0 24px;font-size:17px;color:${C.verde500};font-weight:700;">1718 SW 11 St</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udd11 Door Access</p>
        <p style="margin:0 0 8px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Enter through the front gate. Your door code is the day and month of your check-in (DDMM format). For example, if you check in on March 15th, your code is 1503.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;"><tr>
          <td style="background-color:${C.verde500};padding:14px 28px;border-radius:8px;text-align:center;">
            <p style="margin:0;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">Your Door Code</p>
            <p style="margin:6px 0 0;font-size:30px;color:${C.gold500};font-weight:700;letter-spacing:8px;font-family:${dataFont};">${doorCode}</p>
          </td>
        </tr></table>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\ude97 Parking</p>
        <p style="margin:0 0 24px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Free driveway parking available. Pull into the driveway and park in any open spot.</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udcf6 WiFi</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${C.cream100};border:1px solid ${C.cream300};border-radius:8px;"><tr><td style="padding:14px 20px;">
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Network</p>
          <p style="margin:0 0 10px;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">ATTYcuJStQt</p>
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Password</p>
          <p style="margin:0;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">vxg6j=7c+4ys</p>
        </td></tr></table>
        <p style="margin:16px 0 0;font-size:15px;color:${C.textPrimary};line-height:1.65;">Backyard access through the side gate on the left side of the house.</p>
      </td></tr>
    </table>`;
}

function checkinDetails_casita_verde_guesthouse(b: Booking): string {
  const doorCode = getDoorCodeMMDD(b.check_in);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:24px 0;">
      <tr><td style="padding:28px;font-family:${bodyFont};">
        
        <p style="margin:0 0 14px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udccd Address</p>
        <p style="margin:0 0 24px;font-size:17px;color:${C.verde500};font-weight:700;">1718 SW 11 St</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udd11 Door Access</p>
        <p style="margin:0 0 8px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Walk down the driveway to the guesthouse at the rear of the property. Your door code is the month and day of your check-in (MMDD format).</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;"><tr>
          <td style="background-color:${C.verde500};padding:14px 28px;border-radius:8px;text-align:center;">
            <p style="margin:0;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">Your Door Code</p>
            <p style="margin:6px 0 0;font-size:30px;color:${C.gold500};font-weight:700;letter-spacing:8px;font-family:${dataFont};">${doorCode}</p>
          </td>
        </tr></table>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\ude97 Parking</p>
        <p style="margin:0 0 24px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Free street parking. Your table in the backyard is reserved for you.</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udcf6 WiFi</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${C.cream100};border:1px solid ${C.cream300};border-radius:8px;"><tr><td style="padding:14px 20px;">
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Network</p>
          <p style="margin:0 0 10px;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">ATTYcuJStQt</p>
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Password</p>
          <p style="margin:0;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">vxg6j=7c+4ys</p>
        </td></tr></table>
      </td></tr>
    </table>`;
}

function checkinDetails_private_suite(b: Booking): string {
  const doorCode = getDoorCodeMMDD(b.check_in);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:24px 0;">
      <tr><td style="padding:28px;font-family:${bodyFont};">
        
        <p style="margin:0 0 14px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udccd Address</p>
        <p style="margin:0 0 24px;font-size:17px;color:${C.verde500};font-weight:700;">1718 SW 11 St</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udd11 Door Access</p>
        <p style="margin:0 0 8px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Walk to the rear of the property, behind the staircase. Your door code is the month and day of your check-in (MMDD format).</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;"><tr>
          <td style="background-color:${C.verde500};padding:14px 28px;border-radius:8px;text-align:center;">
            <p style="margin:0;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">Your Door Code</p>
            <p style="margin:6px 0 0;font-size:30px;color:${C.gold500};font-weight:700;letter-spacing:8px;font-family:${dataFont};">${doorCode}</p>
          </td>
        </tr></table>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\ude97 Parking</p>
        <p style="margin:0 0 24px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Free street parking available.</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udcf6 WiFi</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${C.cream100};border:1px solid ${C.cream300};border-radius:8px;"><tr><td style="padding:14px 20px;">
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Network</p>
          <p style="margin:0 0 10px;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">ATTYcuJStQt</p>
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Password</p>
          <p style="margin:0;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">vxg6j=7c+4ys</p>
        </td></tr></table>
      </td></tr>
    </table>`;
}

function checkinDetails_bright_modern_2br_getaway(b: Booking): string {

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:24px 0;">
      <tr><td style="padding:28px;font-family:${bodyFont};">
        
        <p style="margin:0 0 14px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udccd Address</p>
        <p style="margin:0 0 24px;font-size:17px;color:${C.verde500};font-weight:700;">1718 SW 11 St</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udd11 Check-in Details</p>
        <p style="margin:0 0 24px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Address: 1716 SW 11th St, Miami, FL 33135, Unit #3 (2nd floor, front of building). The door will be unlocked. Keys are on the kitchen island.</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\ude97 Parking</p>
        <p style="margin:0 0 24px;font-size:15px;color:${C.textPrimary};line-height:1.65;">Free street parking and back parking available.</p>
        <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">\ud83d\udcf6 WiFi</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${C.cream100};border:1px solid ${C.cream300};border-radius:8px;"><tr><td style="padding:14px 20px;">
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Network</p>
          <p style="margin:0 0 10px;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">1716</p>
          <p style="margin:0 0 2px;font-size:12px;color:${C.textMuted};">Password</p>
          <p style="margin:0;font-size:16px;color:${C.textPrimary};font-weight:600;font-family:${dataFont};">12345678</p>
        </td></tr></table>
      </td></tr>
    </table>`;
}

function getCheckinDetails(b: Booking): string {
  switch (b.property_slug) {
    case "villa-verde-tropical-escape": return checkinDetails_villa_verde_tropical_escape(b);
    case "casita-verde-guesthouse": return checkinDetails_casita_verde_guesthouse(b);
    case "private-suite": return checkinDetails_private_suite(b);
    case "bright-modern-2br-getaway": return checkinDetails_bright_modern_2br_getaway(b);
    default: return checkinDetails_villa_verde_tropical_escape(b);
  }
}

// --- Templates ---
function template_booking_confirmed(b: Booking): { subject: string; html: string } {
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Your Booking is Confirmed!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">${b.guest_first_name},</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Thank you for choosing us. I'm excited to host you for your 5-Star trip to Miami!!!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Expect to receive details on checking-in and making the best of your stay when your reservation date is closer.</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">In the meantime, if you have any questions about house rules or planning your stay, feel free to check with me. We're here to do what we can to make your stay comfortable, fun and stress-free. Thanks again for choosing us.</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 4px;">I look forward to hosting you!</p>
    ${bookingCard(b)}
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 4px;">Warm regards,</p>
    ${signatureBlock}`;
  return { subject: `Booking Confirmed \u2014 ${b.confirmation_code} \u2014 ${b.property_name}`, html: brandWrap(content, `Your booking at ${b.property_name} is confirmed!`) };
}

function template_8_days_before(b: Booking): { subject: string; html: string } {
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Your Miami Getaway is Almost Here!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Good Afternoon, ${b.guest_first_name},</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">I hope you're ready for your 5-Star Miami getaway!!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">I'm excited for your arrival. I just wanted to drop in and remind you that you can reach out if you need any help prepping/planning for your trip. Please let me know if you have any questions at all.</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">I hope all is well!</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:28px 0;">
      <tr><td style="padding:24px;font-family:${bodyFont};">
        <p style="margin:0 0 6px;font-size:11px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">Your Stay</p>
        <p style="margin:0 0 12px;font-size:17px;color:${C.verde500};font-weight:700;">${b.property_name}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
          <tr><td style="font-size:14px;color:${C.textSecondary};padding:5px 0;">Check-in</td><td style="font-size:14px;color:${C.textPrimary};text-align:right;padding:5px 0;">${formatDate(b.check_in)}</td></tr>
          <tr><td style="font-size:14px;color:${C.textSecondary};padding:5px 0;">Check-out</td><td style="font-size:14px;color:${C.textPrimary};text-align:right;padding:5px 0;">${formatDate(b.check_out)}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0;">\u2013 Jonnathan</p>
    ${signatureBlock}`;
  return { subject: `Your Miami getaway is just around the corner! \u2022 ${b.property_name}`, html: brandWrap(content, `Just 8 days until your stay at ${b.property_name}!`) };
}

function template_day_before_arrival(b: Booking): { subject: string; html: string } {
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Check-in is Tomorrow!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Good Afternoon, ${b.guest_first_name},</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">I just want to give you a quick reminder that check-in is tomorrow at <strong>4 PM</strong>. I'll be sending you check-in instructions as soon as the place is ready for you!</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.verde500};border-radius:8px;margin:28px 0;">
      <tr><td style="padding:32px;text-align:center;font-family:${bodyFont};">
        <p style="margin:0 0 6px;font-size:48px;color:${C.gold500};font-weight:700;font-family:${headingFont};">1</p>
        <p style="margin:0 0 14px;font-size:12px;color:${C.textMuted};text-transform:uppercase;letter-spacing:3px;">Day Until Check-in</p>
        <p style="margin:0;font-size:16px;color:${C.cream100};font-weight:600;">${b.property_name}</p>
        <p style="margin:6px 0 0;font-size:14px;color:${C.textMuted};">${formatDate(b.check_in)} at 4:00 PM</p>
      </td></tr>
    </table>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0;">\u2013 Jonnathan</p>
    ${signatureBlock}`;
  return { subject: `Check-in is tomorrow! \u2022 ${b.property_name}`, html: brandWrap(content, `Check-in at ${b.property_name} is tomorrow at 4 PM!`) };
}

function template_checkin_ready(b: Booking): { subject: string; html: string } {
  const details = getCheckinDetails(b);
  const greeting = `<p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Hey ${b.guest_first_name},</p><p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 8px;">The house is ready for check-in!</p>`;
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Ready for Check-in!</p>
    ${greeting}
    ${details}
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:16px 0 0;">Feel free to call or text me with any questions at <strong>(305) 440-0808</strong>.</p>
    ${signatureBlock}`;
  return { subject: `Check-in is ready! \u2022 ${b.property_name}`, html: brandWrap(content, `Your place is ready! Here are your check-in details for ${b.property_name}.`) };
}

function template_morning_after(b: Booking): { subject: string; html: string } {
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Good Morning!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Good Morning ${b.guest_first_name},</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">I hope you had a great first night stay/sleep! Please remember that I'm available if you need anything. Don't hesitate to reach out with any questions, concerns, or suggestions for anything we can do to make sure you have a 5 star experience!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">We hope you are enjoying your trip!</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.cream200};border:1px solid ${C.cream300};border-radius:8px;margin:28px 0;">
      <tr><td style="padding:24px;text-align:center;font-family:${bodyFont};">
        <p style="margin:0 0 10px;font-size:12px;color:${C.textMuted};text-transform:uppercase;letter-spacing:2px;">Need Anything?</p>
        <p style="margin:0 0 6px;font-size:15px;color:${C.verde500};">Call or text: <strong>(305) 440-0808</strong></p>
        <p style="margin:0;font-size:15px;color:${C.verde500};">Email: <a href="mailto:JM@Collectiveint.COM" style="color:${C.gold600};text-decoration:none;font-weight:600;">JM@Collectiveint.COM</a></p>
      </td></tr>
    </table>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0;">\u2013 Jonnathan</p>
    ${signatureBlock}`;
  return { subject: `Hope you had a great first night! \u2022 ${b.property_name}`, html: brandWrap(content, `Hope you had a great first night at ${b.property_name}!`) };
}

function template_day_before_checkout(b: Booking): { subject: string; html: string } {
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Checkout Reminder</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Good Evening ${b.guest_first_name},</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">I hope you've enjoyed your stay! Just a quick reminder that checkout is at <strong>11 AM</strong>. When you checkout you don't need to do anything special. You can lock up the door on your way out and we'll take care of the rest!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">If there's anything you need just let me know. Thanks again for choosing us, I hope you've enjoyed your stay!</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${C.verde500};border-radius:8px;margin:28px 0;">
      <tr><td style="padding:28px;text-align:center;font-family:${bodyFont};">
        <p style="margin:0 0 6px;font-size:12px;color:${C.textMuted};text-transform:uppercase;letter-spacing:3px;">Checkout</p>
        <p style="margin:0 0 10px;font-size:20px;color:${C.cream100};font-weight:700;">${formatDate(b.check_out)}</p>
        <p style="margin:0;font-size:26px;color:${C.gold500};font-weight:700;font-family:${headingFont};">11:00 AM</p>
      </td></tr>
    </table>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0;">\u2013 Jonnathan</p>
    ${signatureBlock}`;
  return { subject: `Checkout reminder \u2022 ${b.property_name}`, html: brandWrap(content, `Checkout at ${b.property_name} is tomorrow at 11 AM.`) };
}

function template_post_checkout(b: Booking): { subject: string; html: string } {
  const content = `
    <p style="font-size:26px;color:${C.verde500};font-weight:700;margin:0 0 24px;font-family:${headingFont};">Thank You for Staying With Us!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Thanks once again for staying with us ${b.guest_first_name}!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">You were an absolute pleasure to host!</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">As a Five Star Guest, our doors are always open to you and your loved ones.</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 16px;">Next time you come back please shoot me a text or an email and ask me about our <strong>Five Star Friends</strong> perks! \ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 4px;">Best Wishes &amp; Safe travels.</p>
    <p style="font-size:15px;color:${C.textPrimary};line-height:1.7;margin:0 0 4px;">Until next time,</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-radius:8px;margin:28px 0;">
      <tr><td style="background-color:${C.verde500};padding:32px;border-radius:8px;text-align:center;font-family:${bodyFont};">
        <p style="margin:0 0 6px;font-size:28px;">\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f</p>
        <p style="margin:0 0 8px;font-size:22px;color:${C.gold500};font-weight:700;font-family:${headingFont};">Five Star Guest</p>
        <p style="margin:0;font-size:14px;color:${C.textMuted};">You're always welcome at Villa Verde Miami</p>
      </td></tr>
    </table>
    ${signatureBlock}`;
  return { subject: `Thank you for staying with us! \u2022 ${b.property_name}`, html: brandWrap(content, `Thank you for your stay at ${b.property_name}! You're a Five Star Guest.`) };
}

const templates: Record<TemplateType, (b: Booking) => { subject: string; html: string }> = {
  booking_confirmed: template_booking_confirmed,
  "8_days_before": template_8_days_before,
  day_before_arrival: template_day_before_arrival,
  checkin_ready: template_checkin_ready,
  morning_after: template_morning_after,
  day_before_checkout: template_day_before_checkout,
  post_checkout: template_post_checkout,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { template, bookingId } = await req.json();
    if (!template || !bookingId) {
      return new Response(JSON.stringify({ error: "Missing template or bookingId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const templateFn = templates[template as TemplateType];
    if (!templateFn) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template}`, available: Object.keys(templates) }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: booking, error: dbError } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
    if (dbError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { subject, html } = templateFn(booking as Booking);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Villa Verde Miami <bookings@collectiveint.com>", to: [booking.guest_email], subject, html }),
    });
    const emailResult = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", emailResult);
      return new Response(JSON.stringify({ error: "Failed to send email", detail: emailResult }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("guest_emails_log").insert({ booking_id: bookingId, template, sent_to: booking.guest_email }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify({ success: true, template, emailId: emailResult.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
