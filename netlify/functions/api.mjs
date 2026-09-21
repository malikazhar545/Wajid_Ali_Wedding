import { getStore } from '@netlify/blobs';
import { createApi } from '../../server/api.mjs';

export default async request => {
  const context = process.env.CONTEXT || 'production';
  const name = context === 'production' ? 'wajid-wedding' : `wajid-wedding-${process.env.DEPLOY_ID || context}`;
  const blobs = getStore({ name, consistency: 'strong' });
  const store = {
    get: key => blobs.get(key, { type: 'json' }),
    set: (key, value) => blobs.setJSON(key, value),
    delete: key => blobs.delete(key),
    guests: async () => {
      const guests = [];
      for await (const page of blobs.list({ prefix: 'guests/', paginate: true })) {
        const records = await Promise.all(page.blobs.map(({ key }) => blobs.get(key, { type: 'json' })));
        guests.push(...records.filter(Boolean));
      }
      return guests;
    },
  };
  return createApi({ store, password: process.env.ADMIN_PASSWORD, username: process.env.ADMIN_USERNAME || 'ma9440863' })(request);
};

export const config = { rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip'] } };
