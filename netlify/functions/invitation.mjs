import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { weddingStore } from '../../server/netlify-store.mjs';
import { invitationPage } from '../../server/invitation-page.mjs';

export default async request => {
  try {
    const template = await readFile(resolve('dist/index.html'), 'utf8');
    return await invitationPage(request, {store:weddingStore(), template});
  } catch (error) {
    console.error('Invitation preview:', error);
    return new Response('Your invitation could not be opened. Please try again.', {status:503, headers:{'Cache-Control':'no-store'}});
  }
};
