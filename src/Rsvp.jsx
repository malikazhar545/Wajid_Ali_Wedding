import React, { useState } from 'react';
import { Check, Heart, MessageCircle, Send, X } from 'lucide-react';
import './rsvp.css';

export default function Rsvp({ guest, onSaved }) {
  const [choice,setChoice]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const selected=choice ?? guest.rsvp?.status ?? '';
  const changed=selected && selected!==guest.rsvp?.status;
  const submit=async event=>{
    event.preventDefault();
    if(!changed || busy)return;
    setBusy(true);setError('');
    try {
      const response=await fetch(`/api/invitation/${encodeURIComponent(guest.id)}/rsvp`,{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:selected})});
      let result;
      try {result=await response.json();} catch {throw new Error('Your reply could not be saved. Please try again.');}
      if(!response.ok)throw new Error(result.error || 'Your reply could not be saved. Please try again.');
      onSaved(result.rsvp);setChoice(null);
    } catch(err) {setError(err.message || 'Your reply could not be saved. Please try again.');}
    finally {setBusy(false);}
  };
  const contact=`https://wa.me/923174539300?text=${encodeURIComponent(`Assalamu Alaikum! This is ${guest.name}. I have a question about Wajid Ali's wedding invitation.`)}`;
  return <section className="w-rsvp" aria-labelledby="rsvp-heading">
    <span className="w-overline">A LITTLE REPLY, A LOT OF JOY</span>
    <h2 id="rsvp-heading">Will you <em>join us?</em></h2>
    <p className="w-rsvp-intro">Kindly let us know if you can celebrate with us.</p>
    <p className="w-rsvp-for">Replying for <strong>{guest.name}</strong>{guest.withFamily?' & family':''}</p>
    <form onSubmit={submit} aria-label="Wedding RSVP">
      <fieldset disabled={busy}><legend className="sr-only">Your attendance</legend>
        {[['accepted','Joyfully accepts',Heart],['declined','Regretfully declines',X]].map(([status,label,Icon])=><label key={status} className={`w-rsvp-option ${selected===status?'is-selected':''}`}><input type="radio" name="attendance" value={status} checked={selected===status} onChange={()=>{setChoice(status);setError('');}}/><Icon size={18} strokeWidth={1.5}/><span>{label}</span>{selected===status&&<Check size={15} className="w-rsvp-check"/>}</label>)}
      </fieldset>
      {error&&<p className="w-rsvp-error" role="alert">{error}</p>}
      <button className="w-rsvp-submit" disabled={busy || !changed}>{busy?'Saving your reply…':guest.rsvp?'Update RSVP':'Send RSVP'}<Send size={15}/></button>
      {guest.rsvp&&<p className="w-rsvp-saved" role="status"><Check size={16}/>{guest.rsvp.status==='accepted'?"Thank you! We look forward to celebrating with you.":"Thank you for letting us know. You will be missed."}</p>}
      <p className="w-rsvp-help">Your reply covers the functions on this invitation. You can update it here anytime.</p>
    </form>
    <div className="w-family-contact"><p>Questions about the venue or timings?</p><a href={contact} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> Contact family on WhatsApp</a></div>
  </section>;
}
