import React from 'react';
import {ExternalLink} from 'lucide-react';

export default function GoogleLocationSearch({query,link,onManual}) {
  const destination=link||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return <div className="google-location-search">
    {query?<iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`} title="Google Maps landmarks and venue preview" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<p className="google-selection-note">Your map link is ready. Open it below to confirm the hall or landmark; coordinates are not needed to save it.</p>}
    <a className="text-button" href={destination} target="_blank" rel="noreferrer"><ExternalLink size={15}/> {link?'Open selected location in Google Maps':'Open Google Maps to find a hall or landmark'}</a>
    <p className="google-pin-help">To choose another Google landmark, open it, select Share → Copy link, and paste above. For an unlisted entrance, <button type="button" className="text-button" onClick={onManual}>drop a manual pin</button>.</p>
  </div>;
}
