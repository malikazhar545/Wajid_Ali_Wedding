import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGooglePin} from '../src/google-pin.mjs';
import {resolveMapPin} from '../server/resolve-map-pin.mjs';

test('imports exact Google pins while ignoring a place camera position',()=>{
  const expected={lat:31.38136,lng:74.18635};
  assert.deepEqual(parseGooglePin('31.38136, 74.18635'),expected);
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/search/?api=1&query=31.38136%2C74.18635'),expected);
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/place/Venue/@30,70,14z/data=!3d31.38136!4d74.18635'),expected);
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/place/31.38136,74.18635/@30,70,14z'),expected);
  for(const value of ['91,74','31,181','https://www.google.com/maps/@31.3,74.2,15z','https://www.google.com/maps/place/%ZZ','https://evil.example/?q=31.38136,74.18635','https://www.google.com/maps/dir/A/B/data=!3d31.3!4d74.2'])assert.equal(parseGooglePin(value),null);
});

test('resolves Google short links without following untrusted redirects',async()=>{
  const location=await resolveMapPin('https://maps.app.goo.gl/example',async()=>new Response(null,{status:302,headers:{location:'https://www.google.com/maps/place/Venue/data=!3d31.38136!4d74.18635'}}));
  assert.deepEqual(location,{lat:31.38136,lng:74.18635});
  let requests=0;
  await assert.rejects(()=>resolveMapPin('https://maps.app.goo.gl/example',async()=>{requests++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});}),/supported Google Maps/);
  assert.equal(requests,1);
  await assert.rejects(()=>resolveMapPin('https://www.google.com/maps/@31,74,15z'),/no exact pin/);
  await assert.rejects(()=>resolveMapPin('https://maps.app.goo.gl/example',async()=>{throw new Error('Network failed');}),/full Google Maps link/);
});

test('short-link redirects are bounded and coordinates need no network request',async()=>{
  let requests=0;
  await assert.rejects(()=>resolveMapPin('https://maps.app.goo.gl/loop',async()=>{requests++;return new Response(null,{status:302,headers:{location:'https://maps.app.goo.gl/loop'}});}),/could not find an exact pin/);
  assert.equal(requests,5);
  assert.deepEqual(await resolveMapPin('31.29913,74.06948',()=>{throw new Error('No network expected');}),{lat:31.29913,lng:74.06948});
});
