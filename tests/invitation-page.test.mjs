import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { invitationPage } from '../server/invitation-page.mjs';
import { invitationId, invitationPath, invitationTitle } from '../src/invitation-link.mjs';

const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const guest = {id:'a2b3-secret-token', name:'Ahmed Ali', events:['baraat'], withFamily:true};
const requested = [];
const records = new Map([['guests/'+guest.id, guest],['guests/other-secret',{id:'other-secret',name:'Private Other Guest'}]]);
const store = {get:async key=>{requested.push(key);return records.get(key);}};
const request = (path, method='GET') => new Request('https://wedding.example'+path,{method});

test('names make readable links while the private id selects the guest',()=>{
  assert.equal(invitationPath(guest),'/invite/ahmed-ali/a2b3-secret-token');
  assert.equal(invitationId(invitationPath(guest)),guest.id);
  assert.equal(invitationId('/invite/other-name/'+guest.id),guest.id);
  assert.equal(invitationId('/invite/ahmed-ali'),null);
  assert.equal(invitationId('/invite/name/../../settings'),null);
  assert.equal(invitationId(invitationPath({...guest,name:'احمد علی'})),guest.id);
  assert.equal(invitationPath({...guest,name:' & / ? '}),'/invite/guest/'+guest.id);
});

test('raw HTML gives crawlers a personal title, card image and canonical URL without exposing the directory',async()=>{
  requested.length=0;
  const response=await invitationPage(request(invitationPath(guest)),{store,template});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(response.headers.get('netlify-cdn-cache-control'),'public, durable, max-age=60');
  assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
  const html=await response.text();
  assert(html.includes(`<title>${invitationTitle(guest)}</title>`));
  assert(html.includes(`property="og:title" content="${invitationTitle(guest)}"`));
  assert(html.includes('property="og:image" content="https://wedding.example/wedding-share-card-v2.jpg"'));
  assert(html.includes('property="og:image:width" content="1200"'));
  assert(html.includes('property="og:image:type" content="image/jpeg"'));
  assert(html.indexOf('property="og:title"') < html.indexOf('rel="stylesheet"'));
  assert(html.includes(`rel="canonical" href="https://wedding.example${invitationPath(guest)}"`));
  assert.equal((html.match(/<title>/g)||[]).length,1);
  assert.equal((html.match(/name="description"/g)||[]).length,1);
  assert(!html.includes('Private Other Guest'));assert(!html.includes('other-secret'));
  assert.deepEqual(requested,['guests/'+guest.id,'settings']);
  assert(html.includes('src="/src/main.jsx"'));
});

test('Netlify rewrite and HEAD work; edited names use saved data rather than URL text',async()=>{
  const response=await invitationPage(request('/.netlify/functions/invitation?path=old-name/'+guest.id),{store,template});
  assert.equal(response.status,200);
  assert((await response.text()).includes(invitationTitle(guest)));
  const head=await invitationPage(request(invitationPath(guest),'HEAD'),{store,template});
  assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await invitationPage(request(invitationPath(guest),'POST'),{store,template})).status,405);
});

test('missing links are generic; saved names and titles cannot inject HTML',async()=>{
  const missing=await invitationPage(request('/invite/guessed-name/unknown'),{store,template});
  assert.equal(missing.status,404);
  assert.equal(missing.headers.get('netlify-cdn-cache-control'),null);
  assert(!(await missing.text()).includes('guessed-name'));
  const hostile={...guest,name:'</title><script>alert("x")</script> & guest $&'};
  const hostileStore={get:async key=>key.startsWith('guests/')?hostile:{groom:'Groom " & < >'}};
  const response=await invitationPage(request(invitationPath(guest)),{store:hostileStore,template});
  const html=await response.text();
  assert(!html.includes('<script>alert'));
  assert(html.includes('&lt;/title&gt;&lt;script&gt;'));
  assert(html.includes('Groom &quot; &amp; &lt; &gt;'));
  assert(html.includes('$&amp;'));
});

test('preview reads guest and settings concurrently and does not cache RSVP or other guests',async()=>{
  const reads=[], resolvers=[];
  const pending=invitationPage(request(invitationPath(guest)),{template,store:{get:key=>{
    reads.push(key);return new Promise(resolve=>resolvers.push(()=>resolve(records.get(key))));
  }}});
  assert.deepEqual(reads,['guests/'+guest.id,'settings']);
  resolvers.forEach(resolve=>resolve());
  const response=await pending;
  assert.equal(response.status,200);
  assert(!(await response.text()).includes('rsvp'));
});

test('lighter share image keeps JPEG format and is less than half the original transfer size',async()=>{
  const [jpeg,png]=await Promise.all([
    readFile(new URL('../public/wedding-share-card-v2.jpg',import.meta.url)),
    readFile(new URL('../public/wedding-share-card.png',import.meta.url)),
  ]);
  assert.equal(jpeg.readUInt16BE(0),0xffd8);
  assert(jpeg.length < png.length/2);
});
