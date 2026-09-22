import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApi } from './server/api.mjs';
import { defaultSettings, demoGuests } from './server/defaults.mjs';
import { invitationPage } from './server/invitation-page.mjs';

export default defineConfig(({ mode }) => ({
  optimizeDeps: { include: ['leaflet'] },
  plugins: [react(), {
    name: 'local-wedding-backend',
    configureServer(server) {
      const dir = resolve(process.env.WEDDING_DATA_DIR || '.local-data');
      const file = resolve(dir, 'wedding.json');
      mkdirSync(dir, { recursive: true });
      let records = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { settings: defaultSettings, ...Object.fromEntries(demoGuests.map(g => [`guests/${g.id}`, g])) };
      const persist = () => { writeFileSync(`${file}.tmp`, JSON.stringify(records, null, 2)); renameSync(`${file}.tmp`, file); };
      persist();
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/invite/')) return next();
        try {
          const template = await server.transformIndexHtml(req.url, readFileSync(resolve('index.html'), 'utf8'));
          const response = await invitationPage(new Request(`http://${req.headers.host}${req.url}`, {method:req.method}), {store:{get:async key=>records[key] || null}, template});
          res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
          res.end(await response.text());
        } catch (error) { next(error); }
      });
      const api = createApi({
        development: true,
        password: process.env.ADMIN_PASSWORD || loadEnv(mode, process.cwd(), '').ADMIN_PASSWORD || 'wajid-local-only',
        username: process.env.ADMIN_USERNAME || loadEnv(mode, process.cwd(), '').ADMIN_USERNAME || 'ma9440863',
        store: {
          get: async key => records[key] || null,
          set: async (key, value) => { records[key] = value; persist(); },
          delete: async key => { delete records[key]; persist(); },
          guests: async () => Object.entries(records).filter(([key]) => key.startsWith('guests/')).map(([, value]) => value),
        },
      });
      server.middlewares.use('/api', async (req, res) => {
        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of req) { size += chunk.length; if (size > 20000) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
          const response = await api(new Request(`http://${req.headers.host}/api${req.url}`, { method: req.method, headers: req.headers, ...(!['GET','HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) }));
          res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
          res.end(await response.text());
        } catch (error) { console.error(error); res.writeHead(500); res.end('Local server error'); }
      });
    },
  }],
}));
