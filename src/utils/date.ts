/** YYYY-MM-DD in the viewer's own time zone. `toISOString()` is UTC, which in Pakistan is still "yesterday" until 05:00. */
export function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
