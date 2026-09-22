export function invitationPath(guest) {
  const slug = guest.name.normalize('NFKC').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'guest';
  return `/invite/${encodeURIComponent(slug)}/${encodeURIComponent(guest.id)}`;
}

export function invitationId(pathname) {
  return pathname.match(/^\/invite\/[^/]+\/([a-zA-Z0-9-]{1,80})\/?$/)?.[1] || null;
}

export function invitationTitle(guest, groom = 'Wajid Ali') {
  return `${groom} invites you, ${guest.name}, to his wedding`;
}

const warmed = new Map();
export async function warmInvitationPreview(guest) {
  const path = invitationPath(guest), now = Date.now();
  for (const [key, expires] of warmed) if (expires <= now) warmed.delete(key);
  if (warmed.has(path)) return;
  warmed.set(path, now + 45000);
  try {
    const response = await fetch(path, {credentials:'omit'});
    await response.arrayBuffer();
    if (!response.ok) warmed.delete(path);
  } catch { warmed.delete(path); }
}
