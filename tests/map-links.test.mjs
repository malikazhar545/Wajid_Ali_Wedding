import test from 'node:test';
import assert from 'node:assert/strict';
import { mapLinks } from '../src/map-links.mjs';

test('saved pin is the destination even when an address or pasted link points elsewhere',()=>{
  const links=mapLinks({venue:'Wedding hall',address:'Full address',mapUrl:'https://maps.app.goo.gl/example',location:{lat:31.5,lng:74.3}});
  assert.equal(new URL(links.directions).searchParams.get('destination'),'31.5,74.3');
  assert.equal(new URL(links.share).searchParams.get('query'),'31.5,74.3');
  assert.equal(new URL(links.embed).searchParams.get('q'),'31.5,74.3');
  assert.equal(links.custom,false);
});
test('address-only invitations get map and directions; unconfirmed venues have no map',()=>{
  assert.equal(mapLinks({venue:'',address:'',mapUrl:''}),null);
  const links=mapLinks({venue:'Royal Hall',address:'Garden Road, Lahore'});
  assert.equal(new URL(links.embed).searchParams.get('q'),'Royal Hall, Garden Road, Lahore');
  assert.equal(new URL(links.directions).searchParams.get('api'),'1');
});
test('Google short links remain shareable; unsafe protocols cannot become map links',()=>{
  const short=mapLinks({mapUrl:'https://maps.app.goo.gl/example'});
  assert.equal(short.share,'https://maps.app.goo.gl/example');
  assert.equal(short.embed,'');
  assert.equal(mapLinks({mapUrl:'javascript:alert(1)'}),null);
});
