import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGooglePin,googlePlaceLink} from '../src/google-pin.mjs';
import {resolveMapPin} from '../server/resolve-map-pin.mjs';

test('imports exact Google pins while ignoring a place camera position',()=>{
  const expected={lat:31.38136,lng:74.18635};
  assert.deepEqual(parseGooglePin('31.38136, 74.18635'),expected);
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/search/?api=1&query=31.38136%2C74.18635'),expected);
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/place/Venue/@30,70,14z/data=!3d31.38136!4d74.18635'),expected);
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/place/31.38136,74.18635/@30,70,14z'),expected);
  for(const value of ['91,74','31,181','https://www.google.com/maps/@31.3,74.2,15z','https://www.google.com/maps/place/%ZZ','https://evil.example/?q=31.38136,74.18635','https://www.google.com/maps/dir/A/B/data=!3d31.3!4d74.2'])assert.equal(parseGooglePin(value),null);
});

test('reads the selected Manga Mandi point, not the different camera coordinates',()=>{
  assert.deepEqual(parseGooglePin('https://www.google.com/maps/place/Manga+Mandi,+Pakistan/@31.2996906,74.0717447,18z/data=!4m6!3m5!1s0x39185706b071549d:0x2454ab657170f454!8m2!3d31.299426!4d74.0700372!16s%2Fg%2F1hc3kg8f2?entry=ttu'),{lat:31.299426,lng:74.0700372});
});

test('allows listing links without inventing coordinates or accepting camera-only URLs',()=>{
  for(const url of ['https://maps.app.goo.gl/hall','https://goo.gl/maps/hall','https://www.google.com/maps/place/Marriage+Hall/','https://www.google.com/maps?cid=123'])assert.equal(googlePlaceLink(url),url);
  for(const url of ['https://maps.app.goo.gl/','https://goo.gl/maps/','https://www.google.com/maps/@31,74,15z','https://www.google.com/maps/dir/A/B','https://evil.example/maps/place/hall','https://www.google.com/maps/search/?api=1&query=hall'])assert.equal(googlePlaceLink(url),null);
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
