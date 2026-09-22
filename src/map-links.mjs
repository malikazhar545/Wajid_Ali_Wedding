export function mapLinks(event) {
  let custom = '';
  let pinnedQuery = '';
  try {
    const url = new URL(event.mapUrl || '');
    if (url.protocol === 'https:') custom = url.href;
    if (['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname)) {
      pinnedQuery = url.searchParams.get('query') || url.searchParams.get('q') || url.searchParams.get('destination') || '';
      const pin = url.pathname.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
      if (pin) pinnedQuery = `${pin[1]},${pin[2]}`;
    }
  } catch { /* An unset link is normal while the venue is unconfirmed. */ }
  const { lat, lng } = event.location || {};
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (hasPin) { pinnedQuery = `${lat},${lng}`; custom = ''; }
  // An unresolved listing link can point to a landmark distinct from the address.
  // Do not show a different address pin alongside that destination.
  const query = pinnedQuery || (custom ? '' : [event.venue, event.address].filter(Boolean).join(', '));
  if (!custom && !query) return null;
  const encoded = encodeURIComponent(query);
  return {
    share: custom || `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    directions: custom || `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
    embed: query ? `https://maps.google.com/maps?q=${encoded}&z=15&output=embed` : '',
    custom: !!custom,
  };
}
