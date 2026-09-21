import { createHmac, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { defaultSettings, EVENT_IDS } from './defaults.mjs';

const COOKIE = 'wajid_session';
const MAX_AGE = 60 * 60 * 8;
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
const equal = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
const sign = (payload, secret) => createHmac('sha256', secret).update(payload).digest('base64url');
function authenticated(request, secret) {
  const token = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token || !secret) return false;
  const [expires, signature] = token.split('.');
  return !!signature && Number(expires) > Date.now() && equal(signature, sign(expires, secret));
}
function text(value, field, max = 200, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new HttpError(400, `Please enter a valid ${field}.`);
  return value.trim();
}
export function validateGuest(body) {
  if (!body || !Array.isArray(body.events) || !body.events.length || body.events.some(id => !EVENT_IDS.includes(id)) || typeof body.withFamily !== 'boolean') throw new HttpError(400, 'Select at least one valid function.');
  return { name: text(body.name, 'guest name', 100, true), label: text(body.label ?? '', 'guest label', 100), withFamily: body.withFamily, events: EVENT_IDS.filter(id => body.events.includes(id)) };
}
export function validateSettings(body) {
  if (!body || !Array.isArray(body.events) || body.events.length !== 3 || body.events.some(e => !e || typeof e !== 'object')) throw new HttpError(400, 'All three functions are required.');
  const events = EVENT_IDS.map(id => {
    const event = body.events.find(e => e.id === id);
    if (!event) throw new HttpError(400, 'All three functions are required.');
    const date = text(event.date, 'date', 10);
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date)) throw new HttpError(400, 'Please use a valid calendar date.');
    const time = text(event.time, 'time', 5);
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new HttpError(400, 'Please use a valid time.');
    const mapUrl = text(event.mapUrl, 'map link', 1000);
    if (mapUrl) { try { if (new URL(mapUrl).protocol !== 'https:') throw new Error(); } catch { throw new HttpError(400, 'Map links must start with https://.'); } }
    let location = null;
    if (event.location != null) {
      const { lat, lng } = event.location;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new HttpError(400, 'Please select a valid location pin on the map.');
      location = { lat, lng };
    }
    return { id, name: defaultSettings.events.find(e => e.id === id).name, subtitle: text(event.subtitle, 'function subtitle', 150), date, time, venue: text(event.venue, 'venue'), address: text(event.address, 'address', 400), mapUrl, location };
  });
  return { groom: text(body.groom, 'groom name', 100, true), host: text(body.host, 'host', 200, true), message: text(body.message, 'invitation message', 700, true), closing: text(body.closing, 'closing message', 300, true), events };
}
export function createApi({ store, password, username = 'ma9440863', development = false }) {
  const sessionSecret = `${username}:${password}`;
  const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${development ? '' : '; Secure'}`;
  return async request => {
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/(?:\.netlify\/functions\/api|api)/, '') || '/';
      const method = request.method;
      if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) return json({ error: 'Method not allowed.' }, 405);
      if (method !== 'GET') {
        const origin = request.headers.get('origin');
        if (origin && origin !== url.origin) throw new HttpError(403, 'Request origin not allowed.');
      }
      let body;
      if (method === 'POST' || method === 'PUT') {
        if (!request.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415, 'JSON is required.');
        const raw = await request.text();
        if (raw.length > 16000) throw new HttpError(413, 'Request is too large.');
        try { body = JSON.parse(raw); } catch { throw new HttpError(400, 'Invalid request.'); }
      }
      if (path === '/login' && method === 'POST') {
        if (!password || (!development && password.length < 10)) throw new HttpError(503, 'Set ADMIN_PASSWORD to at least 10 characters in Netlify environment variables, then redeploy.');
        const validUsername = typeof body?.username === 'string' && equal(body.username.trim(), username);
        const validPassword = typeof body?.password === 'string' && equal(body.password, password);
        if (!validUsername || !validPassword) throw new HttpError(401, 'The username or password is incorrect. Please try again.');
        const expires = String(Date.now() + MAX_AGE * 1000);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(`${expires}.${sign(expires, sessionSecret)}`, MAX_AGE) });
      }
      if (path === '/logout' && method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
      const saved = await store.get('settings') || structuredClone(defaultSettings);
      const settings = {
        ...saved,
        groom: saved.groom === 'Wajid' ? defaultSettings.groom : saved.groom,
        host: saved.host === 'With love, from our family' ? defaultSettings.host : saved.host,
        message: saved.message === 'With grateful hearts and the blessings of Allah, we invite you to share in the joy of a beautiful new beginning.' ? defaultSettings.message : saved.message,
        closing: saved.closing === 'Your presence is our most cherished gift.' ? defaultSettings.closing : saved.closing,
      };
      if (path === '/public' && method === 'GET') {
        const guests = await store.guests();
        const { events, ...publicSettings } = settings;
        return json({ settings: publicSettings, development, guests: guests.map(({ id, name, label }) => ({ id, name, label })).sort((a, b) => a.name.localeCompare(b.name)) });
      }
      const rsvpMatch = path.match(/^\/invitation\/([a-zA-Z0-9-]{1,80})\/rsvp$/);
      if (rsvpMatch && method === 'PUT') {
        const id = rsvpMatch[1];
        if (!await store.get(`guests/${id}`)) throw new HttpError(404, 'This invitation is no longer available. Please contact the family.');
        if (!body || !['accepted', 'declined'].includes(body.status)) throw new HttpError(400, 'Please choose whether you will attend.');
        const rsvp = { status: body.status, updatedAt: new Date().toISOString() };
        await store.set(`rsvps/${id}`, rsvp);
        return json({ rsvp });
      }
      if (path.startsWith('/invitation/') && method === 'GET') {
        const id = path.slice('/invitation/'.length);
        if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new HttpError(404, 'Invitation not found.');
        const guest = await store.get(`guests/${id}`);
        if (!guest) throw new HttpError(404, 'This invitation is no longer available. Please contact the family.');
        return json({ guest: { ...guest, rsvp: await store.get(`rsvps/${id}`) }, settings: { ...settings, events: settings.events.filter(event => guest.events.includes(event.id)) } });
      }
      if (!path.startsWith('/admin')) throw new HttpError(404, 'Not found.');
      if (!password || !authenticated(request, sessionSecret)) throw new HttpError(401, 'Please sign in to manage invitations.');
      if (path === '/admin' && method === 'GET') {
        const guests = await Promise.all((await store.guests()).map(async guest => ({ ...guest, rsvp: await store.get(`rsvps/${guest.id}`) })));
        return json({ settings, guests: guests.sort((a,b) => a.name.localeCompare(b.name)), development });
      }
      if (path === '/admin/settings' && method === 'PUT') {
        const updated = validateSettings(body);
        await store.set('settings', updated);
        return json(updated);
      }
      if (path === '/admin/guests' && method === 'POST') {
        const guest = { ...validateGuest(body), id: randomUUID() };
        await store.set(`guests/${guest.id}`, guest);
        return json(guest, 201);
      }
      const match = path.match(/^\/admin\/guests\/([a-zA-Z0-9-]{1,80})$/);
      if (match && ['PUT', 'DELETE'].includes(method)) {
        const key = `guests/${match[1]}`;
        if (!await store.get(key)) throw new HttpError(404, 'Guest not found.');
        if (method === 'DELETE') { await store.delete(key); await store.delete(`rsvps/${match[1]}`); return json({ ok: true }); }
        const guest = { ...validateGuest(body), id: match[1] };
        await store.set(key, guest);
        return json({ ...guest, rsvp: await store.get(`rsvps/${match[1]}`) });
      }
      throw new HttpError(404, 'Not found.');
    } catch (error) {
      if (!error.status) console.error('Wedding API:', error);
      return json({ error: error.status ? error.message : 'Something went wrong. Please try again.' }, error.status || 500);
    }
  };
}
