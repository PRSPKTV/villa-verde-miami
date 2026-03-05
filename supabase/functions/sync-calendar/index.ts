import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ICAL_FEEDS: Record<string, string> = {

};

interface CalEvent {
  dtstart: string;
  dtend: string;
  summary: string;
}

function parseIcal(icalText: string): CalEvent[] {
  const events: CalEvent[] = [];
  const blocks = icalText.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const dtstart = block.match(/DTSTART(?:;VALUE=DATE):([\d]+)/)?.[1] || "";
    const dtend = block.match(/DTEND(?:;VALUE=DATE):([\d]+)/)?.[1] || "";
    const summary = block.match(/SUMMARY:(.*)/)?.[1]?.trim() || "";

    if (dtstart && dtend) {
      events.push({ dtstart, dtend, summary });
    }
  }
  return events;
}

function parseDate(d: string): string {
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(parseDate(start));
  const endDate = new Date(parseDate(end));

  while (current < endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const slugParam = url.searchParams.get("slug");
    const feedsToSync = slugParam
      ? { [slugParam]: ICAL_FEEDS[slugParam] }
      : ICAL_FEEDS;

    const results: Record<string, { synced: number; error?: string }> = {};

    for (const [slug, icalUrl] of Object.entries(feedsToSync)) {
      if (!icalUrl) {
        results[slug] = { synced: 0, error: "Unknown property slug" };
        continue;
      }

      try {
        const response = await fetch(icalUrl);
        if (!response.ok) {
          results[slug] = { synced: 0, error: `HTTP ${response.status}` };
          continue;
        }

        const icalText = await response.text();
        const events = parseIcal(icalText);

        const rows: { property_slug: string; date: string; is_blocked: boolean; source: string; summary: string; updated_at: string }[] = [];

        for (const event of events) {
          const dates = getDateRange(event.dtstart, event.dtend);
          for (const date of dates) {
            rows.push({
              property_slug: slug,
              date,
              is_blocked: true,
              source: "airbnb",
              summary: event.summary,
              updated_at: new Date().toISOString(),
            });
          }
        }

        if (rows.length > 0) {
          await supabase
            .from("calendar_availability")
            .delete()
            .eq("property_slug", slug)
            .eq("source", "airbnb");

          for (let j = 0; j < rows.length; j += 500) {
            const batch = rows.slice(j, j + 500);
            const { error } = await supabase
              .from("calendar_availability")
              .upsert(batch, { onConflict: "property_slug,date" });

            if (error) {
              results[slug] = { synced: 0, error: error.message };
              break;
            }
          }

          if (!results[slug]?.error) {
            results[slug] = { synced: rows.length };
          }
        } else {
          results[slug] = { synced: 0 };
        }
      } catch (err) {
        results[slug] = { synced: 0, error: (err as Error).message };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
