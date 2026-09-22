import {googleMapsUrl,locationInput,parseGooglePin} from './google-pin.mjs';
import {readPlusCode,plusCodeLink} from './plus-code.mjs';

export const shortMapHosts=['maps.app.goo.gl','goo.gl','share.google','search.app','g.co'];
export function locationSelection(raw) {
  const value=locationInput(raw);
  if(!value||value.length>4000)throw new Error('Paste a map link, Plus Code, or venue name with its area.');
  const location=parseGooglePin(value);
  if(location)return {location,mapUrl:'',query:`${location.lat},${location.lng}`,kind:'pin'};
  const plus=readPlusCode(value);
  if(plus){
    const mapUrl=plusCodeLink(value);
    if(!mapUrl)throw new Error('Include the town after this short Plus Code, for example 832G+9WX, Manga Mandi.');
    return {location:null,mapUrl,query:[plus.code,plus.locality].filter(Boolean).join(', '),kind:'plus'};
  }
  const url=googleMapsUrl(value);
  if(url){
    if(url.href.length>1000)throw new Error('This link is too long. Use Share → Copy link in Google Maps.');
    const placeId=url.searchParams.get('query_place_id');
    const query=placeId?`place_id:${placeId}`:url.searchParams.get('query')||url.searchParams.get('q')||url.searchParams.get('destination')||'';
    return {location:null,mapUrl:url.href,query,kind:'link',short:shortMapHosts.includes(url.hostname)};
  }
  if(/(?:https?:\/\/|www\.|^[a-z][\w+.-]*:)/i.test(value))throw new Error('Use a Google Maps link, or paste the place name and area instead.');
  if(/^[\d\s.,+-]+$/.test(value))throw new Error('Check the coordinates: latitude must be -90 to 90 and longitude -180 to 180.');
  if(value.length<3||value.length>400)throw new Error('Enter a venue or landmark name with its area (3–400 characters).');
  return {location:null,mapUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`,query:value,kind:'search'};
}
