import { weddingStore } from '../../server/netlify-store.mjs';
import { createApi } from '../../server/api.mjs';

export default async request => {
  const store = weddingStore();
  return createApi({ store, password: process.env.ADMIN_PASSWORD, username: process.env.ADMIN_USERNAME || 'ma9440863' })(request);
};

export const config = { rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip'] } };
