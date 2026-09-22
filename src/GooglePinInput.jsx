import React,{useEffect,useRef,useState} from 'react';
import {MapPin} from 'lucide-react';
import {googlePlaceLink,parseGooglePin} from './google-pin.mjs';

export default function GooglePinInput({point,link,onPin,onLink,onClear,onPending}) {
  const [input,setInput]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const request=useRef(0);
  const callbacks=useRef({onPin,onLink,onClear,onPending});
  callbacks.current={onPin,onLink,onClear,onPending};
  useEffect(()=>()=>{request.current++;},[]);
  useEffect(()=>{
    if(point||link){
      request.current++;
      setInput(point?`${point.lat}, ${point.lng}`:link);
      setError('');setBusy(false);callbacks.current.onPending(false);
    }
  },[point,link]);
  const preview=async(value=input)=>{
    const version=++request.current;
    if(!value.trim())return;
    setError('');
    const pin=parseGooglePin(value);
    if(pin){callbacks.current.onPin(pin);return;}
    const placeLink=googlePlaceLink(value);
    if(placeLink){callbacks.current.onLink(placeLink);return;}
    setBusy(true);callbacks.current.onPending(true);
    try{
      const response=await fetch('/api/admin/map-pin',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:value.trim()})});
      let result;
      try{result=await response.json();}catch{throw new Error('The location could not be read. Please try again.');}
      if(!response.ok)throw new Error(result.error||'Please check the location and try again.');
      if(version===request.current)callbacks.current.onPin(result.location);
    }catch(err){if(version===request.current)setError(err.message||'The location could not be read. Please try again.');}
    finally{if(version===request.current){setBusy(false);callbacks.current.onPending(false);}}
  };
  const edit=value=>{
    request.current++;setInput(value);setError('');setBusy(false);
    callbacks.current.onClear();callbacks.current.onPending(false);
  };
  return <div className="google-location-search google-location-input">
    <label htmlFor="google-pin-input">Google Maps link or coordinates</label>
    <div className="google-pin-input"><input id="google-pin-input" value={input} placeholder="Click the pin map, or paste a Google Maps link" autoComplete="off" aria-describedby="google-pin-help" onChange={e=>edit(e.target.value)} onPaste={e=>{
      e.preventDefault();const field=e.currentTarget;
      const value=input.slice(0,field.selectionStart)+e.clipboardData.getData('text')+input.slice(field.selectionEnd);
      edit(value);if(parseGooglePin(value)||googlePlaceLink(value))void preview(value);
    }} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void preview();}}}/><button type="button" className="secondary-button" disabled={busy||!input.trim()} onClick={()=>preview()}><MapPin size={15}/>{busy?'Reading location…':'Preview this pin'}</button></div>
    <p className="google-pin-help" id="google-pin-help">Click or drag on the pin map to fill coordinates automatically. Google place links with coordinates are read automatically; Share links can also be saved as the destination.</p>
    {error&&<p className="map-picker-error" role="alert">{error}</p>}
  </div>;
}
