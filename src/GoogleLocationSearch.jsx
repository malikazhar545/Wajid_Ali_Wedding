import React,{useState} from 'react';
import {Search,ExternalLink} from 'lucide-react';

export default function GoogleLocationSearch({query,area,onSearch,onManual}) {
  const [search,setSearch]=useState('');
  const find=()=>{if(search.trim())onSearch([search.trim(),area].filter(Boolean).join(', '));};
  return <div className="google-location-search">
    <p className="google-pin-help google-selection-note">For a listed marriage hall, shop or nearby landmark, copy its Share link from Google Maps and paste it below. Your written address stays separate.</p>
    <label htmlFor="google-landmark-search">Find any marriage hall, shop or landmark</label>
    <div className="google-search-row"><input id="google-landmark-search" aria-label="Search Google landmarks" value={search} placeholder="e.g. Al Jannat Shadi Hall, Manga Mandi" onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();find();}}}/><button type="button" className="secondary-button" disabled={!search.trim()} onClick={find}><Search size={16}/> Search</button></div>
    <p className="google-pin-help">This is a preview. To select by clicking, <button type="button" className="text-button" onClick={onManual}>drop a pin anywhere</button>. To use a Google listing, paste its link below.</p>
    <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`} title="Google Maps landmarks and venue preview" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
    <a className="text-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open Google Maps to choose your spot</a>
  </div>;
}
