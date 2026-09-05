// Espace Enfants CE2 — Mon métier — V0.29
const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const STUDENTS = ELEVES.map(e => e.prenom);

const JOBS = [
  {icon:"📦",name:"Distributeur",detail:"Je distribue et je ramasse les cahiers, fiches et documents.",rule:"Je fais vite, calmement et sans jouer.",fixedPair:true},
  {icon:"🚶",name:"Chef de rang",detail:"Je conduis le rang calmement et en sécurité.",rule:"Je marche et j’attends le groupe."},
  {icon:"📚",name:"Bibliothécaire",detail:"Je range et je prends soin des livres.",rule:"Je manipule les livres avec soin."},
  {icon:"✉️",name:"Facteur",detail:"Je porte les messages ou documents dans l’école.",rule:"Je vais directement à l’endroit demandé puis je reviens.",fixedPair:true},
  {icon:"🎤",name:"Animateur du Quoi de neuf",detail:"J’annonce les passages et je distribue la parole.",rule:"Je veille à ce que chacun puisse parler."},
  {icon:"🧹",name:"Agent d’entretien",detail:"J’aide à garder la classe propre et rangée.",rule:"Je n’utilise que le matériel prévu."},
  {icon:"📝",name:"Écrivain",detail:"J’écris la date au tableau.",rule:"Je vérifie la date avant de l’écrire."},
  {icon:"🔐",name:"Gardien",detail:"Avec l’accord du maître, je ferme à clé les portes nécessaires.",rule:"Je ne ferme une porte que si le maître le demande."},
  {icon:"🦜",name:"Perroquet",detail:"Je reformule une consigne importante avec mes mots.",rule:"Je n’ajoute pas de nouvelle consigne."},
  {icon:"🤫",name:"Gardien du calme",detail:"J’aide la classe à rester calme.",rule:"Je rappelle gentiment la règle sans commander."}
];

const FIXED_PAIR = new Set(["Distributeur","Facteur"]);
const FLEX_STUDENTS = new Set(["Anis","Rayan"]);
const MORNING_CRITICAL = new Set(["Distributeur","Chef de rang","Animateur du Quoi de neuf","Écrivain","Gardien"]);

const HISTORY_KEY = "nino_metiers_history_v4";
const CURRENT_PREFIX = "nino_metiers_week_v4_";
const PERIOD_START_KEY = "nino_metiers_period_start_v2";
const FALLBACK = "assets/portraits/portrait_neutre.png";

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function mondayOf(d=new Date()){d=new Date(d.getFullYear(),d.getMonth(),d.getDate());const day=d.getDay();d.setDate(d.getDate()+(day===0?-6:1-day));d.setHours(12,0,0,0);return d;}
function keyOf(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function fmt(d){return new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"long",year:"numeric"}).format(d);}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function photo(prenom){const e=ELEVES.find(x=>x.prenom===prenom);return encodeURI(`assets/eleves/${e?.fichier||prenom.replace(/\s+/g,"_")+".jpg"}`)+"?v=029";}

function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"{}")}catch{return {}}}
function periodStart(currentKey,h){let s=localStorage.getItem(PERIOD_START_KEY);if(s&&s<=currentKey)return s;const ks=Object.keys(h).filter(k=>k<=currentKey).sort();s=ks[0]||currentKey;localStorage.setItem(PERIOD_START_KEY,s);return s;}
function periodRecords(h,start,current){return Object.entries(h).filter(([k])=>k>=start&&k<=current).sort(([a],[b])=>a.localeCompare(b)).map(([,r])=>r).filter(r=>r?.assignments);}

function stats(records){
  const s=Object.fromEntries(STUDENTS.map(n=>[n,{jobs:Object.fromEntries(JOBS.map(j=>[j.name,0])),solo:0,pair:0,replacement:0}]));
  records.forEach(r=>{
    r.assignments.forEach(a=>a.students.forEach(n=>{if(!s[n])return;s[n].jobs[a.job]++;a.students.length===1?s[n].solo++:s[n].pair++;}));
    if(r.replacement&&s[r.replacement])s[r.replacement].replacement++;
  });
  return s;
}

function candidate(){
  const people=shuffle(STUDENTS);
  const rotating=shuffle(JOBS.filter(j=>!j.fixedPair)).slice(0,3).map(j=>j.name);
  const paired=new Set([...FIXED_PAIR,...rotating]);
  const assignments=[];let i=0;
  JOBS.forEach(j=>{
    const count=paired.has(j.name)?2:1;
    assignments.push({job:j.name,students:people.slice(i,i+count)});
    i+=count;
  });
  return {assignments,replacement:shuffle(STUDENTS)[0],rotatingPairJobs:rotating};
}

function score(c,prev,st){
  let x=0;
  c.assignments.forEach(a=>{
    a.students.forEach(n=>{
      if(a.students.length===1&&FLEX_STUDENTS.has(n)&&MORNING_CRITICAL.has(a.job))x+=10000;
      x+=(st[n]?.jobs[a.job]||0)*18;
      if(a.students.length===1&&st[n]?.solo>st[n]?.pair)x+=(st[n].solo-st[n].pair)*2;
      if(a.students.length===2&&st[n]?.pair>st[n]?.solo)x+=(st[n].pair-st[n].solo)*2;
      if(prev){
        const old=prev.assignments.find(z=>z.students.includes(n));
        if(old?.job===a.job)x+=25;
      }
    });
  });
  x+=(st[c.replacement]?.replacement||0)*20;
  if(prev?.replacement===c.replacement)x+=30;
  return x;
}

function makeDraw(weekKey,h){
  const start=periodStart(weekKey,h), st=stats(periodRecords(h,start,weekKey));
  const prev=Object.entries(h).filter(([k])=>k<weekKey).sort(([a],[b])=>a.localeCompare(b)).at(-1)?.[1];
  let best=null,bestScore=Infinity;
  for(let i=0;i<6000;i++){const c=candidate(),s=score(c,prev,st);if(s<bestScore){best=c;bestScore=s;if(!s)break;}}
  return {week:weekKey,createdAt:new Date().toISOString(),...best};
}

function loadDraw(){
  const monday=mondayOf(), weekKey=keyOf(monday), storageKey=CURRENT_PREFIX+weekKey;
  let h=loadHistory(), d;
  try{d=JSON.parse(localStorage.getItem(storageKey)||"null")}catch{}
  if(!d?.assignments||d.assignments.length!==JOBS.length){
    d=makeDraw(weekKey,h); localStorage.setItem(storageKey,JSON.stringify(d)); h[weekKey]=d; localStorage.setItem(HISTORY_KEY,JSON.stringify(h));
  } else if(!h[weekKey]) {h[weekKey]=d;localStorage.setItem(HISTORY_KEY,JSON.stringify(h));}
  return {d,monday,weekKey,h};
}

const {d,monday,weekKey}=loadDraw();
document.querySelector("#week-note").textContent=`🔄 Semaine du lundi ${fmt(monday)}`;
document.querySelector("#draw-status").textContent="Distributeur et Facteur sont toujours en binôme. Trois autres métiers sont aussi en binôme cette semaine. Le remplaçant a déjà son métier principal.";

const byJob=Object.fromEntries(JOBS.map(j=>[j.name,j]));
const current=document.querySelector("#current-jobs");
current.innerHTML=d.assignments.map((a,i)=>{
  const j=byJob[a.job], repl=a.students.includes(d.replacement);
  return `<article class="assignment-card${repl?" assignment-card--replacement-role":""}">
    <button class="assignment-toggle" type="button" aria-expanded="false">
      <div class="assignment-job"><span class="assignment-icon">${j.icon}</span><span class="assignment-title">${j.name}</span>${repl?'<span class="replacement-badge">+ remplaçant</span>':""}<span class="assignment-chevron">⌄</span></div>
      <div class="assignment-students">${a.students.map(n=>`<div class="assignment-student"><span class="assignment-student-photo-wrap"><img class="assignment-student-photo" src="${photo(n)}" alt="Portrait de ${esc(n)}"></span><span class="assignment-student-name">${esc(n)}</span></div>`).join("")}</div>
    </button>
    <div class="assignment-detail" hidden><p><strong>Ce que je dois faire :</strong> ${esc(j.detail)}</p><p><strong>⭐ À retenir :</strong> ${esc(j.rule)}</p>${repl?`<div class="replacement-detail"><strong>🔄 Rôle supplémentaire :</strong> si un élève responsable est absent, je prends temporairement son métier en plus du mien.</div>`:""}</div>
  </article>`;
}).join("");

document.querySelectorAll(".assignment-student-photo").forEach(img=>img.addEventListener("error",()=>{if(!img.src.includes("portrait_neutre.png"))img.src=FALLBACK},{once:true}));
document.querySelectorAll(".assignment-toggle").forEach(b=>b.addEventListener("click",()=>{const card=b.closest(".assignment-card"),detail=card.querySelector(".assignment-detail"),open=!detail.hidden;detail.hidden=open;card.classList.toggle("is-open",!open);b.setAttribute("aria-expanded",String(!open));}));

const grid=document.querySelector("#jobs-grid");
grid.innerHTML=JOBS.map((j,i)=>`<button class="job-card" data-job="${i}" type="button"><span class="job-icon">${j.icon}</span><span class="job-name">${j.name}</span><span class="job-pair">👥 ${d.assignments.find(a=>a.job===j.name).students.join(" + ")}</span></button>`).join("");
document.querySelectorAll("[data-job]").forEach(b=>b.addEventListener("click",()=>{const j=JOBS[+b.dataset.job],old=b.querySelector(".job-inline-detail");if(old){old.remove();return;}const x=document.createElement("span");x.className="job-inline-detail";x.innerHTML=`<strong>Ce que je dois faire :</strong> ${esc(j.detail)}<br><strong>⭐ À retenir :</strong> ${esc(j.rule)}`;b.appendChild(x)}));

const panel=document.querySelector("#all-jobs-panel"), show=document.querySelector("#show-all-jobs");
show.addEventListener("click",()=>{panel.hidden=!panel.hidden;show.textContent=panel.hidden?"📋 Voir les métiers":"✕ Masquer les métiers";if(!panel.hidden)panel.scrollIntoView({behavior:"smooth",block:"start"});});

// Compteur période
const statsPanel=document.querySelector("#period-stats-panel"), statsGrid=document.querySelector("#period-stats-grid"), statsSummary=document.querySelector("#period-stats-summary");
document.querySelector("#show-period-stats").addEventListener("click",e=>{
  const open=statsPanel.hidden; statsPanel.hidden=!open; e.currentTarget.textContent=open?"✕ Masquer la répartition":"📊 Répartition de la période";
  if(open){renderStats();statsPanel.scrollIntoView({behavior:"smooth",block:"start"});}
});
function renderStats(){
  const h=loadHistory(), start=periodStart(weekKey,h), recs=periodRecords(h,start,weekKey), s=stats(recs);
  statsSummary.textContent=`${recs.length} semaine(s) comptabilisée(s) depuis le ${start.split("-").reverse().join("/")}.`;
  statsGrid.innerHTML=STUDENTS.map(n=>`<article class="period-student-card"><div class="period-student-head"><strong>${esc(n)}</strong><span>${s[n].solo+s[n].pair} semaine(s)</span></div><div class="period-balance"><span>👤 Seul : <b>${s[n].solo}</b></span><span>👥 Binôme : <b>${s[n].pair}</b></span><span>🔄 Remplaçant : <b>${s[n].replacement}</b></span></div><div class="period-job-counts">${JOBS.filter(j=>s[n].jobs[j.name]).map(j=>`<span class="period-job-chip">${j.icon} ${esc(j.name)} <b>×${s[n].jobs[j.name]}</b></span>`).join("")||'<span class="period-empty">Aucun métier comptabilisé</span>'}</div></article>`).join("");
}
document.querySelector("#period-reset-button").addEventListener("click",()=>{if(confirm("Commencer une nouvelle période ?")){localStorage.setItem(PERIOD_START_KEY,weekKey);renderStats();}});
