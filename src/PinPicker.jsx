import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, LocateFixed, X, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const cities = {
  'Choose a nearby city': [30.3753,69.3451,5],
  Islamabad: [33.6844,73.0479,12], Rawalpindi:[33.5651,73.0169,12],
  Lahore:[31.5204,74.3587,12], Karachi:[24.8607,67.0011,12],
  Faisalabad:[31.4504,73.135,12], Multan:[30.1575,71.5249,12],
  Peshawar:[34.0151,71.5249,12], Quetta:[30.1798,66.975,12],
};

export default function PinPicker({ event, onChange }) {
  const [open,setOpen] = useState(false);
  const [draft,setDraft] = useState(event.location || null);
  const [error,setError] = useState('');
  const [locating,setLocating] = useState(false);
  const dialog = useRef(null), mapElement = useRef(null), map = useRef(null), marker = useRef(null);
  const putPin = useRef(null);
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    modal.showModal();
    const initial = event.location;
    const instance = L.map(mapElement.current, { scrollWheelZoom:false }).setView(initial ? [initial.lat,initial.lng] : cities['Choose a nearby city'].slice(0,2), initial ? 17 : 5);
    map.current = instance;
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      referrerPolicy:'strict-origin-when-cross-origin',
    }).addTo(instance);
    tiles.on('tileerror',()=>setError('Map tiles could not load. Check your connection, or try again.'));
    tiles.on('load',()=>setError(''));
    const icon = L.divIcon({className:'venue-pin',html:'<span aria-hidden="true"></span>',iconSize:[32,42],iconAnchor:[16,40]});
    const selectPin = latlng => {
      const point = L.latLng(latlng).wrap();
      const next = {lat:Number(point.lat.toFixed(6)),lng:Number(point.lng.toFixed(6))};
      setDraft(next);
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

  const begin = () => {setDraft(event.location || null);setError('');setOpen(true);};
  const locate = () => {
    if(!navigator.geolocation){setError('Location is unavailable in this browser. Select the pin on the map.');return;}
    setLocating(true);setError('');
    navigator.geolocation.getCurrentPosition(position=>{
      setLocating(false);
      if(!map.current)return;
      const point=L.latLng(position.coords.latitude,position.coords.longitude);
      map.current.setView(point,17);putPin.current(point);
    },()=>{setLocating(false);setError('Your location could not be accessed. Choose a city, then place the pin on the map.');},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
  };
  return <div className="pin-picker">
    <div className="pin-picker-heading"><MapPin size={17} aria-hidden="true"/><span>Exact venue pin<small>{event.location?'A precise location is selected.':'Choose the exact entrance for your guests.'}</small></span></div>
    <div className="pin-picker-actions"><button type="button" className="secondary-button" onClick={begin}>{event.location?'Adjust location pin':'Choose pin on map'}</button>{event.location && <button type="button" className="text-button" onClick={()=>onChange(null)}>Clear pin</button>}</div>
    {event.location && <p className="pin-saved"><Check size={13} aria-hidden="true"/> Exact pin selected for Google Maps</p>}
    {open && <dialog className="map-picker-dialog" ref={dialog} aria-labelledby={'pin-title-'+event.id} onCancel={()=>setOpen(false)}>
      <div className="map-picker-heading"><div><p className="eyebrow">{event.name.toUpperCase()} VENUE</p><h2 id={'pin-title-'+event.id}>Choose the exact spot.</h2></div><button type="button" className="icon-button" aria-label="Close location picker" onClick={()=>setOpen(false)}><X size={20}/></button></div>
      <p className="picker-help">Zoom in, click your venue, then drag the pin to its entrance.</p>
      <div className="map-picker-toolbar"><select aria-label="Jump to city" defaultValue="Choose a nearby city" onChange={e=>{const [lat,lng,zoom]=cities[e.target.value];map.current?.setView([lat,lng],zoom);}}>{Object.keys(cities).map(city=><option key={city}>{city}</option>)}</select><button type="button" className="secondary-button" disabled={locating} onClick={locate}><LocateFixed size={15}/>{locating?'Locating…':'Use my location'}</button></div>
      <div className="pin-map" ref={mapElement} role="region" aria-label="Choose the venue location on the map"/>
      {error && <p className="map-picker-error" role="alert">{error}</p>}
      <div className="pin-position"><span role="status">{draft?draft.lat.toFixed(6)+', '+draft.lng.toFixed(6):'No pin selected yet'}</span><button type="button" className="text-button" onClick={()=>putPin.current?.(map.current.getCenter())}>Place pin at map center</button></div>
      <div className="map-picker-footer"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button type="button" className="primary-button" disabled={!draft} onClick={()=>{onChange(draft);setOpen(false);}}><Check size={17}/> Use this pin</button></div>
    </dialog>}
  </div>;
}
