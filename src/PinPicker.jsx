import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, LocateFixed, X, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import GoogleLocationSearch from './GoogleLocationSearch.jsx';
import GooglePinInput from './GooglePinInput.jsx';

// Area centers guide the map only; the organizer still selects the exact entrance.
// Sources: https://mapcarta.com/N303543852, https://mapcarta.com/15006890,
// https://www.latlong.net/place/raiwind-lahore-punjab-pakistan-8336.html
const areas = {
  'Bahria Town Lahore': [31.38136,74.18635,14],
  'Manga Mandi': [31.29913,74.06948,14],
  Raiwind: [31.245659,74.212891,14],
};
const areaBounds = Object.values(areas).map(([lat,lng])=>[lat,lng]);

export default function PinPicker({ event, onChange }) {
  const [open,setOpen] = useState(false);
  const [draft,setDraft] = useState(event.location || null);
  const [draftLink,setDraftLink] = useState('');
  const [pending,setPending] = useState(false);
  const [inputRevision,setInputRevision] = useState(0);
  const [error,setError] = useState('');
  const [locating,setLocating] = useState(false);
  const [activeArea,setActiveArea] = useState('');
  const [view,setView] = useState('google');
  const [googleQuery,setGoogleQuery] = useState('Bahria Town Lahore');
  const [tileError,setTileError] = useState('');
  const dialog = useRef(null), mapElement = useRef(null), map = useRef(null), marker = useRef(null);
  const putPin = useRef(null);
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    modal.showModal();
    const initial = event.location;
    const instance = L.map(mapElement.current, { scrollWheelZoom:false });
    if(initial)instance.setView([initial.lat,initial.lng],17);
    else instance.fitBounds(areaBounds,{padding:[35,35],animate:false});
    map.current = instance;
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      referrerPolicy:'strict-origin-when-cross-origin',
    }).addTo(instance);
    tiles.on('tileerror',()=>setTileError('Map tiles could not load. Check your connection, or try again.'));
    tiles.on('load',()=>setTileError(''));
    const icon = L.divIcon({className:'venue-pin',html:'<span aria-hidden="true"></span>',iconSize:[32,42],iconAnchor:[16,40]});
    const selectPin = latlng => {
      const point = L.latLng(latlng).wrap();
      const next = {lat:Number(point.lat.toFixed(6)),lng:Number(point.lng.toFixed(6))};
      setDraft(next);setDraftLink('');setPending(false);
      setGoogleQuery(`${next.lat},${next.lng}`);
      if (!marker.current) {
        marker.current = L.marker(point,{icon,draggable:true,title:'Venue pin — drag to adjust',keyboard:true}).addTo(instance);
        marker.current.on('dragend',()=>selectPin(marker.current.getLatLng()));
      } else marker.current.setLatLng(point);
    };
    putPin.current = selectPin;
    if(initial)selectPin(initial);
    instance.on('click',e=>selectPin(e.latlng));
    const observer = new ResizeObserver(()=>instance.invalidateSize());
    observer.observe(mapElement.current);
    instance.invalidateSize();
    return () => { observer.disconnect(); instance.remove(); map.current=null; marker.current=null; putPin.current=null; modal.close(); };
  },[open]);
  useEffect(()=>{
    if(open&&view==='pin'&&map.current){
      map.current.invalidateSize();
      if(!draft&&!activeArea)map.current.fitBounds(areaBounds,{padding:[35,35],animate:false});
    }
  },[open,view]);

  const begin = () => {setDraft(event.location || null);setDraftLink(event.location?'':event.mapUrl||'');setPending(false);setActiveArea('');setView('pin');setGoogleQuery(event.location?`${event.location.lat},${event.location.lng}`:[event.venue,event.address].filter(Boolean).join(', ')||'Bahria Town Lahore');setError('');setTileError('');setOpen(true);};
  const clearDraft = () => {setDraft(null);setDraftLink('');marker.current?.remove();marker.current=null;};
  const jumpArea = area => {
    const [lat,lng,zoom]=areas[area];
    map.current?.setView([lat,lng],zoom,{animate:false});
    marker.current?.remove();marker.current=null;
    setDraft(null);setDraftLink('');setPending(false);setActiveArea(area);setInputRevision(value=>value+1);
    setGoogleQuery(`${area}, Lahore, Pakistan`);
  };
  const locate = () => {
    if(!navigator.geolocation){setError('Location is unavailable in this browser. Select the pin on the map.');return;}
    setLocating(true);setError('');
    navigator.geolocation.getCurrentPosition(position=>{
      setLocating(false);
      if(!map.current)return;
      const point=L.latLng(position.coords.latitude,position.coords.longitude);
      setActiveArea('');map.current.setView(point,17);putPin.current(point);
    },()=>{setLocating(false);setError('Your location could not be accessed. Choose an area below, then place the pin on the map.');},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
  };
  return <div className="pin-picker">
    <div className="pin-picker-heading"><MapPin size={17} aria-hidden="true"/><span>Venue or nearby landmark<small>{event.location?'A location pin is selected.':event.mapUrl?'A location link is selected.':'Choose any spot or a nearby landmark for your guests.'}</small></span></div>
    <div className="pin-picker-actions"><button type="button" className="secondary-button" onClick={begin}>{event.location||event.mapUrl?'Adjust location pin':'Choose pin on map'}</button>{(event.location||event.mapUrl) && <button type="button" className="text-button" onClick={()=>onChange({location:null,mapUrl:''})}>Clear pin</button>}</div>
    {event.location && <p className="pin-saved"><Check size={13} aria-hidden="true"/> Exact pin selected for Google Maps</p>}
    {open && <dialog className="map-picker-dialog" ref={dialog} aria-labelledby={'pin-title-'+event.id} onCancel={()=>setOpen(false)}>
      <div className="map-picker-heading"><div><p className="eyebrow">{event.name.toUpperCase()} VENUE</p><h2 id={'pin-title-'+event.id}>Choose the exact spot.</h2></div><button type="button" className="icon-button" aria-label="Close location picker" onClick={()=>setOpen(false)}><X size={20}/></button></div>
      <p className="picker-help">Click anywhere on the pin map: the coordinates below fill automatically. You can choose your entrance or a nearby landmark. Your written address stays separate.</p>
      <div className="map-area-shortcuts" role="group" aria-label="Choose a nearby area">{Object.keys(areas).map(area=><button type="button" key={area} aria-pressed={activeArea===area} onClick={()=>jumpArea(area)}>{area}</button>)}</div>
      <div className="map-picker-toolbar"><button type="button" className="text-button" onClick={()=>{setActiveArea('');setView('pin');map.current?.fitBounds(areaBounds,{padding:[35,35],animate:false});}}>Show all three areas</button><button type="button" className="secondary-button" disabled={locating} onClick={locate}><LocateFixed size={15}/>{locating?'Locating…':'Use my location'}</button></div>
      <div className="map-view-tabs" role="tablist" aria-label="Map view"><button type="button" role="tab" id={`google-tab-${event.id}`} aria-controls={`google-panel-${event.id}`} aria-selected={view==='google'} onClick={()=>setView('google')}>Google Maps & landmarks</button><button type="button" role="tab" id={`pin-tab-${event.id}`} aria-controls={`pin-panel-${event.id}`} aria-selected={view==='pin'} onClick={()=>setView('pin')}>Pin picker</button></div>
      <div role="tabpanel" id={`google-panel-${event.id}`} aria-labelledby={`google-tab-${event.id}`} hidden={view!=='google'}><GoogleLocationSearch query={googleQuery} area={activeArea} onSearch={setGoogleQuery} onManual={()=>setView('pin')}/></div>
      <div role="tabpanel" id={`pin-panel-${event.id}`} aria-labelledby={`pin-tab-${event.id}`} hidden={view!=='pin'}><p className="picker-help">Tap the exact spot, then drag the pin to adjust. This pin picker uses OpenStreetMap.</p><div className="pin-map" ref={mapElement} role="region" aria-label="Choose the venue location on the map"/>{tileError&&<p className="map-picker-error" role="alert">{tileError}</p>}</div>
      {error && <p className="map-picker-error" role="alert">{error}</p>}
      <GooglePinInput key={inputRevision} point={draft} link={draftLink} onClear={clearDraft} onPending={setPending} onLink={link=>{clearDraft();setDraftLink(link);setPending(false);}} onPin={point=>{putPin.current?.(point);map.current?.setView([point.lat,point.lng],17,{animate:false});}}/>
      <div className="pin-position"><span role="status">{draft?draft.lat.toFixed(6)+', '+draft.lng.toFixed(6):draftLink?'Google Maps link selected. Open it to confirm the place.':'No pin selected yet'}</span>{draftLink&&<a className="text-button" href={draftLink} target="_blank" rel="noreferrer">Check selected place</a>}{view==='pin'&&<button type="button" className="text-button" onClick={()=>putPin.current?.(map.current.getCenter())}>Place pin at map center</button>}</div>
      <div className="map-picker-footer"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button type="button" className="primary-button" disabled={pending||(!draft&&!draftLink)} onClick={()=>{onChange({location:draft,mapUrl:draft?'':draftLink});setOpen(false);}}><Check size={17}/> {draftLink?'Use this location':'Use this pin'}</button></div>
    </dialog>}
  </div>;
}
