import {googleMapsUrl,parseGooglePin} from '../src/google-pin.mjs';

const fail=message=>Object.assign(new Error(message),{status:400});
export async function resolveMapPin(value,fetcher=fetch) {
  if(typeof value!=='string'||value.length>4000)throw fail('Paste coordinates or a Google Maps location link.');
  const point=parseGooglePin(value);
  if(point)return point;
  let url=googleMapsUrl(value);
  if(!url)throw fail('Use a Google Maps link or coordinates such as 31.38136, 74.18635.');
  if(!['maps.app.goo.gl','goo.gl'].includes(url.hostname))throw fail('This link has no exact pin. Open Google Maps, copy the coordinates of your entrance, and paste them here.');
  const signal=AbortSignal.timeout(8000);
  for(let hop=0;hop<5;hop++){
    let response;
    try{response=await fetcher(url.href,{redirect:'manual',signal,headers:{Accept:'text/html'}});}catch{throw fail('This short link could not be opened. Paste the full Google Maps link or the pin coordinates.');}
    const redirect=response.headers.get('location');
    await response.body?.cancel();
    if(![301,302,303,307,308].includes(response.status)||!redirect)break;
    let next;
    try{next=new URL(redirect,url);}catch{break;}
    url=googleMapsUrl(next.href);
    if(!url)throw fail('This link does not lead to a supported Google Maps location.');
    const pin=parseGooglePin(url.href);
    if(pin)return pin;
  }
  throw fail('We could not find an exact pin in this link. Copy coordinates from Google Maps and paste them here.');
}
