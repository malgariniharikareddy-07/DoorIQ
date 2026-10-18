const scenarios={
 delivery:{label:'Delivery',icon:'📦',kicker:'DELIVERY EVENT',urgency:'LOW INTERRUPT',level:'calm',recs:{
 busy:['A delivery may be arriving','If your courier permits it, use your saved delivery instructions to request a drop-off at your designated safe place.','You said you are busy, so a low-interruption suggestion is shown.'],
 available:['Check the delivery','If convenient, review the authorized doorbell view or respond to the courier. Confirm the package location afterward.','You are available, so DoorIQ suggests checking the delivery now.'],
 safe:['Review your delivery preferences','Use only a location you have designated as safe. Avoid sharing access codes or sensitive details in public instructions.','Your safety-first preference prioritizes private, saved instructions.']}},
 guest:{label:'Expected guest',icon:'👋',kicker:'EXPECTED VISITOR',urgency:'NORMAL',level:'calm',recs:{
 busy:['An expected guest may be here','Send a quick message to let them know you are busy, or use your saved arrival instructions.','You are busy, so a low-interruption response is suggested.'],
 available:['Welcome your guest','If you are ready, respond through your normal process and confirm that the visitor is the person you expected.','You are available, so DoorIQ suggests responding when ready.'],
 safe:['Verify before responding','Check your expected-visitor details before sharing information or granting access.','Your safety-first preference keeps access decisions under your control.']}},
 unknown:{label:'Unknown visitor',icon:'🔔',kicker:'UNRECOGNIZED EVENT',urgency:'REVIEW CAREFULLY',level:'medium',recs:{
 busy:['An unrecognized visitor was detected','You do not need to respond immediately. Review the authorized event details when you can.','You are busy, so DoorIQ suggests reviewing later rather than rushing.'],
 available:['Review the visitor event','Use the supported doorbell view to assess the situation. Do not unlock the door automatically.','You are available, but access decisions remain yours.'],
 safe:['Prioritize safety and privacy','Do not share personal details or grant access based only on an event alert. Follow your normal household safety process.','Your safety-first preference emphasizes caution and privacy.']}},
 bell:{label:'Doorbell pressed',icon:'🚪',kicker:'DOORBELL EVENT',urgency:'NORMAL',level:'calm',recs:{
 busy:['Someone rang the doorbell','If you cannot respond now, check the event later or use your saved visitor instructions.','You are busy, so the suggestion avoids unnecessary interruption.'],
 available:['Respond when ready','Check who is at the door through your normal, authorized process before opening it.','You are available, so DoorIQ suggests checking the event.'],
 safe:['Check before taking action','Review the event and follow your household safety preferences. Keep access decisions under your control.','Your safety-first preference keeps you in control.']}}
};
let currentEvent='delivery', count=0, history=[];
const $=id=>document.getElementById(id);
document.querySelectorAll('.event-option').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.event-option').forEach(b=>b.classList.remove('selected'));
 btn.classList.add('selected');currentEvent=btn.dataset.event;
}));
function translate(){
 const pref=$('preference').value, s=scenarios[currentEvent], r=s.recs[pref], note=$('customNote').value.trim();
 $('recIcon').textContent=s.icon;$('recKicker').textContent=s.kicker;$('recTitle').textContent=r[0];$('recBody').textContent=r[1];$('whyText').textContent=r[2];
 $('urgency').textContent=s.urgency;$('urgency').className='urgency '+s.level;
 $('personalNote').textContent=note?`Your household note: “${note}” — check that it is appropriate and safe before using it.`:'';$('personalNote').classList.toggle('hidden',!note);
 $('actionStatus').textContent='No action taken — this is a recommendation only.';
 count++;$('eventCount').textContent=String(count).padStart(2,'0');
 const item={event:s.label,pref:pref==='busy'?'Busy':pref==='available'?'Available':'Safety-first',rec:r[0],status:'Reviewed'};
 history.unshift(item);renderHistory();
}
function renderHistory(){
 const root=$('history');
 if(!history.length){root.innerHTML='<div class="empty-history"><span>✧</span><b>Your activity will show up here</b><p>Try a scenario above to create your first demo event.</p></div>';return}
 root.innerHTML=history.slice(0,8).map((h,i)=>`<div class="activity-row"><span><b>${escapeHtml(h.event)}</b></span><span>${escapeHtml(h.pref)}</span><span>${escapeHtml(h.rec)}</span><span><span class="status-pill">${escapeHtml(h.status)}</span></span></div>`).join('');
}
function escapeHtml(str){return str.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('translateBtn').addEventListener('click',translate);
$('markDone').addEventListener('click',()=>{$('actionStatus').textContent='Marked as reviewed in this demo session. No real-world action was performed.';if(history.length){history[0].status='Reviewed';renderHistory();}});
$('saveRule').addEventListener('click',()=>{const pref=$('preference').value;const names={busy:'Low-interruption',available:'Available to respond',safe:'Safety-first'};$('actionStatus').textContent=`Preference “${names[pref]}” saved for this browser session only.`;$('saveRule').textContent='★ Preference saved';});
$('clearHistory').addEventListener('click',()=>{history=[];count=0;$('eventCount').textContent='00';renderHistory();$('actionStatus').textContent='Demo history cleared.';});
$('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');$('themeBtn').textContent=document.body.classList.contains('dark')?'☀':'☾';});
