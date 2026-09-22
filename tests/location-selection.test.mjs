import test from 'node:test';
import assert from 'node:assert/strict';
import {locationSelection} from '../src/location-selection.mjs';
import {resolveMapPin} from '../server/resolve-map-pin.mjs';

test('the actual copied Manga Mandi Plus Code selects its cell center offline',async()=>{
  const text='832G+9WX, District, Manga Mandi, Lahore, Pakistan';
  const selection=locationSelection(text);
  assert.equal(selection.kind,'pin');
  assert(Math.abs(selection.location.lat-31.3009875)<1e-9);
  assert(Math.abs(selection.location.lng-74.077359375)<1e-9);
  assert.deepEqual(await resolveMapPin(text,()=>{throw new Error('Network must not be used');}),selection.location);
  assert.deepEqual(locationSelection('8J3P832G+9WX').location,selection.location);
});

test('unknown towns stay Google Plus Code destinations without guessing coordinates',()=>{
  for(const value of ['832G+9WX, Karachi, Pakistan','9W+XX, Manga Mandi','832G+9WX, Manga Mandi Road, Karachi']){
    const selection=locationSelection(value);
    assert.equal(selection.location,null);
    assert.equal(selection.kind,'plus');
    assert.equal(new URL(selection.mapUrl).searchParams.get('query'),value);
  }
  assert.throws(()=>locationSelection('832G+9WX'),/Include the town/);
});

test('name and area work without coordinates and are clearly an address search',()=>{
  const selection=locationSelection('Al Jannat Shadi Hall, Manga Mandi');
  assert.equal(selection.kind,'search');assert.equal(selection.location,null);
  assert.equal(new URL(selection.mapUrl).searchParams.get('query'),'Al Jannat Shadi Hall, Manga Mandi');
});

test('Google link variants and share-sheet text remain usable without coordinates',()=>{
  for(const url of ['https://maps.app.goo.gl/hall','https://goo.gl/maps/hall','https://share.google/hall','https://search.app/hall','https://g.co/kgs/hall','https://www.google.com/maps/place/Marriage+Hall/','https://www.google.com/maps?cid=123','https://www.google.com/maps/dir/Home/Hall','https://www.google.com/maps/@31,74,15z','https://www.google.com.pk/maps/place/Hall']){
    assert.equal(locationSelection(url).mapUrl,url);
    assert.equal(locationSelection(url).location,null);
  }
  assert.equal(locationSelection('Our wedding hall\nhttps://maps.app.goo.gl/hall').mapUrl,'https://maps.app.goo.gl/hall');
  assert.equal(locationSelection('http://maps.google.com/?q=Hall').mapUrl,'https://maps.google.com/?q=Hall');
  assert.throws(()=>locationSelection('javascript:alert(1)'),/Google Maps link/);
  assert.throws(()=>locationSelection('https://evil.example/maps/hall'),/Google Maps link/);
  assert.throws(()=>locationSelection('91,181'),/Check the coordinates/);
});

test('short Google app links resolve only through allowlisted redirects',async()=>{
  const point=await resolveMapPin('https://share.google/hall',async()=>new Response(null,{status:302,headers:{location:'https://www.google.com/maps/place/Hall/data=!3d31.3!4d74.07'}}));
  assert.deepEqual(point,{lat:31.3,lng:74.07});
  let count=0;
  await assert.rejects(()=>resolveMapPin('https://share.google/hall',async()=>{count++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});}),/supported Google Maps/);
  assert.equal(count,1);
});
