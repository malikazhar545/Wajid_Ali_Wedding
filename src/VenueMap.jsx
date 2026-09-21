import React, { useState } from 'react';
import { MapPin, Navigation, Share2, Check, Copy } from 'lucide-react';
import { mapLinks } from './map-links.mjs';

export default function VenueMap({ event, preview = false }) {
  const [status, setStatus] = useState('');
  const [copyFallback, setCopyFallback] = useState(false);
  const links = mapLinks(event);
  if (!links) return null;
  async function shareLocation() {
    setStatus('');
    setCopyFallback(false);
    if (navigator.share) {
      try {
        await navigator.share({ title:`${event.name} — ${event.venue || 'Wedding venue'}`, text:[event.venue,event.address].filter(Boolean).join(', '), url:links.share });
        return;
      } catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(links.share);
      setStatus('Location link copied. Ready to share.');
    } catch {
      setCopyFallback(true);
      setStatus('Select and copy the location link below.');
    }
  }
  return <div className={`venue-map ${preview?'venue-map-preview':''}`}>
    {links.embed && <div className="map-frame"><iframe key={links.embed} src={links.embed} title={`${event.name} venue map`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/><span className="map-caption"><MapPin size={12} aria-hidden="true"/> {preview?'MAP PREVIEW':'FIND YOUR WAY TO THE CELEBRATION'}</span></div>}
    <div className="map-buttons"><a href={links.directions} target="_blank" rel="noreferrer"><Navigation size={14} aria-hidden="true"/>{links.custom?'Open in Maps':'Directions'}</a>{!preview && <button type="button" onClick={shareLocation}><Share2 size={14} aria-hidden="true"/> Share location</button>}</div>
    {status && <p className="map-status" role="status"><Check size={12} aria-hidden="true"/>{status}</p>}
    {copyFallback && <label className="map-copy-fallback"><Copy size={14} aria-hidden="true"/><input aria-label={`${event.name} location link`} readOnly value={links.share} onFocus={e=>e.target.select()}/></label>}
  </div>;
}
