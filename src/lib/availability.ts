import ical from 'node-ical';
import type { VEvent, ParameterValue } from 'node-ical';

export interface AvailableSlot {
  /** YYYY-MM-DD for all-day events, YYYY-MM-DDTHH:MM for timed events */
  value: string;
  /** Human-readable label shown in the <select> */
  label: string;
}

/** How many days ahead to surface availability */
const WINDOW_DAYS = 90;
const TZ = 'Europe/Belgrade';

export async function getAvailableSlots(
  icsUrl: string,
  summaryPrefix: string,
): Promise<{ slots: AvailableSlot[]; error: boolean }> {
  try {
    const events = await ical.async.fromURL(icsUrl);

    const now = new Date();
    const cutoff = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const prefix = summaryPrefix.toLowerCase();

    const seen = new Set<string>();
    const slots: AvailableSlot[] = [];

    for (const component of Object.values(events)) {
      if (!component || component.type !== 'VEVENT') continue;
      const event = component as VEvent;

      if (event.status === 'CANCELLED') continue;
      if (!summaryMatches(event.summary, prefix)) continue;

      if (event.rrule) {
        // Recurring event with RRULE — expand all instances within our window
        const instances = ical.expandRecurringEvent(event, { from: now, to: cutoff });
        for (const instance of instances) {
          if (instance.start <= now || instance.start > cutoff) continue;
          const { value, label } = formatSlot(instance.start, instance.isFullDay);
          if (!seen.has(value)) {
            seen.add(value);
            slots.push({ value, label });
          }
        }
      } else if (event.recurrences) {
        // Google Calendar exports recurring events as individual VEVENTs sharing a UID,
        // each with a RECURRENCE-ID. node-ical collects them under event.recurrences.
        // Each date gets two keys (YYYY-MM-DD and full ISO), so seen deduplicates them.
        for (const recurrence of Object.values(event.recurrences)) {
          const start = recurrence.start;
          if (!start || start <= now || start > cutoff) continue;
          if (recurrence.status === 'CANCELLED') continue;
          const isAllDay = recurrence.datetype === 'date';
          const { value, label } = formatSlot(start, isAllDay);
          if (!seen.has(value)) {
            seen.add(value);
            slots.push({ value, label });
          }
        }
      } else {
        // Single event
        const start = event.start;
        if (!start || start <= now || start > cutoff) continue;
        const isAllDay = event.datetype === 'date';
        const { value, label } = formatSlot(start, isAllDay);
        if (!seen.has(value)) {
          seen.add(value);
          slots.push({ value, label });
        }
      }
    }

    return {
      slots: slots.sort((a, b) => a.value.localeCompare(b.value)),
      error: false,
    };
  } catch (err) {
    console.error('[availability] ICS fetch failed:', err);
    return { slots: [], error: true };
  }
}

/** Extracts the string value from a ParameterValue (plain string or { val: string }). */
function getSummaryString(summary: ParameterValue | undefined): string {
  if (!summary) return '';
  if (typeof summary === 'string') return summary;
  return summary.val ?? '';
}

/** Returns true if the event summary starts with the given lowercase prefix. */
function summaryMatches(summary: ParameterValue | undefined, prefix: string): boolean {
  return getSummaryString(summary).toLowerCase().startsWith(prefix);
}

function formatSlot(date: Date, isFullDay: boolean): { value: string; label: string } {
  if (isFullDay) {
    return {
      value: toLocalDate(date),
      label: formatDate(date),
    };
  }

  const localDate = toLocalDate(date);
  const localTime = toLocalTime(date);
  return {
    value: `${localDate}T${localTime}`,
    label: `${formatDate(date)} at ${localTime}`,
  };
}

/** Returns YYYY-MM-DD in the guide's local timezone (en-CA gives that format). */
function toLocalDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Returns HH:MM in the guide's local timezone. */
function toLocalTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  });
}

/** Returns a friendly date string like "Sat, 14 June 2025". */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  });
}
