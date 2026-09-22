import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowLeft, Search, Heart, CalendarDays, MapPin, Clock3, Users, Check, X, Plus, Pencil, Trash2, Copy, ExternalLink, LogOut, LockKeyhole, Flower2, Sparkles, Mail, LoaderCircle, Download } from 'lucide-react';
import './styles.css';
import './royal.css';
import './backend.css';
import './maps.css';
import { confirmedDate, clockTime, editableSettings } from './date-time.mjs';
import VenueMap from './VenueMap.jsx';
import WeddingExperience from './WeddingExperience.jsx';
import { invitationPath, warmInvitationPreview } from './invitation-link.mjs';
const PinPicker = React.lazy(() => import('./PinPicker.jsx'));

const titles = { mehndi: 'Mehndi', baraat: 'Baraat', walima: 'Walima' };
async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...options.headers } });
  let data;
  try { data = await response.json(); } catch { throw new Error('The server could not be reached. Please try again.'); }
  if (!response.ok) { const error = new Error(data.error || 'Please try again.'); error.status = response.status; throw error; }
  return data;
}
function Icon({ as: Component, ...props }) { return <Component size={18} strokeWidth={1.5} aria-hidden="true" {...props} />; }
function Ornament() { return <div className="ornament" aria-hidden="true"><span /><span className="diamond" /><span /></div>; }
function Botanical({ className = '' }) {
  return <svg className={`botanical ${className}`} viewBox="0 0 260 410" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.1"><path d="M125 400C119 304 150 221 180 124C190 91 190 54 183 16M130 331C89 295 55 248 33 190M144 267C190 242 227 200 239 149M160 215C124 174 104 125 109 83M176 150C208 132 235 102 244 72" />
    {[[128,350,-40],[126,311,25],[142,278,-20],[147,246,35],[156,219,-38],[166,187,25],[173,158,-28],[184,120,25],[188,84,-28],[185,47,15],[92,285,-70],[69,252,-90],[49,222,-70],[183,242,45],[209,215,45],[229,181,30],[136,175,-70],[119,140,-45],[112,109,-30],[210,126,40],[231,99,40]].map(([x,y,r],i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><path d="M0 0C-29-12-32-40-25-54C-5-46 7-18 0 0Z" fill="currentColor" fillOpacity={i%3===0?'.1':'.035'} /><path d="M0 0L-23-48" /></g>)}
    <g transform="translate(182 19)"><path d="M0 0C-22-4-20-25-8-21C-9-41 12-40 11-21C28-27 29-7 9 0C25 9 10 27 1 10C-12 28-27 10-9 3Z"/><circle cx="1" cy="0" r="5"/></g></g>
  </svg>;
}
function Monogram({ small = false }) { return <span className={`monogram ${small ? 'small' : ''}`} aria-label="Wajid">W<span aria-hidden="true">✧</span></span>; }
function Header({ admin = false, groom = 'Wajid Ali' }) {
  return <header className="site-header"><a className="brand" href="/" aria-label="Invitation home"><Monogram small /><span>{groom.toUpperCase()}<small>A WEDDING CELEBRATION</small></span></a><nav aria-label="Main navigation">{admin ? <a href="/">View guest cards <Icon as={ExternalLink} size={14}/></a> : <><a href="#celebration" className="desktop-link">The celebration</a><a href="#find-invitation">Your invitation <Icon as={ArrowRight} size={14}/></a></>}</nav></header>;
}
function Footer() { return <footer className="site-footer"><span>Made with love. Shared with you.</span><Icon as={Heart} size={14}/><a href="/backend">Family access <Icon as={LockKeyhole} size={11}/></a></footer>; }
function Loading({ text = 'Preparing something special…' }) { return <div className="loading"><Icon as={LoaderCircle} className="spin"/><p>{text}</p></div>; }
function ErrorBox({ error }) { return error ? <p className="error" role="alert">{error}</p> : null; }

const emptyGuest = () => ({ name: '', label: '', events: ['baraat'], withFamily: false });
function GuestEditor({ guest, onSave, onClose, busy, error }) {
  const [form, setForm] = useState(guest || emptyGuest());
  const dialog = useRef(null);
  useEffect(() => { const el = dialog.current; el.showModal(); return () => el.close(); }, []);
  return <dialog ref={dialog} className="guest-dialog" aria-labelledby="guest-editor-title" onCancel={e=>{ if (busy) e.preventDefault(); else onClose(); }}>
    <form onSubmit={e=>{ e.preventDefault(); onSave(form); }}>
      <div className="dialog-heading"><div><p className="eyebrow">A PERSONAL INVITATION</p><h2 id="guest-editor-title">{guest ? 'Edit guest' : 'Add a new guest'}</h2></div><button type="button" className="icon-button" aria-label="Close guest form" disabled={busy} onClick={onClose}><Icon as={X}/></button></div>
      <label>Guest name<input autoFocus required maxLength={100} value={form.name} placeholder="e.g. Ahmed Ali" onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Short label <span className="optional">(optional)</span><input maxLength={100} value={form.label} placeholder="e.g. Lahore — if two guests have the same name" onChange={e=>setForm({...form,label:e.target.value})}/></label>
      <fieldset><legend>Which functions are they invited to?</legend><p className="field-help">Tick one, two, or all three.</p><div className="function-checkboxes">{Object.entries(titles).map(([id,name])=><label key={id} className={form.events.includes(id)?'checked':''}><input type="checkbox" checked={form.events.includes(id)} onChange={e=>setForm({...form,events:e.target.checked?[...form.events,id]:form.events.filter(x=>x!==id)})}/>{name}</label>)}</div><button type="button" className="text-button select-all" onClick={()=>setForm({...form,events:Object.keys(titles)})}>Select all three functions</button></fieldset>
      <fieldset><legend>Who is invited?</legend><div className="family-options"><label className={form.withFamily?'selected':''}><input type="radio" name="family" aria-label="Invite with family" checked={form.withFamily} onChange={()=>setForm({...form,withFamily:true})}/><span>With family<small>Guest and their family</small></span></label><label className={!form.withFamily?'selected':''}><input type="radio" name="family" aria-label="Without family" checked={!form.withFamily} onChange={()=>setForm({...form,withFamily:false})}/><span>Without family<small>Only this guest</small></span></label></div></fieldset>
      <ErrorBox error={error}/><button className="primary-button full" disabled={busy || !form.events.length}>{busy ? 'Saving…' : guest ? 'Save changes' : 'Create invitation'}<Icon as={ArrowRight}/></button>
    </form>
  </dialog>;
}
function Login({ onLogin, family = false }) {
  const [username, setUsername] = useState('');
  const [password,setPassword] = useState(''), [busy,setBusy] = useState(false), [error,setError] = useState('');
  const submit = async e => { e.preventDefault(); setBusy(true); setError(''); try { await api('/login',{method:'POST',body:JSON.stringify({username,password})}); await onLogin(); } catch(e) { setError(e.message); } finally { setBusy(false); } };
  return <div className="admin-app backend-login"><Header admin/><main className="login-page"><form className="login-card" onSubmit={submit}><Monogram/><p className="eyebrow">YOUR WEDDING, BEAUTIFULLY ORGANIZED</p><h1>Welcome to the family.</h1><p>{family ? "Sign in to see the guest list and open invitation cards on the main page." : <>Sign in to add guests, choose their functions,<br/>and update dates and venues.</>}</p><label>Username<input type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><ErrorBox error={error}/><button className="primary-button full" disabled={busy}>{busy?'Signing in…':family?'View guest invitations':'Enter family dashboard'}<Icon as={ArrowRight}/></button><p className="login-footnote"><Icon as={LockKeyhole} size={13}/> {family?'Private guest list for the family':'Private access for the wedding organizer'}</p></form></main><Footer/></div>;
}
function SettingsForm({ initial, save, busy, error }) {
  const [form,setForm] = useState(() => editableSettings(initial));
  const dirty = JSON.stringify(form) !== JSON.stringify(editableSettings(initial)) || initial.events.some(event => event.date !== confirmedDate(event.date) || event.time !== clockTime(event.time));
  useEffect(()=>{ const guard=e=>{ if(dirty) {e.preventDefault();e.returnValue='';} }; window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard); },[dirty]);
  const updateEvent = (id,key,value) => setForm({...form,events:form.events.map(e=>e.id===id?{...e,[key]:value}:e)});
  return <form className="settings-form" onSubmit={e=>{e.preventDefault();save(form);}}>
    <div className="admin-section-title"><div><h2>Dates & venues</h2><p>Choose a date from the calendar and enter the venue. Every guest card updates.</p></div><button className="primary-button" disabled={busy || !dirty}>{busy?'Saving…':'Save details'}<Icon as={Check}/></button></div>
    <ErrorBox error={error}/>
    {initial.events.some(event=>event.date && !confirmedDate(event.date)) && <p className="settings-notice">A previously saved date needs confirmation. Choose it again using the calendar below, or leave it empty until confirmed.</p>}
    <div className="event-settings-grid">{form.events.map(event=><section className="settings-panel" key={event.id}>
      <span className={'event-pill '+event.id}>{event.name}</span>
      <label>Date <span className="optional">(leave empty until confirmed)</span><input type="date" value={event.date} onChange={e=>updateEvent(event.id,'date',e.target.value)}/></label>
      <label>Time · Pakistan (PKT)<input type="time" value={event.time} onChange={e=>updateEvent(event.id,'time',e.target.value)}/></label>
      <label>Venue<input maxLength={200} placeholder="e.g. Royal Marquee" value={event.venue} onChange={e=>updateEvent(event.id,'venue',e.target.value)}/></label>
      <label>Address<input maxLength={400} placeholder="Street, area and city" value={event.address} onChange={e=>updateEvent(event.id,'address',e.target.value)}/></label>
      <label>Location link <span className="optional">(optional)</span><input type="url" pattern="https://.*" maxLength={1000} placeholder="Paste a Google Maps link" value={event.mapUrl} onChange={e=>updateEvent(event.id,'mapUrl',e.target.value)}/></label>
      <p className="map-field-help">Choose a pin below to send guests to the exact spot. The selected pin takes priority over the address and any pasted link.</p>
      <React.Suspense fallback={<p className="map-field-help">Loading location picker…</p>}><PinPicker event={event} onChange={location=>updateEvent(event.id,'location',location)}/></React.Suspense>
      <VenueMap key={event.venue+event.address+event.mapUrl+JSON.stringify(event.location)} event={event} preview/>
      <label>Card subtitle<input maxLength={150} value={event.subtitle} onChange={e=>updateEvent(event.id,'subtitle',e.target.value)}/></label>
    </section>)}</div>
    <details className="personal-settings"><summary>Invitation wording & family name <span>Optional personal touches</span></summary><section className="settings-panel"><div className="form-grid">
      <label>Groom’s name<input required maxLength={100} value={form.groom} onChange={e=>setForm({...form,groom:e.target.value})}/></label>
      <label>From / hosting family<input required maxLength={200} value={form.host} onChange={e=>setForm({...form,host:e.target.value})}/></label>
      <label className="wide">Invitation message<textarea required maxLength={700} rows={3} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label>
      <label className="wide">Closing message<input required maxLength={300} value={form.closing} onChange={e=>setForm({...form,closing:e.target.value})}/></label>
    </div></section></details>
    <div className="settings-bottom"><p>{dirty ? 'You have unsaved changes.' : 'All details are saved.'}</p><button className="primary-button" disabled={busy || !dirty}>{busy?'Saving…':'Save all details'}<Icon as={Check}/></button></div>
  </form>;
}
function Admin() {
  const [rsvpFilter,setRsvpFilter] = useState('all');
  const [data,setData] = useState(null), [loading,setLoading] = useState(true), [tab,setTab] = useState('guests'), [query,setQuery] = useState(''), [filter,setFilter] = useState('all'), [editor,setEditor] = useState(null), [busy,setBusy] = useState(false), [error,setError] = useState(''), [toast,setToast] = useState('');
  const refresh = async () => { const result = await api('/admin'); setData(result); };
  useEffect(()=>{refresh().catch(e=>{if(e.status!==401)setError(e.message);}).finally(()=>setLoading(false));},[]);
  useEffect(()=>{
    if(!data || busy || editor || tab!=='guests')return;
    let active=true;
    const syncReplies=()=>api('/admin').then(result=>{if(active)setData(current=>current?{...current,guests:result.guests}:current);}).catch(()=>{});
    const timer=setInterval(syncReplies,30000);
    window.addEventListener('focus',syncReplies);
    return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',syncReplies);};
  },[!!data,busy,!!editor,tab]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(t);}},[toast]);
  const handleError = e => { if(e.status===401) {setData(null);setEditor(null);} setError(e.message); };
  const saveGuest = async form => { setBusy(true);setError('');try { const g=await api(form.id?`/admin/guests/${form.id}`:'/admin/guests',{method:form.id?'PUT':'POST',body:JSON.stringify(form)});setData(d=>({...d,guests:[...d.guests.filter(x=>x.id!==g.id),g].sort((a,b)=>a.name.localeCompare(b.name))}));setEditor(null);setToast('Invitation saved with love.'); }catch(e){handleError(e);}finally{setBusy(false);} };
  const remove = async guest => { if(!confirm(`Remove ${guest.name} from the guest list? Their invitation link will stop working.`))return;setBusy(true);setError('');try{await api(`/admin/guests/${guest.id}`,{method:'DELETE'});setData(d=>({...d,guests:d.guests.filter(g=>g.id!==guest.id)}));setToast('Guest removed.');}catch(e){handleError(e);}finally{setBusy(false);} };
  const copy = async guest => {void warmInvitationPreview(guest);try {await navigator.clipboard.writeText(`${location.origin}${invitationPath(guest)}`);setToast(`Invitation link copied for ${guest.name}.`);}catch{setError('Could not copy. Open the invitation and copy its address from your browser.');}};
  const saveSettings = async settings => {setBusy(true);setError('');try{const updated=await api('/admin/settings',{method:'PUT',body:JSON.stringify(settings)});setData(d=>({...d,settings:updated}));setToast('Details saved. Guest cards will update automatically.');}catch(e){handleError(e);}finally{setBusy(false);} };
  const exportBackup = () => {const url=URL.createObjectURL(new Blob([JSON.stringify({settings:data.settings,guests:data.guests},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`wajid-wedding-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  if(loading)return <Loading text="Opening the family dashboard…"/>;
  if(!data)return <><Login onLogin={refresh}/><ErrorBox error={error}/></>;
  const filtered=data.guests.filter(g=>(rsvpFilter==='all'||(g.rsvp?.status||'pending')===rsvpFilter)&&(filter==='all'||g.events.includes(filter))&&`${g.name} ${g.label}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-app"><Header admin groom={data.settings.groom}/><main className="admin-main"><div className="admin-title"><div><p className="eyebrow">A LITTLE PLANNING, A LOT OF LOVE</p><h1>The family dashboard.</h1><p>Add your guests, choose their functions, and share their invitation.</p></div><button className="text-button" onClick={async()=>{try{await api('/logout',{method:'POST',body:'{}'});setData(null);}catch(e){setError(e.message);}}}><Icon as={LogOut} size={16}/> Sign out</button></div>{data.development && <div className="preview-banner">Your changes are saved on this computer. Guests can open their links once the site is published.</div>}<div className="dashboard-guide"><span><b>01</b> Add a guest</span><Icon as={ArrowRight} size={15}/><span><b>02</b> Choose functions & family</span><Icon as={ArrowRight} size={15}/><span><b>03</b> Copy & share their link</span></div><div className="stats-grid"><div><span>Total invitations</span><strong>{data.guests.length}</strong><Icon as={Mail}/></div>{Object.entries(titles).map(([id,name])=><div key={id}><span>{name} invitations</span><strong>{data.guests.filter(g=>g.events.includes(id)).length}</strong><Icon as={Flower2}/></div>)}</div><div className="admin-tabs" role="tablist" aria-label="Dashboard sections"><button role="tab" aria-selected={tab==='guests'} aria-controls="guests-panel" id="guests-tab" onClick={()=>{setTab('guests');setError('');}}><Icon as={Users}/> Guest list</button><button role="tab" aria-selected={tab==='settings'} aria-controls="settings-panel" id="settings-tab" onClick={()=>{setTab('settings');setError('');}}><Icon as={CalendarDays}/> Dates & venues</button></div><section id="guests-panel" role="tabpanel" aria-labelledby="guests-tab" hidden={tab!=='guests'}><div className="admin-section-title"><div><h2>Your favourite people</h2><p>Share each guest's personal link. Guests see only their own card and selected functions.</p></div><div className="button-group"><button className="secondary-button" onClick={exportBackup}><Icon as={Download} size={16}/> Download backup</button><button className="primary-button" onClick={()=>{setError('');setEditor({});}}><Icon as={Plus}/> Add new guest</button></div></div>{!editor && <ErrorBox error={error}/>}<div className="rsvp-summary" aria-label="RSVP totals">{[['accepted','Accepted'],['declined','Declined'],['pending','Awaiting reply']].map(([status,label])=><span key={status}><strong>{data.guests.filter(g=>(g.rsvp?.status||'pending')===status).length}</strong>{label}</span>)}<small>Replies refresh automatically.</small></div><div className="guest-toolbar"><label className="search-field"><Icon as={Search}/><input aria-label="Search guests" placeholder="Search guests…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filter by function" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All functions</option>{Object.entries(titles).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><select aria-label="Filter by RSVP" value={rsvpFilter} onChange={e=>setRsvpFilter(e.target.value)}><option value="all">All replies</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="pending">Awaiting reply</option></select></div><div className="guest-table-wrap"><table className="guest-table"><thead><tr><th>GUEST</th><th>INVITED TO</th><th>INVITATION</th><th>RSVP</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map(guest=><tr key={guest.id}><td><div className="table-name"><span className="guest-initial">{guest.name.charAt(0)}</span><span>{guest.name}{guest.label && <small>{guest.label}</small>}</span></div></td><td><div className="pill-group">{guest.events.map(id=><span key={id} className={`event-pill ${id}`}>{titles[id]}</span>)}</div></td><td><span className="family-status">{guest.withFamily?<><Icon as={Users} size={15}/> With family</>:'Individual'}</span></td><td className="rsvp-cell"><span className={`rsvp-badge rsvp-${guest.rsvp?.status||'pending'}`}>{guest.rsvp?.status==='accepted'?'Accepted':guest.rsvp?.status==='declined'?'Declined':'Awaiting reply'}</span>{guest.rsvp?.updatedAt&&<small>{new Date(guest.rsvp.updatedAt).toLocaleString('en-GB',{timeZone:'Asia/Karachi',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} PKT</small>}</td><td><label className="guest-link-field">Personal invitation link<input readOnly aria-label={`Invitation link for ${guest.name}`} value={`${location.origin}${invitationPath(guest)}`} onFocus={e=>{e.target.select();void warmInvitationPreview(guest);}}/></label><div className="row-actions"><button className="icon-button" title="Copy invitation link" aria-label={`Copy link for ${guest.name}`} onPointerEnter={()=>warmInvitationPreview(guest)} onFocus={()=>warmInvitationPreview(guest)} onClick={()=>copy(guest)}><Icon as={Copy} size={16}/><span className="action-caption">Copy link</span></button><a className="icon-button" title="Preview invitation" aria-label={`Preview ${guest.name}`} href={invitationPath(guest)} target="_blank" rel="noreferrer"><Icon as={ExternalLink} size={16}/></a><button className="icon-button" aria-label={`Edit ${guest.name}`} onClick={()=>{setError('');setEditor(guest);}} disabled={busy}><Icon as={Pencil} size={16}/><span className="action-caption">Edit</span></button><button className="icon-button delete-button" aria-label={`Remove ${guest.name}`} onClick={()=>remove(guest)} disabled={busy}><Icon as={Trash2} size={16}/></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="table-empty"><Icon as={Mail} size={30}/><h3>{data.guests.length?'No matching guests':'Your celebration starts with your people.'}</h3><p>{data.guests.length?'Try another name or function.':'Add your first guest to create a personal invitation.'}</p></div>}</div><p className="table-count">{filtered.length} invitation{filtered.length!==1?'s':''} · Family invitations may include multiple people.</p></section><section id="settings-panel" role="tabpanel" aria-labelledby="settings-tab" hidden={tab!=='settings'}><SettingsForm initial={data.settings} save={saveSettings} busy={busy} error={error}/></section></main><Footer/>{editor && <GuestEditor guest={editor.id?editor:null} onSave={saveGuest} onClose={()=>{setEditor(null);setError('');}} busy={busy} error={error}/>}<div className={`toast ${toast?'visible':''}`} role="status">{toast && <><Icon as={Check}/>{toast}</>}</div></div>;
}
function App() {
  const admin=['/backend','/admin'].includes(location.pathname.replace(/\/$/,''));
  if(location.pathname.replace(/\/$/,'')==='/family')return <Login family onLogin={()=>{location.assign('/');}}/>;
  return admin ? <Admin/> : <WeddingExperience/>;
}
createRoot(document.getElementById('root')).render(<App/>);
