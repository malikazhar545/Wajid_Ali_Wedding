import React,{useEffect,useRef,useState} from 'react';
import {MapPin} from 'lucide-react';
import {locationSelection} from './location-selection.mjs';

const selectionKey=(point,link)=>point?`${point.lat.toFixed(6)},${point.lng.toFixed(6)}`:link;
export default function GooglePinInput({point,link,onPin,onLink,onClear,onPending}) {
  const [input,setInput]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const request=useRef(0),timer=useRef(null),controller=useRef(null),ownSelection=useRef(null);
  const callbacks=useRef({onPin,onLink,onClear,onPending});
  callbacks.current={onPin,onLink,onClear,onPending};
  const cancel=()=>{request.current++;clearTimeout(timer.current);controller.current?.abort();};
  useEffect(()=>()=>cancel(),[]);
  useEffect(()=>{
    if(!point&&!link)return;
    const key=selectionKey(point,link);
    if(ownSelection.current===key){ownSelection.current=null;return;}
    cancel();setInput(point?`${point.lat}, ${point.lng}`:link);
    setError('');setBusy(false);callbacks.current.onPending(false);
  },[point,link]);
  const preview=async(value=input)=>{
    cancel();const version=request.current;
    if(!value.trim()){callbacks.current.onPending(false);return;}
    setError('');setBusy(false);
    let selected;
    try{selected=locationSelection(value);}catch(err){setError(err.message);callbacks.current.onPending(false);return;}
    ownSelection.current=selectionKey(selected.location,selected.mapUrl);
    if(selected.location)callbacks.current.onPin(selected.location);
    else callbacks.current.onLink(selected.mapUrl,selected.query,selected.kind);
    callbacks.current.onPending(false);
    if(!selected.short)return;
    // The original link is already usable. Resolving coordinates only improves
    // the preview and must never prevent saving a valid shared destination.
    setBusy(true);const abort=new AbortController();controller.current=abort;
    const timeout=setTimeout(()=>abort.abort(),10000);
    try{
      const response=await fetch('/api/admin/map-pin',{method:'POST',credentials:'same-origin',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({value:selected.mapUrl})});
      if(!response.ok)return;
      const result=await response.json();
      if(version!==request.current||!result.location)return;
      ownSelection.current=selectionKey(result.location,'');callbacks.current.onPin(result.location);
    }catch{/* Keep the usable link if Google does not expose coordinates. */}
    finally{clearTimeout(timeout);if(version===request.current)setBusy(false);}
  };
  const edit=value=>{
    cancel();ownSelection.current=null;setInput(value);setError('');setBusy(false);
    callbacks.current.onClear();callbacks.current.onPending(!!value.trim());
    // Native paste, mobile keyboards, autofill and ordinary typing all use the
    // same path; never prevent the browser's default clipboard insertion.
    if(value.trim())timer.current=setTimeout(()=>void preview(value),550);
  };
  return <div className="google-location-search google-location-input">
    <label htmlFor="google-pin-input">Google Maps link, Plus Code or address</label>
    <div className="google-pin-input"><input id="google-pin-input" value={input} placeholder="Paste a link, 832G+9WX, Manga Mandi, or a hall + area" autoComplete="off" aria-describedby="google-pin-help" onChange={e=>edit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void preview();}}}/><button type="button" className="secondary-button" disabled={!input.trim()} onClick={()=>preview()}><MapPin size={15}/>Preview location</button></div>
    <p className="google-pin-help" id="google-pin-help">Paste or type here — the preview updates automatically. Coordinates are optional.</p>
    {busy&&<p className="google-pin-help" role="status">Link ready to save. Checking for a more precise preview…</p>}
    {error&&<p className="map-picker-error" role="alert">{error}</p>}
  </div>;
}
