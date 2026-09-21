import React,{useState} from 'react';
import {Search,ExternalLink,MapPin} from 'lucide-react';
export default function GoogleLocationSearch({query,area,onSearch,onPin}) {
  const [search,setSearch]=useState(''),[input,setInput]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const find=()=>{if(search.trim())onSearch(`${search.trim()}, ${area||'Lahore'}, Pakistan`);};
  const useLocation=async()=>{
    if(busy)return;
    setBusy(true);setError('');
    try{
      const response=await fetch('/api/admin/map-pin',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:input.trim()})});
      let result;
      try{result=await response.json();}catch{throw new Error('The location could not be read. Please try again.');}
      if(!response.ok)throw new Error(result.error||'Please check the location and try again.');
      onPin(result.location);
    }catch(err){setError(err.message||'The location could not be read. Please try again.');}finally{setBusy(false);}
  };
  return <div className="google-location-search">
    <label htmlFor="google-landmark-search">Find a nearby shop or landmark</label>
    <div className="google-search-row"><input id="google-landmark-search" aria-label="Search Google landmarks" value={search} placeholder="e.g. Life Line Med Mart" onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();find();}}}/><button type="button" className="secondary-button" disabled={!search.trim()} onClick={find}><Search size={16}/> Search</button></div>
    <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`} title="Google Maps landmarks and venue preview" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
    <a className="text-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open Google Maps to choose your spot</a>
    <p className="google-pin-help">In Google Maps, long-press your exact entrance on mobile, or right-click on a computer. Copy its coordinates or location link, then paste below.</p>
    <label htmlFor="google-pin-input">Google Maps link or coordinates</label>
    <div className="google-pin-input"><input id="google-pin-input" value={input} placeholder="Paste Google Maps link or latitude, longitude" autoComplete="off" onChange={e=>{setInput(e.target.value);setError('');}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();useLocation();}}}/><button type="button" className="secondary-button" disabled={busy||!input.trim()} onClick={useLocation}><MapPin size={15}/>{busy?'Reading location…':'Preview this pin'}</button></div>
    {error&&<p className="map-picker-error" role="alert">{error}</p>}
  </div>;
}
