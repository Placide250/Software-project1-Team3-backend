// Add `months` to a date, clamping to the last valid day (UTC).
// Solves problem where adding a month to Jan 31 gives Mar 3
// * used AI for this *
export function addMonthsClamped(anchor, months) {
  const targetDay = anchor.getUTCDate();
  const d = new Date(anchor);
  d.setUTCDate(1); // avoid overflow while changing month
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(targetDay, lastDay)); // clamp: Jan 31 + 1mo -> Feb 28
  return d;
}

// The nth occurrence date, computed from 'start'
export function nthDate(start, frequency, n) {
  const d = new Date(start);
  switch (frequency) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + n);
      break;
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7 * n);
      break;
    case "biweekly":
      d.setUTCDate(d.getUTCDate() + 14 * n);
      break;
    case "monthly":
      return addMonthsClamped(start, n);
  }
  return d;
}

// Combine a date with a "HH:mm" time, in UTC.
export function combineDateAndTime(date, timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const dt = new Date(date);
  dt.setUTCHours(h, m, 0, 0);
  return dt;
}
