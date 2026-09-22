import olc from 'open-location-code';
import {locationAreas} from './location-areas.mjs';

const codes=new olc.OpenLocationCode();
export function readPlusCode(value) {
  if(typeof value!=='string')return null;
  const match=value.trim().match(/^([23456789CFGHJMPQRVWX0]{0,8}\+[23456789CFGHJMPQRVWX]{2,7})(?:[\s,]+(.+))?$/i);
  if(!match||!codes.isValid(match[1]))return null;
  const code=match[1].toUpperCase(),locality=match[2]?.trim()||'';
  if(!codes.isShort(code)&&!codes.isFull(code))return null;
  let fullCode=code;
  if(codes.isShort(code)){
    // Do not guess a missing town from the map viewport. Unknown towns remain
    // Google destinations until an exact pin is available.
    const area=Object.keys(locationAreas).find(name=>new RegExp(`(?:^|,)\\s*${name.replace(/ /g,'\\s+')}\\s*(?:,|$)`,'i').test(locality));
    if(!area)return {code,locality,location:null};
    const [lat,lng]=locationAreas[area];
    // Very short codes need a street-level reference, not a whole town center.
    if(code.indexOf('+')<4)return {code,locality,location:null};
    fullCode=codes.recoverNearest(code,lat,lng);
  }
  const decoded=codes.decode(fullCode);
  return {code,locality,location:{lat:decoded.latitudeCenter,lng:decoded.longitudeCenter}};
}

export function plusCodeLink(value) {
  const result=readPlusCode(value);
  if(!result||(!result.location&&!result.locality))return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([result.code,result.locality].filter(Boolean).join(', '))}`;
}
