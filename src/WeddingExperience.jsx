import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowDown, Search, X, Heart, Flower2, Sparkles, Users, CalendarDays, Clock3, MapPin, Share2, Printer, Check, LockKeyhole } from 'lucide-react';
import VenueMap from './VenueMap.jsx';
import { confirmedDate, clockTime } from './date-time.mjs';
import './wedding.css';

const occasions = {
  mehndi: { name:'Mehndi', icon:Flower2, line:'An evening in full bloom.', copy:'Colour, laughter and the warmth of our favourite people. Join us as the wedding festivities begin.' },
  baraat: { name:'Baraat', icon:Sparkles, line:'The joy of a new beginning.', copy:'A day of heartfelt prayers and cherished traditions, as we gather to celebrate this blessed union.' },
  walima: { name:'Walima', icon:Heart, line:'Together, with grateful hearts.', copy:'An occasion to share a meal, offer your blessings and celebrate the beginning of a beautiful new chapter.' },
};
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const displayName = name => !name || /^wajid(?:\s+ali)?$/i.test(name.trim()) ? 'Wajid Ali' : name;
async function get(path) {
  const response = await fetch(`/api${path}`,{credentials:'same-origin'});
  const data = await response.json();
  if(!response.ok) throw Object.assign(new Error(data.error || 'Please try again.'),{status:response.status});
  return data;
}
function Mark({ className='' }) {
  return <span className={`wa-mark ${className}`} aria-label="Wajid Ali"><span className="wa-w">W</span><span className="wa-a">A</span></span>;
}
function Flourish({className=''}) {
  return <svg className={`w-flourish ${className}`} viewBox="0 0 220 35" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".8"><path d="M3 18h67c18 0 18-13 8-13-13 0-10 23 9 23 14 0 20-10 23-17 3 7 9 17 23 17 19 0 22-23 9-23-10 0-10 13 8 13h67"/><path d="M35 18c11-12 23-9 28-3M42 18c12 10 23 8 28 2M185 18c-11-12-23-9-28-3M178 18c-12 10-23 8-28 2M110 2l4 5-4 5-4-5Z"/><circle cx="110" cy="26" r="2"/></g></svg>;
}
function Florals({className=''}) {return <><img className={`w-florals ${className}`} src="/burgundy-florals.webp" alt="" aria-hidden="true"/><span className="w-mobile-florals w-mobile-florals-top" aria-hidden="true"/><span className="w-mobile-florals w-mobile-florals-bottom" aria-hidden="true"/></>;}
function Header({back}) {
  return <header className="w-header"><a className="w-brand" href="/" aria-label="Wedding invitation home"><Mark/></a><nav aria-label="Invitation navigation">{back?<button onClick={back} className="w-back" aria-label="Back to guest list"><ArrowLeft size={15}/> Guest list</button>:<a className="w-nav-occasions" href="#occasions">The celebrations</a>}<a className="w-nav-invite" href="#find-invitation">Your invitation <ArrowRight size={14}/></a></nav></header>;
}
function Footer({groom}) {
  return <footer className="w-footer"><Mark/><p>With love & duas, from our family to yours.</p><span>{displayName(groom)} <i>·</i> THE WEDDING CELEBRATION</span><a href="/backend"><LockKeyhole size={11}/> Family access</a></footer>;
}
function Opening({guest}) {
  return <div className="envelope-overlay w-opening" role="status"><div className="w-opening-envelope" aria-hidden="true"><div className="w-opening-letter"><Mark/><span>A PERSONAL INVITATION</span></div><div className="w-envelope-front"/><div className="w-envelope-flap"/><div className="w-opening-seal"><Mark/></div></div><p>Especially for {guest.name}</p><span>WITH LOVE, FROM THE FAMILY OF WAJID ALI</span></div>;
}
function Home({data,open}) {
  const [query,setQuery]=useState(''),[opening,setOpening]=useState(null),[occasion,setOccasion]=useState('mehndi');
  const timer=useRef(null), search=useRef(null);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const select=guest=>{
    if(opening)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){open(guest.id);return;}
    setOpening(guest);timer.current=setTimeout(()=>open(guest.id),1450);
  };
  const list=data.guests.filter(g=>`${g.name} ${g.label}`.toLowerCase().includes(query.trim().toLowerCase()));
  const story=occasions[occasion], StoryIcon=story.icon;
  return <div className="atelier home-atelier">
    <Header groom={data.settings.groom}/>
    <main>
      <section className="w-hero" aria-labelledby="wedding-name">
        <div className="w-hero-copy">
          <p className="w-bismillah" lang="ar" dir="rtl">{BISMILLAH}</p>
          <p className="w-kicker">IN THE NAME OF ALLAH, THE MOST MERCIFUL</p>
          <div className="w-name-block"><span className="w-overline">THE WEDDING CELEBRATION OF</span><h1 id="wedding-name">{displayName(data.settings.groom)}</h1><Flourish/></div>
          <h2>A cherished beginning.<br/><em>A celebration with you.</em></h2>
          <p className="w-hero-message">With grateful hearts, our family requests the honour of your presence as we celebrate this blessed new chapter.</p>
          <a href="#find-invitation" className="w-button" onClick={()=>setTimeout(()=>search.current?.focus({preventScroll:true}),450)}>Find your invitation <ArrowRight size={17}/></a>
          <div className="w-signature"><span>With love & duas</span><p>The family of {displayName(data.settings.groom)}</p></div>
        </div>
        <section className="w-stationery" id="find-invitation" aria-labelledby="guest-selection-title">
          <div className="w-envelope-back" aria-hidden="true"><div className="w-envelope-lining"/><Flourish/><span>YOU ARE CORDIALLY INVITED</span></div>
          <Florals className="w-hero-florals"/>
          <div className="w-guest-paper">
            <div className="w-paper-inner">
              <Mark/><p className="w-overline">RESERVED WITH LOVE</p>
              <h2 id="guest-selection-title">An invitation,<br/><em>just for you.</em></h2>
              <p className="w-selection-help">Find your name. Open a little happiness.</p>
              <label className="w-search"><Search size={17}/><input ref={search} aria-label="Find your name" placeholder="Find your name…" value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button aria-label="Clear search" onClick={()=>setQuery('')}><X size={16}/></button>}</label>
              <div className="w-guest-list" aria-label="Guest invitations">{list.slice(0,25).map((guest,index)=><button key={guest.id} className="w-guest" style={{'--order':Math.min(index,6)}} onClick={()=>select(guest)} disabled={!!opening}><span className="w-guest-initial">{guest.name.trim().charAt(0)}</span><span>{guest.name}{guest.label && <small>{guest.label}</small>}</span><ArrowRight size={16}/></button>)}</div>
              {!list.length && <p className="w-no-guests">{data.guests.length?'No name found. Try another spelling or contact the family.':'Our invitations are being prepared. Please visit again soon.'}</p>}
              {list.length>25 && <p className="w-more-guests">Search above to find your invitation.</p>}
              <p className="w-paper-note"><Heart size={11}/> Your presence would mean so much to us.</p>
            </div>
          </div>
          <div className="w-wax-seal" aria-hidden="true"><Mark/></div>
          <p className="w-stationery-caption">A name on a card. A place in our hearts.</p>
        </section>
      </section>
      <a href="#occasions" className="w-scroll-cue"><span>THE CELEBRATIONS</span><ArrowDown size={15}/></a>
      <section className="w-occasion-story" id="occasions" aria-labelledby="occasions-heading">
        <div className="w-story-heading"><span className="w-overline">THREE OCCASIONS. COUNTLESS MEMORIES.</span><h2 id="occasions-heading">A little colour.<br/><em>A lifetime of love.</em></h2><p>From the first gathering to the final farewell,<br/>every moment is sweeter with the people we love.</p></div>
        <div className="w-story-panel"><div className="w-story-tabs" aria-label="Explore the celebrations">{Object.entries(occasions).map(([id,event])=><button key={id} aria-pressed={occasion===id} onClick={()=>setOccasion(id)}>{event.name}<span>0{Object.keys(occasions).indexOf(id)+1}</span></button>)}</div><div className="w-story-content" key={occasion}><StoryIcon size={32} strokeWidth={1}/><span className="w-overline">{story.name.toUpperCase()}</span><h3>{story.line}</h3><p>{story.copy}</p><a href="#find-invitation">Find your personal invitation <ArrowRight size={15}/></a></div><span className="w-story-footnote">Your personal invitation includes the functions selected for you.</span></div>
      </section>
      <section className="w-quote"><Flourish/><p>We look forward to celebrating<br/><em>in your company and your duas.</em></p><Flourish/></section>
    </main>
    <Footer groom={data.settings.groom}/>{opening && <Opening guest={opening}/>}
  </div>;
}
function downloadCalendar(event,groom) {
  const clean=value=>value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const timed=!!clockTime(event.time),date=confirmedDate(event.date);
  if(!date)return;
  const stamp=new Date(`${date}T${clockTime(event.time)||'00:00'}:00+05:00`).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const next=new Date(`${date}T12:00:00Z`);next.setUTCDate(next.getUTCDate()+1);
  const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wajid Ali Wedding//EN','BEGIN:VEVENT',`UID:${event.id}-${date}@wajid-wedding`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,timed?`DTSTART:${stamp}`:`DTSTART;VALUE=DATE:${date.replaceAll('-','')}`,...(timed?[]:[`DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replaceAll('-','')}`]),`SUMMARY:${clean(`${groom} — ${event.name}`)}`,`LOCATION:${clean([event.venue,event.address].filter(Boolean).join(', '))}`,'DESCRIPTION:Please check your invitation for the latest wedding details.','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`${groom}-${event.name}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function Countdown({events}) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
  const next=events.map(event=>({...event,stamp:confirmedDate(event.date)?new Date(`${event.date}T${clockTime(event.time)||'00:00'}:00+05:00`).getTime():0})).filter(event=>event.stamp>now).sort((a,b)=>a.stamp-b.stamp)[0];
  if(!next)return null;
  const diff=Math.floor((next.stamp-now)/1000),values=[Math.floor(diff/86400),Math.floor(diff/3600)%24,Math.floor(diff/60)%60,diff%60];
  return <div className="w-countdown"><div><span className="w-overline">COUNTING THE MOMENTS</span><p>Until your <em>{next.name}</em> celebration</p></div><div className="w-countdown-digits" aria-label={`Time remaining until ${next.name}`} role="timer">{values.map((value,index)=><span key={index}><strong>{String(value).padStart(2,'0')}</strong><small>{['DAYS','HOURS','MINUTES','SECONDS'][index]}</small></span>)}</div></div>;
}
function EventCard({event,groom,index}) {
  const date=confirmedDate(event.date),time=clockTime(event.time),parsed=date?new Date(`${date}T12:00:00`):null, EventIcon=occasions[event.id].icon;
  return <article className={`event-card w-event event-${event.id}`} id={`occasion-${event.id}`} style={{'--order':index}}>
    <div className="w-date-stamp"><span>{parsed?parsed.toLocaleDateString('en-GB',{weekday:'long'}):'SAVE THE DATE'}</span><strong>{parsed?parsed.getDate():'—'}</strong><em>{parsed?parsed.toLocaleDateString('en-GB',{month:'long'}):'Coming soon'}</em><small>{parsed?parsed.getFullYear():'WITH LOVE'}</small></div>
    <div className="w-event-body"><div className="w-event-label"><span className="w-overline">0{index+1} / YOUR INVITATION</span><EventIcon size={23} strokeWidth={1}/></div><h3>{event.name}</h3><p className="w-event-subtitle">{event.subtitle}</p><div className="w-event-details"><div className="event-detail"><CalendarDays size={16}/><span>{parsed?parsed.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Date to be announced'}</span></div><div className="event-detail"><Clock3 size={16}/><span>{time?`${new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} · Pakistan time`:'Time to be announced'}</span></div><div className="event-detail venue"><MapPin size={16}/><span>{event.venue||'Venue to be announced'}{event.address&&<small>{event.address}</small>}</span></div></div>{date&&<button className="w-calendar" onClick={()=>downloadCalendar(event,groom)}><CalendarDays size={14}/> Add to calendar <ArrowRight size={14}/></button>}</div>
    <VenueMap event={event}/>
  </article>;
}
function Invitation({id,back}) {
  const [data,setData]=useState(null),[error,setError]=useState(''),[shareStatus,setShareStatus]=useState('');
  const heading=useRef(null);
  useEffect(()=>{let active=true;const refresh=()=>get(`/invitation/${encodeURIComponent(id)}`).then(result=>{if(active){setData(result);setError('');}}).catch(err=>{if(active){setError(err.message);if(err.status===404)setData(null);}});refresh();const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',refresh);};},[id]);
  useEffect(()=>{if(data)heading.current?.focus({preventScroll:true});},[data?.guest.id]);
  const share=async()=>{const payload={title:`${displayName(data.settings.groom)} — Wedding invitation`,url:location.href};try{if(navigator.share){await navigator.share(payload);return;}await navigator.clipboard.writeText(payload.url);setShareStatus('Invitation link copied.');}catch(err){if(err.name!=='AbortError')setShareStatus('Copy this page’s address to share your invitation.');}};
  return <div className="atelier invitation-atelier"><Header groom={data?.settings.groom} back={back}/><main>
    {error&&<p className="w-error" role="alert">{error}</p>}
    {!data ? <div className="w-loading">{error?'Please contact the family for your invitation.':'Opening your invitation…'}</div> : <>
      <section className="w-invitation-cover" id="find-invitation"><div className="w-folio"><Florals/><div className="w-folio-inner"><p className="w-bismillah" lang="ar" dir="rtl">{BISMILLAH}</p><span className="w-kicker">WITH THE BLESSINGS OF ALLAH</span><Mark/><p className="w-overline">YOU ARE CORDIALLY INVITED TO THE WEDDING OF</p><h1>{displayName(data.settings.groom)}</h1><Flourish/><p className="w-invitation-message">{data.settings.message}</p><div className="w-addressed"><p className="w-overline">A WARM INVITATION FOR</p><h2 ref={heading} tabIndex={-1}>{data.guest.name}</h2>{data.guest.withFamily&&<span className="family-badge"><Users size={14}/> Together with your family</span>}<p>We would be delighted to welcome you to<br/><strong>{data.settings.events.map(event=>event.name).join(', ').replace(/, ([^,]*)$/,' & $1')}</strong>.</p></div><span className="w-folio-host">{data.settings.host}</span></div></div></section>
      <div className="w-itinerary-wrap"><Countdown events={data.settings.events}/><section className="w-itinerary" aria-labelledby="itinerary-heading"><div className="w-itinerary-heading"><span className="w-overline">YOUR PRESENCE MAKES IT SPECIAL</span><h2 id="itinerary-heading">The celebrations <em>await.</em></h2><p>A date to remember. A place reserved for you.</p><nav aria-label="Jump to your function">{data.settings.events.map(event=><a key={event.id} href={`#occasion-${event.id}`}>{event.name}<ArrowDown size={12}/></a>)}</nav></div><div className="w-events-list">{data.settings.events.map((event,index)=><EventCard key={event.id} event={event} groom={displayName(data.settings.groom)} index={index}/>)}</div>{data.settings.events.some(event=>!confirmedDate(event.date))&&<p className="w-pending-dates">Final dates will appear here as soon as the family confirms them.</p>}</section></div>
      <section className="w-invitation-closing"><Flourish/><p>{data.settings.closing}</p><span>{data.settings.host}</span><div className="w-guest-actions"><button className="w-share-button" onClick={share}><Share2 size={17}/> Share invitation</button><button className="w-print-button" onClick={()=>window.print()}><Printer size={17}/> Print card</button></div>{shareStatus&&<p className="w-share-status" role="status"><Check size={13}/>{shareStatus}</p>}</section>
    </>}
  </main><Footer groom={data?.settings.groom}/></div>;
}
export default function WeddingExperience() {
  const [id,setId]=useState(new URLSearchParams(location.search).get('invite')),[data,setData]=useState(null),[error,setError]=useState('');
  const load=()=>{setError('');get('/public').then(setData).catch(err=>setError(err.message));};
  useEffect(()=>{load();const pop=()=>setId(new URLSearchParams(location.search).get('invite'));window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[]);
  const navigate=next=>{history.pushState({},'',next?`/?invite=${encodeURIComponent(next)}`:'/');setId(next);window.scrollTo({top:0,behavior:'instant'});if(!next)load();};
  if(id)return <Invitation key={id} id={id} back={()=>navigate(null)}/>;
  if(!data)return <div className="atelier"><Header/><main className="w-loading"><Mark/><p>{error||'Preparing your invitation…'}</p>{error&&<button className="w-button" onClick={load}>Try again</button>}</main></div>;
  return <Home data={data} open={navigate}/>;
}
