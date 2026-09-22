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
