import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/api.mjs';
import { defaultSettings } from '../server/defaults.mjs';

function fixture(options = {}) {
  const records = new Map();
  const store = { get: async key => records.get(key) || null, set: async (key,value) => records.set(key,value), delete: async key => records.delete(key), guests: async () => [...records.entries()].filter(([key])=>key.startsWith('guests/')).map(([,value])=>value) };
  const handler = createApi({ store, password: 'a-test-password-that-is-long', ...options });
  let cookie='';
  const request=async(path,method='GET',body,headers={})=>handler(new Request(`https://wedding.example/api${path}`,{method,headers:{'Content-Type':'application/json',cookie,...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})}));
  const login=async()=>{const r=await request('/login','POST',{username:'ma9440863',password:'a-test-password-that-is-long'});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];return r;};
  return {request,login,records,setCookie:value=>{cookie=value;}};
}
const guest = { name: 'Ahmed Ali', label: 'Lahore', events: ['baraat'], withFamily: true };

test('guest RSVP persists, updates, appears in admin and survives organizer edits',async()=>{
  const f=fixture();await f.login();
  const g=await (await f.request('/admin/guests','POST',guest)).json();
  const other=await (await f.request('/admin/guests','POST',{...guest,name:'Other guest'})).json();
  f.setCookie('');
  let card=await (await f.request(`/invitation/${g.id}`)).json();
  assert.equal(card.guest.rsvp,null);
  const accepted=await f.request(`/invitation/${g.id}/rsvp`,'PUT',{status:'accepted',events:['walima'],name:'Changed name'});
  assert.equal(accepted.status,200);
  const {rsvp}=await accepted.json();
  assert.equal(rsvp.status,'accepted');assert(Number.isFinite(Date.parse(rsvp.updatedAt)));
  card=await (await f.request(`/invitation/${g.id}`)).json();
  assert.deepEqual(card.guest.rsvp,rsvp);assert.equal(card.guest.name,guest.name);assert.deepEqual(card.guest.events,['baraat']);
  assert.equal((await (await f.request(`/invitation/${other.id}`)).json()).guest.rsvp,null);
  const directory=await (await f.request('/public')).json();
  assert(directory.guests.every(item=>!('rsvp' in item)));
  await f.login();
  const admin=await (await f.request('/admin')).json();
  assert.deepEqual(admin.guests.find(item=>item.id===g.id).rsvp,rsvp);
  const edit=await (await f.request(`/admin/guests/${g.id}`,'PUT',{...guest,name:'Updated guest',events:['mehndi'],rsvp:{status:'declined'}})).json();
  assert.deepEqual(edit.rsvp,rsvp);
  f.setCookie('');
  assert.equal((await f.request(`/invitation/${g.id}/rsvp`,'PUT',{status:'declined'})).status,200);
  card=await (await f.request(`/invitation/${g.id}`)).json();
  assert.equal(card.guest.rsvp.status,'declined');assert.equal(card.guest.name,'Updated guest');assert.deepEqual(card.guest.events,['mehndi']);
  await f.login();await f.request(`/admin/guests/${g.id}`,'DELETE');
  assert.equal(f.records.has(`rsvps/${g.id}`),false);
  assert.equal((await f.request(`/invitation/${g.id}/rsvp`,'PUT',{status:'accepted'})).status,404);
});

test('RSVP rejects invalid replies and cross-origin writes without changing the saved reply',async()=>{
  const f=fixture();f.records.set('guests/test',{...guest,id:'test'});
  await f.request('/invitation/test/rsvp','PUT',{status:'accepted'});
  for(const body of [null,{}, {status:'pending'}, {status:true},{status:['accepted']}]) {
    assert.equal((await f.request('/invitation/test/rsvp','PUT',body)).status,400);
  }
  assert.equal((await f.request('/invitation/test/rsvp','PUT',{status:'declined'},{origin:'https://other.example'})).status,403);
  assert.equal((await f.request('/invitation/missing/rsvp','PUT',{status:'accepted'})).status,404);
  assert.equal(f.records.get('rsvps/test').status,'accepted');
  assert.equal((await f.request('/admin')).status,401);
});

test('redesign preserves saved wedding dates, venues, custom wording and guest records',async()=>{
  const f=fixture();
  const saved=structuredClone(defaultSettings);
  saved.groom='Wajid';saved.host='Our parents and family';saved.message='Our own invitation message.';
  saved.events[0]={...saved.events[0],date:'2027-02-12',venue:'Family Garden',address:'Our chosen address',location:{lat:31.5,lng:74.3}};
  f.records.set('settings',saved);f.records.set('guests/retained',{...guest,id:'retained',events:['mehndi']});
  const card=await (await f.request('/invitation/retained')).json();
  assert.equal(card.settings.groom,'Wajid Ali');
  assert.equal(card.settings.host,saved.host);assert.equal(card.settings.message,saved.message);
  assert.deepEqual(card.settings.events,[saved.events[0]]);
  assert.equal(card.guest.name,guest.name);
  assert.equal(f.records.get('settings').groom,'Wajid');
});

test('admin requires authentication and rejects bad password / forged sessions', async()=>{
  const f=fixture();
  assert.equal((await f.request('/admin')).status,401);
  assert.equal((await f.request('/admin/guests','POST',guest)).status,401);
  assert.equal((await f.request('/login','POST',{password:'wrong'})).status,401);
  assert.equal((await f.request('/login','POST',{username:'wrong-user',password:'a-test-password-that-is-long'})).status,401);
  assert.equal((await f.request('/login','POST',{password:'a-test-password-that-is-long'})).status,401);
  f.setCookie('wajid_session=9999999999999.forged');
  assert.equal((await f.request('/admin')).status,401);
  const r=await f.login();
  assert.match(r.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  assert.match(r.headers.get('set-cookie'),/Secure/);
  assert.equal((await f.request('/admin')).status,200);
});

test('configured username and ten-character password work in production; sessions stay private',async()=>{
  const f=fixture({username:'organizer',password:'test/123%X'});
  const response=await f.request('/login','POST',{username:'organizer',password:'test/123%X'});
  assert.equal(response.status,200);
  assert.match(response.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  assert.match(response.headers.get('set-cookie'),/Secure/);
  const publicData=await (await f.request('/public')).json();
  assert.equal(publicData.username,undefined);
  assert.equal(publicData.password,undefined);
});
test('guest CRUD, per-guest function filtering, family selection and live date updates',async()=>{
  const f=fixture();await f.login();
  const created=await f.request('/admin/guests','POST',guest);
  assert.equal(created.status,201);const g=await created.json();
  const directory=await (await f.request('/public')).json();
  assert.deepEqual(Object.keys(directory.guests[0]).sort(),['id','label','name']);
  assert.equal(directory.settings.events,undefined);
  let invitation=await (await f.request(`/invitation/${g.id}`)).json();
  assert.equal(invitation.guest.withFamily,true);
  assert.deepEqual(invitation.settings.events.map(e=>e.id),['baraat']);
  assert.equal(invitation.settings.events[0].date,defaultSettings.events[1].date);
  const settings=structuredClone(defaultSettings);settings.events[1].date='2026-12-18';settings.events[1].time='19:30';
  assert.equal((await f.request('/admin/settings','PUT',settings)).status,200);
  invitation=await (await f.request(`/invitation/${g.id}`)).json();
  assert.equal(invitation.settings.events[0].date,'2026-12-18');
  await f.request(`/admin/guests/${g.id}`,'PUT',{...guest,withFamily:false,events:['mehndi','walima']});
  invitation=await (await f.request(`/invitation/${g.id}`)).json();
  assert.equal(invitation.guest.withFamily,false);
  assert.deepEqual(invitation.settings.events.map(e=>e.id),['mehndi','walima']);
  assert.equal((await f.request(`/admin/guests/${g.id}`,'DELETE')).status,200);
  assert.equal((await f.request(`/invitation/${g.id}`)).status,404);
});
test('rejects invalid function selections, dates and unsafe location links',async()=>{
  const f=fixture();await f.login();
  for(const invalid of [{...guest,events:[]},{...guest,events:['unknown']},{...guest,name:' '},{...guest,withFamily:'yes'}]) assert.equal((await f.request('/admin/guests','POST',invalid)).status,400);
  for(const [field,value] of [['date','2026-02-30'],['time','25:00'],['mapUrl','javascript:alert(1)']]){const s=structuredClone(defaultSettings);s.events[0][field]=value;assert.equal((await f.request('/admin/settings','PUT',s)).status,400);}
  for(const location of [{lat:91,lng:74},{lat:31,lng:181},{lat:'31',lng:74},{}]){const s=structuredClone(defaultSettings);s.events[0].location=location;assert.equal((await f.request('/admin/settings','PUT',s)).status,400);}
});
test('exact venue pin and address persist and only appear on invited functions',async()=>{
  const f=fixture();await f.login();
  const g=await (await f.request('/admin/guests','POST',guest)).json();
  const settings=structuredClone(defaultSettings);
  settings.events[1].location={lat:31.5,lng:74.3};
  settings.events[1].venue='Wedding Hall';settings.events[1].address='Garden Road, Lahore';
  assert.equal((await f.request('/admin/settings','PUT',settings)).status,200);
  const invitation=await (await f.request(`/invitation/${g.id}`)).json();
  assert.equal(invitation.settings.events.length,1);
  assert.deepEqual(invitation.settings.events[0].location,{lat:31.5,lng:74.3});
  assert.equal(invitation.settings.events[0].address,'Garden Road, Lahore');
});
test('cross-origin mutations denied; logout expires session; short production password fails closed',async()=>{
  const f=fixture();await f.login();
  assert.equal((await f.request('/admin/guests','POST',guest,{origin:'https://other.example'})).status,403);
  const logout=await f.request('/logout','POST',{});assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
  f.setCookie('');assert.equal((await f.request('/admin')).status,401);
  const insecure=fixture({password:'short'});assert.equal((await insecure.request('/login','POST',{password:'short'})).status,503);
});
