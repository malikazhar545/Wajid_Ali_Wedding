import test from 'node:test';
import assert from 'node:assert/strict';
import { warmInvitationPreview } from '../src/invitation-link.mjs';

test('sharing warms only the selected link without family credentials and deduplicates requests',async()=>{
  const original=globalThis.fetch, calls=[];
  globalThis.fetch=async(path,options)=>{calls.push({path,options});return new Response('preview');};
  try {
    const guest={id:'warm-guest',name:'Ahmed Ali'};
    await Promise.all([warmInvitationPreview(guest),warmInvitationPreview(guest)]);
    assert.deepEqual(calls,[{path:'/invite/ahmed-ali/warm-guest',options:{credentials:'omit'}}]);
    await warmInvitationPreview({...guest,id:'other-guest',name:'Other Guest'});
    assert.equal(calls.length,2);assert.equal(calls[1].path,'/invite/other-guest/other-guest');
  } finally {globalThis.fetch=original;}
});

test('failed warmups do not block sharing and can be retried',async()=>{
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;if(calls===1)throw new Error('offline');return new Response('',{status:calls===2?503:200});};
  try {
    const guest={id:'retry-guest',name:'Guest'};
    await warmInvitationPreview(guest);await warmInvitationPreview(guest);await warmInvitationPreview(guest);
    assert.equal(calls,3);
  } finally {globalThis.fetch=original;}
});
