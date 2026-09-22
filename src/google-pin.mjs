export function googleMapsUrl(value) {
  try {
    const url=new URL(value.trim());
    if(url.protocol!=='https:' || url.username || url.password || url.port)return null;
    if(!['google.com','www.google.com','maps.google.com','maps.app.goo.gl','goo.gl'].includes(url.hostname))return null;
    if(url.hostname==='goo.gl'&&!url.pathname.startsWith('/maps/'))return null;
    if(['google.com','www.google.com'].includes(url.hostname)&&!url.pathname.startsWith('/maps'))return null;
    return url;
  } catch {return null;}
}
function coordinates(value) {
  const match=value?.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if(!match)return null;
  const lat=Number(match[1]),lng=Number(match[2]);
  return Math.abs(lat)<=90 && Math.abs(lng)<=180?{lat,lng}:null;
}
export function parseGooglePin(value) {
  const direct=coordinates(value);
  if(direct)return direct;
  const url=googleMapsUrl(value);
  if(!url)return null;
  for(const name of ['query','q','destination']) {
    const point=coordinates(url.searchParams.get(name));
    if(point)return point;
  }
  let path;
  try{path=decodeURIComponent(url.pathname);}catch{return null;}
  if(path.startsWith('/maps/dir'))return null;
  const point=path.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if(point)return coordinates(`${point[1]},${point[2]}`);
  const coordinatePlace=path.match(/\/maps\/place\/(-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?)(?:\/|$)/);
  if(coordinatePlace)return coordinates(coordinatePlace[1]);
  // @lat,lng describes the camera viewport, not necessarily the selected place.
  return null;
}

// A shared listing is useful even when Google does not expose its coordinates.
// Camera-only and route URLs must not masquerade as a selected place.
export function googlePlaceLink(value) {
  const url=googleMapsUrl(value);
  if(!url || url.href.length>1000)return null;
  if(url.hostname==='maps.app.goo.gl')return url.pathname.length>1?url.href:null;
  if(url.hostname==='goo.gl')return url.pathname.length>6?url.href:null;
  if(url.pathname.startsWith('/maps/dir'))return null;
  if(/^\/maps\/place\/[^/]+/.test(url.pathname) || url.searchParams.get('query_place_id') || url.searchParams.get('cid') || url.searchParams.get('q')?.startsWith('place_id:'))return url.href;
  return null;
}
