import React, { useState } from 'react';
import { Check, Heart, MessageCircle, Send, X } from 'lucide-react';
import './rsvp.css';

function Urdu({children}) {return <span lang="ur" dir="rtl" className="w-rsvp-urdu">{children}</span>;}

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
  const saved=!!guest.rsvp&&!changed;
  const buttonText=busy?['Saving your reply…','جواب محفوظ ہو رہا ہے…']:saved?['Reply saved','جواب محفوظ ہے']:guest.rsvp?['Update reply','جواب تبدیل کریں']:['Send reply','جواب بھیجیں'];
  return <section className="w-rsvp" aria-labelledby="rsvp-heading">
    <span className="w-overline">A LITTLE REPLY, A LOT OF JOY</span>
    <h2 id="rsvp-heading">Will you <em>join us?</em></h2>
    <p className="w-rsvp-intro">Kindly let us know if you can celebrate with us.</p>
    <p className="w-rsvp-for">Replying for <strong><bdi>{guest.name}</bdi></strong>{guest.withFamily?' & family':''}</p>
    <form onSubmit={submit} aria-label="Wedding RSVP">
      <fieldset disabled={busy}><legend className="sr-only">Your attendance</legend>
        {[['accepted','Joyfully accepts','ضرور آئیں گے',Heart],['declined','Regretfully declines','معذرت خواہ ہیں',X]].map(([status,label,urdu,Icon])=><label key={status} className={`w-rsvp-option ${selected===status?'is-selected':''}`}><input type="radio" name="attendance" value={status} checked={selected===status} onChange={()=>{setChoice(status);setError('');}}/><Icon size={18} strokeWidth={1.5} aria-hidden="true"/><span className="w-rsvp-option-label"><Urdu>{urdu}</Urdu><span>{label}</span></span>{selected===status&&<Check size={15} className="w-rsvp-check" aria-hidden="true"/>}</label>)}
      </fieldset>
      {error&&<p className="w-rsvp-error" role="alert">{error}</p>}
      <button className="w-rsvp-submit" disabled={busy || !changed} aria-busy={busy}><span><Urdu>{buttonText[1]}</Urdu><span>{buttonText[0]}</span></span>{saved&&!busy?<Check size={17} aria-hidden="true"/>:<Send size={17} aria-hidden="true"/>}</button>
      {saved&&<p className="w-rsvp-saved" role="status"><Check size={16} aria-hidden="true"/>{guest.rsvp.status==='accepted'?"Thank you! We look forward to celebrating with you.":"Thank you for letting us know. You will be missed."}</p>}
      <p className="w-rsvp-help">Your reply covers the functions on this invitation. You can update it here anytime.</p>
    </form>
    <div className="w-family-contact"><p>Questions about the venue or timings?</p><a href={contact} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true"/> Contact family on WhatsApp</a></div>
  </section>;
}
