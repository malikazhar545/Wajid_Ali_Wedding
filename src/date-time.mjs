// Keep ambiguous, hand-edited dates unconfirmed until the organizer chooses one.
export function confirmedDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : '';
}

export function clockTime(value) {
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return value;
  const match = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(value || '');
  if (!match) return '';
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

export const editableSettings = settings => ({
  ...settings,
  events: settings.events.map(event => ({ ...event, date: confirmedDate(event.date), time: clockTime(event.time), location:event.location || null })),
});
