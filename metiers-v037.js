// Espace Enfants CE2 — Mon métier — V0.37
// Nouvelles règles à partir du lundi 14 septembre 2026.
// La semaine du 7 septembre reste strictement basée sur le tirage V0.33 déjà mémorisé.

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const ALL_STUDENTS = ELEVES.map(e => e.prenom);

const NEW_RULES_START = "2026-09-14";
const ULIS_EXCLUDED = new Set(["Ritej", "Anis", "Rayan"]);
const ELIGIBLE_STUDENTS = ALL_STUDENTS.filter(n => !ULIS_EXCLUDED.has(n));

const JOBS = [
  {
    icon:"📦", name:"Distributeur", banner:"assets/metiers/distributeur.png?v=032",
    detail:"Nous distribuons et nous ramassons les cahiers, fiches et documents.",
    rule:"Nous faisons vite, calmement et sans jouer.",
    type:"principal", places:2
  },
  {
    icon:"🚶", name:"Chef de rang", banner:"assets/metiers/chef-de-rang.png",
    detail:"Je conduis le rang calmement et en sécurité. Je peux choisir un camarade pour m’accompagner devant.",
    rule:"Je marche, j’attends le groupe et je m’adapte au sens du déplacement.",
    type:"principal", places:1
  },
  {
    icon:"📚", name:"Bibliothécaire", banner:"assets/metiers/bibliothecaire.png",
    detail:"Nous rangeons et nous prenons soin des livres.",
    rule:"Nous manipulons les livres avec soin.",
    type:"principal", places:2
  },
  {
    icon:"✉️", name:"Facteur", banner:"assets/metiers/facteur.png",
    detail:"À deux, nous portons un message ou un document dans l’école quand le maître en a besoin.",
    rule:"Nous restons ensemble, allons directement à l’endroit demandé puis revenons en classe.",
    type:"mission", places:2
  },
  {
    icon:"🎤", name:"Animateur du Quoi de neuf", banner:"assets/metiers/animateur-quoi-de-neuf.png",
    detail:"Le lundi matin, j’annonce les passages et je distribue la parole pendant le Quoi de neuf.",
    rule:"Cette mission ne sert que le lundi matin et s’ajoute à mon métier principal.",
    type:"mission", places:1
  },
  {
    icon:"🧹", name:"Agent d’entretien", banner:"assets/metiers/agent-entretien.png",
    detail:"Nous aidons à garder la classe propre et rangée.",
    rule:"Nous n’utilisons que le matériel prévu.",
    type:"principal", places:2
  },
  {
    icon:"📝", name:"Écrivain", banner:"assets/metiers/ecrivain.png",
    detail:"Nous nous partageons la date : un responsable le matin et un responsable l’après-midi.",
    rule:"Le responsable vérifie la date avant de l’écrire.",
    type:"principal", places:2, labels:["matin", "après-midi"]
  },
  {
    icon:"🔐", name:"Gardien", banner:"assets/metiers/gardien.png",
    detail:"Avec l’accord du maître, je m’occupe de la porte. Je peux être devant ou derrière le rang selon le sens du déplacement.",
    rule:"Je ferme la porte uniquement lorsque le maître le demande.",
    type:"principal", places:1
  },
  {
    icon:"🦜", name:"Perroquet", banner:"assets/metiers/perroquet.png?v=033",
    detail:"À deux, nous alternons pour reformuler les consignes importantes avec nos mots.",
    rule:"Un seul perroquet parle à la fois et nous n’ajoutons pas de nouvelle consigne.",
    type:"principal", places:2
  },
  {
    icon:"🤫", name:"Gardien du calme", banner:"assets/metiers/gardien-du-calme.png",
    detail:"J’aide la classe à rester calme.",
    rule:"Je rappelle gentiment la règle sans commander.",
    type:"principal", places:1
  }
];

const LEGACY_HISTORY_KEY = "nino_metiers_history_v4";
const LEGACY_CURRENT_PREFIX = "nino_metiers_week_v4_";
const NEW_HISTORY_KEY = "nino_metiers_history_v5";
const NEW_CURRENT_PREFIX = "nino_metiers_week_v5_";
const PERIOD_START_KEY = "nino_metiers_period_start_v2";
const FALLBACK = "assets/portraits/portrait_neutre.png";

function shuffle(a){
  a=[...a];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function mondayOf(d=new Date()){
  d=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const day=d.getDay();
  d.setDate(d.getDate()+(day===0?-6:1-day));
  d.setHours(12,0,0,0);
  return d;
}
function keyOf(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmt(d){
  return new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"long",year:"numeric"}).format(d);
}
function esc(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function photo(prenom){
  const e=ELEVES.find(x=>x.prenom===prenom);
  return encodeURI(`assets/eleves/${e?.fichier||prenom.replace(/\s+/g,"_")+".jpg"}`)+"?v=029";
}
function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}
}
function writeJson(key,value){
  localStorage.setItem(key,JSON.stringify(value));
}
function previousRecord(history,currentKey){
  return Object.entries(history)
    .filter(([k])=>k<currentKey)
    .sort(([a],[b])=>a.localeCompare(b))
    .at(-1)?.[1] || null;
}
function normalizePair(a,b){
  return [a,b].sort((x,y)=>x.localeCompare(y,"fr")).join("|");
}

// ---------- SEMAINE EN COURS : ancien fonctionnement conservé ----------
function legacyCandidate(){
  const fixedPair=new Set(["Distributeur","Facteur"]);
  const people=shuffle(ALL_STUDENTS);
  const rotating=shuffle(JOBS.filter(j=>!fixedPair.has(j.name))).slice(0,3).map(j=>j.name);
  const paired=new Set([...fixedPair,...rotating]);
  const assignments=[];
  let i=0;
  JOBS.forEach(j=>{
    const count=paired.has(j.name)?2:1;
    assignments.push({job:j.name,students:people.slice(i,i+count)});
    i+=count;
  });
  return {assignments,replacement:shuffle(ALL_STUDENTS)[0],rotatingPairJobs:rotating};
}
function loadLegacyDraw(weekKey){
  const storageKey=LEGACY_CURRENT_PREFIX+weekKey;
  let d=readJson(storageKey,null);
  let h=readJson(LEGACY_HISTORY_KEY,{});

  // Normalement le tirage existe déjà : on le reprend sans aucune modification.
  if(!d?.assignments){
    d={week:weekKey,createdAt:new Date().toISOString(),...legacyCandidate()};
    writeJson(storageKey,d);
    h[weekKey]=d;
    writeJson(LEGACY_HISTORY_KEY,h);
  }
  return {d,h,mode:"legacy"};
}

// ---------- À PARTIR DU 14/09/2026 : nouveau fonctionnement ----------
const PRIMARY_JOBS = JOBS.filter(j=>j.type==="principal");
const MISSION_JOBS = JOBS.filter(j=>j.type==="mission");
const PRIMARY_SLOT_COUNT = PRIMARY_JOBS.reduce((n,j)=>n+j.places,0);

function loadNewHistory(){
  return readJson(NEW_HISTORY_KEY,{});
}
function newStats(records){
  const s=Object.fromEntries(ELIGIBLE_STUDENTS.map(n=>[n,{jobs:{},missions:0}]));
  records.forEach(r=>{
    (r.assignments||[]).forEach(a=>{
      a.students.forEach(n=>{
        if(!s[n]) return;
        s[n].jobs[a.job]=(s[n].jobs[a.job]||0)+1;
        if(a.type==="mission") s[n].missions++;
      });
    });
  });
  return s;
}
function buildPrimaryAssignments(people){
  const assignments=[];
  let index=0;
  PRIMARY_JOBS.forEach(job=>{
    const students=people.slice(index,index+job.places);
    assignments.push({job:job.name,type:"principal",students,labels:job.labels||null});
    index+=job.places;
  });
  return assignments;
}
function chooseMissions(people,stats,previous){
  const scoreFor=(student,jobName)=>{
    let score=(stats[student]?.jobs?.[jobName]||0)*20;
    const old=previous?.assignments?.find(a=>a.job===jobName&&a.students.includes(student));
    if(old) score+=30;
    score+=(stats[student]?.missions||0)*5;
    return score+Math.random();
  };

  const sortedFor=jobName=>[...people].sort((a,b)=>scoreFor(a,jobName)-scoreFor(b,jobName));
  const factors=sortedFor("Facteur").slice(0,2);
  const animator=sortedFor("Animateur du Quoi de neuf").find(n=>!factors.includes(n)) || sortedFor("Animateur du Quoi de neuf")[0];

  return [
    {job:"Facteur",type:"mission",students:factors},
    {job:"Animateur du Quoi de neuf",type:"mission",students:[animator]}
  ];
}
function scoreNewCandidate(assignments,previous,stats){
  let score=0;
  const prevPairs=new Set();
  (previous?.assignments||[]).forEach(a=>{
    if(a.type!=="principal") return;
    if(a.students.length===2) prevPairs.add(normalizePair(a.students[0],a.students[1]));
  });

  assignments.filter(a=>a.type==="principal").forEach(a=>{
    a.students.forEach(n=>{
      score+=(stats[n]?.jobs?.[a.job]||0)*18;
      const old=(previous?.assignments||[]).find(z=>z.type==="principal"&&z.students.includes(n));
      if(old?.job===a.job) score+=35;
    });
    if(a.students.length===2&&prevPairs.has(normalizePair(a.students[0],a.students[1]))) score+=8;
  });
  return score;
}
function makeNewDraw(weekKey,history){
  if(ELIGIBLE_STUDENTS.length!==PRIMARY_SLOT_COUNT){
    console.warn(`[Métiers] ${ELIGIBLE_STUDENTS.length} élèves éligibles pour ${PRIMARY_SLOT_COUNT} places principales.`);
  }

  const previous=previousRecord(history,weekKey);
  const records=Object.values(history).filter(r=>r?.assignments);
  const stats=newStats(records);
  let best=null,bestScore=Infinity;

  for(let i=0;i<6000;i++){
    const people=shuffle(ELIGIBLE_STUDENTS);
    const primary=buildPrimaryAssignments(people);
    const score=scoreNewCandidate(primary,previous,stats);
    if(score<bestScore){
      best=primary;
      bestScore=score;
      if(score===0) break;
    }
  }

  const missions=chooseMissions(ELIGIBLE_STUDENTS,stats,previous);
  return {
    week:weekKey,
    createdAt:new Date().toISOString(),
    rulesVersion:"v5",
    assignments:[...best,...missions]
  };
}
function loadNewDraw(weekKey){
  const storageKey=NEW_CURRENT_PREFIX+weekKey;
  let d=readJson(storageKey,null);
  let h=loadNewHistory();
  if(!d?.assignments){
    d=makeNewDraw(weekKey,h);
    writeJson(storageKey,d);
    h[weekKey]=d;
    writeJson(NEW_HISTORY_KEY,h);
  }else if(!h[weekKey]){
    h[weekKey]=d;
    writeJson(NEW_HISTORY_KEY,h);
  }
  return {d,h,mode:"new"};
}

function dateFromWeekParam(){
  const raw=new URLSearchParams(location.search).get("week");
  if(!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return mondayOf();
  const d=new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? mondayOf() : mondayOf(d);
}
function loadDraw(){
  const monday=dateFromWeekParam();
  const weekKey=keyOf(monday);
  const loaded=weekKey<NEW_RULES_START ? loadLegacyDraw(weekKey) : loadNewDraw(weekKey);
  return {...loaded,monday,weekKey};
}
function goToWeek(date){
  const url=new URL(location.href);
  const currentKey=keyOf(mondayOf());
  const targetKey=keyOf(mondayOf(date));
  if(targetKey===currentKey) url.searchParams.delete("week");
  else url.searchParams.set("week",targetKey);
  location.href=url.toString();
}
function offsetWeek(date,weeks){
  const d=new Date(date);
  d.setDate(d.getDate()+weeks*7);
  return d;
}

const {d,monday,weekKey,mode}=loadDraw();
const isNew=mode==="new";
const realMonday=mondayOf();
const realWeekKey=keyOf(realMonday);
const isViewingCurrent=weekKey===realWeekKey;
const isViewingFuture=weekKey>realWeekKey;

document.querySelector("#week-note").textContent=`${isViewingCurrent?"🔄":isViewingFuture?"🔮":"🕘"} Semaine du lundi ${fmt(monday)}`;
document.querySelector("#draw-status").textContent=isViewingCurrent
  ? (isNew
      ? "Un métier principal pour chacun. Facteur (à deux) et Animateur du Quoi de neuf sont des missions supplémentaires."
      : "Répartition actuelle conservée sans changement. Les nouvelles règles commenceront lundi 14 septembre.")
  : (isViewingFuture
      ? "Aperçu d’une prochaine semaine. Cette répartition est mémorisée pour conserver la rotation."
      : "Consultation d’une semaine précédente.");

document.querySelector("#previous-week").addEventListener("click",()=>goToWeek(offsetWeek(monday,-1)));
document.querySelector("#next-week").addEventListener("click",()=>goToWeek(offsetWeek(monday,1)));
document.querySelector("#current-week").addEventListener("click",()=>goToWeek(realMonday));
document.querySelector("#current-week").disabled=isViewingCurrent;

const byJob=Object.fromEntries(JOBS.map(j=>[j.name,j]));
const current=document.querySelector("#current-jobs");

function studentHtml(name,label){
  return `<div class="assignment-student">
    <span class="assignment-student-photo-wrap"><img class="assignment-student-photo" src="${photo(name)}" alt="Portrait de ${esc(name)}"></span>
    <span class="assignment-student-name">${esc(name)}</span>
    ${label?`<span class="assignment-student-slot">${esc(label)}</span>`:""}
  </div>`;
}

current.innerHTML=d.assignments.map(a=>{
  const j=byJob[a.job];
  if(!j) return "";
  const repl=!isNew&&d.replacement&&a.students.includes(d.replacement);
  const mission=isNew&&a.type==="mission";
  const labels=a.labels||j.labels||[];
  return `<article class="assignment-card${repl?" assignment-card--replacement-role":""}${mission?" assignment-card--mission":""}">
    <button class="assignment-toggle" type="button" aria-expanded="false">
      <div class="assignment-job">
        <img class="assignment-job-banner" src="${j.banner}" alt="${esc(j.name)}">
        ${mission?'<span class="replacement-badge">+ mission</span>':""}
        ${repl?'<span class="replacement-badge">+ remplaçant</span>':""}
        <span class="assignment-chevron">⌄</span>
      </div>
      <div class="assignment-students">${a.students.map((n,i)=>studentHtml(n,labels[i])).join("")}</div>
    </button>
    <div class="assignment-detail" hidden>
      <p><strong>Ce que je dois faire :</strong> ${esc(j.detail)}</p>
      <p><strong>⭐ À retenir :</strong> ${esc(j.rule)}</p>
      ${mission?'<div class="replacement-detail"><strong>➕ Mission supplémentaire :</strong> je garde aussi mon métier principal de la semaine.</div>':""}
      ${repl?'<div class="replacement-detail"><strong>🔄 Rôle supplémentaire :</strong> si un responsable est absent, je prends temporairement son métier en plus du mien.</div>':""}
    </div>
  </article>`;
}).join("");

document.querySelectorAll(".assignment-student-photo").forEach(img=>img.addEventListener("error",()=>{
  if(!img.src.includes("portrait_neutre.png")) img.src=FALLBACK;
},{once:true}));

document.querySelectorAll(".assignment-toggle").forEach(b=>b.addEventListener("click",()=>{
  const card=b.closest(".assignment-card"),detail=card.querySelector(".assignment-detail"),open=!detail.hidden;
  detail.hidden=open;
  card.classList.toggle("is-open",!open);
  b.setAttribute("aria-expanded",String(!open));
}));

const grid=document.querySelector("#jobs-grid");
grid.innerHTML=JOBS.map((j,i)=>{
  const a=d.assignments.find(x=>x.job===j.name);
  const names=a?.students||[];
  return `<button class="job-card job-card--banner" data-job="${i}" type="button">
    <img class="job-card-banner" src="${j.banner}" alt="${esc(j.name)}">
    <span class="job-pair">${j.type==="mission"&&isNew?"➕":"👥"} ${names.join(" + ")||"Non attribué"}</span>
  </button>`;
}).join("");

document.querySelectorAll("[data-job]").forEach(b=>b.addEventListener("click",()=>{
  const j=JOBS[+b.dataset.job],old=b.querySelector(".job-inline-detail");
  if(old){old.remove();return;}
  const x=document.createElement("span");
  x.className="job-inline-detail";
  x.innerHTML=`<strong>Ce que je dois faire :</strong> ${esc(j.detail)}<br><strong>⭐ À retenir :</strong> ${esc(j.rule)}`;
  b.appendChild(x);
}));

const panel=document.querySelector("#all-jobs-panel"),show=document.querySelector("#show-all-jobs");
show.addEventListener("click",()=>{
  panel.hidden=!panel.hidden;
  show.textContent=panel.hidden?"📋 Voir les métiers":"✕ Masquer les métiers";
  if(!panel.hidden)panel.scrollIntoView({behavior:"smooth",block:"start"});
});

// Compteur de période : ancien historique cette semaine, nouvel historique à partir du 14/09.
const statsPanel=document.querySelector("#period-stats-panel"),statsGrid=document.querySelector("#period-stats-grid"),statsSummary=document.querySelector("#period-stats-summary");
document.querySelector("#show-period-stats").addEventListener("click",e=>{
  const open=statsPanel.hidden;
  statsPanel.hidden=!open;
  e.currentTarget.textContent=open?"✕ Masquer la répartition":"📊 Répartition de la période";
  if(open){renderStats();statsPanel.scrollIntoView({behavior:"smooth",block:"start"});}
});

function renderStats(){
  if(!isNew){
    const h=readJson(LEGACY_HISTORY_KEY,{});
    const students=ALL_STUDENTS;
    const counts=Object.fromEntries(students.map(n=>[n,{}]));
    Object.values(h).filter(r=>r?.assignments).forEach(r=>r.assignments.forEach(a=>a.students.forEach(n=>{
      if(counts[n]) counts[n][a.job]=(counts[n][a.job]||0)+1;
    })));
    statsSummary.textContent="Historique de la période actuelle (ancien fonctionnement).";
    statsGrid.innerHTML=students.map(n=>`<article class="period-student-card"><div class="period-student-head"><strong>${esc(n)}</strong></div><div class="period-job-counts">${Object.entries(counts[n]).map(([job,c])=>`<span class="period-job-chip">${esc(job)} <b>×${c}</b></span>`).join("")||'<span class="period-empty">Aucun métier comptabilisé</span>'}</div></article>`).join("");
    return;
  }

  const h=loadNewHistory();
  const records=Object.values(h).filter(r=>r?.assignments && r.week<=realWeekKey);
  const s=newStats(records);
  statsSummary.textContent=`${records.length} semaine(s) écoulée(s) ou en cours comptabilisée(s). Les aperçus futurs ne sont pas inclus ici.`;
  statsGrid.innerHTML=ELIGIBLE_STUDENTS.map(n=>{
    const entries=Object.entries(s[n].jobs);
    return `<article class="period-student-card"><div class="period-student-head"><strong>${esc(n)}</strong></div><div class="period-job-counts">${entries.map(([job,c])=>`<span class="period-job-chip">${esc(job)} <b>×${c}</b></span>`).join("")||'<span class="period-empty">Aucune responsabilité comptabilisée</span>'}</div></article>`;
  }).join("");
}

document.querySelector("#period-reset-button").addEventListener("click",()=>{
  if(confirm("Commencer une nouvelle période ?")){
    localStorage.setItem(PERIOD_START_KEY,weekKey);
    renderStats();
  }
});
