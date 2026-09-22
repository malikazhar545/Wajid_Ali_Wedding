import { invitationId, invitationPath, invitationTitle } from '../src/invitation-link.mjs';
import { defaultSettings } from './defaults.mjs';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const headers = { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex, nofollow', 'Referrer-Policy':'no-referrer' };

export async function invitationPage(request, { store, template }) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status:405, headers:{...headers, Allow:'GET, HEAD'}});
  const url = new URL(request.url);
  const pathname = url.pathname.startsWith('/.netlify/functions/invitation') ? `/invite/${url.searchParams.get('path') || ''}` : url.pathname;
  const id = invitationId(pathname);
  const guest = id ? await store.get(`guests/${id}`) : null;
  if (!guest) return new Response(request.method === 'HEAD' ? null : '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Invitation unavailable</title><body><h1>Invitation unavailable</h1><p>Please contact the family for your personal invitation link.</p></body></html>', {status:404, headers});
  const settings = await store.get('settings');
  const groom = !settings?.groom || settings.groom === 'Wajid' ? defaultSettings.groom : settings.groom;
  const title = invitationTitle(guest, groom);
  const description = 'With love and duas, please join us for this blessed celebration. Open your personal wedding invitation for your functions, dates and venue.';
  const canonical = `${url.origin}${invitationPath(guest)}`;
  const image = `${url.origin}/wedding-share-card.png`;
  const meta = `
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escape(groom)} Wedding">
    <meta property="og:title" content="${escape(title)}">
    <meta property="og:description" content="${escape(description)}">
    <meta property="og:url" content="${escape(canonical)}">
    <meta property="og:image" content="${escape(image)}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="A burgundy and ivory floral wedding invitation card">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(title)}">
    <meta name="twitter:description" content="${escape(description)}">
    <meta name="twitter:image" content="${escape(image)}">
    <link rel="canonical" href="${escape(canonical)}">
  `;
  const html = template.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta\s+name="description"[^>]*>/i, '').replace('</head>', `${meta}</head>`);
  return new Response(request.method === 'HEAD' ? null : html, {headers});
}
