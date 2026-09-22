import { getStore } from '@netlify/blobs';

export function weddingStore() {
  const context = process.env.CONTEXT || 'production';
  const name = context === 'production' ? 'wajid-wedding' : `wajid-wedding-${process.env.DEPLOY_ID || context}`;
  const blobs = getStore({ name, consistency:'strong' });
  return {
    get:key => blobs.get(key, {type:'json'}),
    set:(key, value) => blobs.setJSON(key, value),
    delete:key => blobs.delete(key),
    guests:async () => {
      const guests = [];
      for await (const page of blobs.list({prefix:'guests/', paginate:true})) {
        const records = await Promise.all(page.blobs.map(({key}) => blobs.get(key, {type:'json'})));
        guests.push(...records.filter(Boolean));
      }
      return guests;
    },
  };
}
