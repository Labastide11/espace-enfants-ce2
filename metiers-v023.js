// Espace Enfants CE2 — Mon métier — V0.22
// Tirage automatique hebdomadaire, binômes et mémorisation locale.
// Affichage des métiers avec photo + prénom directement dans chaque carte.

const MANIFEST_ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];

const STUDENTS = [
  "Anis","Assya","Bilal","Espoir","Fahd","Hamza","Jinene","Khadidja",
  "Mohamed S","Mohamed Z","Rayan","Sayf","Yaman","Yazdan","Younis"
];

const JOBS = [
  { icon:"📦", name:"Distributeur", short:"Je distribue et je ramasse.", detail:"Je distribue et je ramasse les cahiers, fiches, fichiers ou le petit matériel demandé.", rule:"Je fais vite, calmement et sans jouer avec le matériel." },
  { icon:"🚶", name:"Chef de rang", short:"Je conduis le rang.", detail:"Je suis placé devant et j’aide le groupe à se déplacer calmement et en sécurité.", rule:"Je marche, j’attends le groupe et je respecte les consignes de déplacement." },
  { icon:"📚", name:"Bibliothécaire", short:"Je prends soin des livres.", detail:"Je range les livres de la bibliothèque de classe et je vérifie qu’ils sont bien remis à leur place.", rule:"Je manipule les livres avec soin." },
  { icon:"✉️", name:"Facteur", short:"Je porte les messages.", detail:"Je porte un document ou un message dans une autre classe ou auprès d’un adulte de l’école.", rule:"Je vais directement à l’endroit demandé puis je reviens en classe." },
  { icon:"🎤", name:"Animateur du Quoi de neuf", short:"Je distribue la parole.", detail:"J’aide à organiser le Quoi de neuf : j’annonce l’ordre de passage et je distribue la parole.", rule:"Je veille à ce que chacun puisse parler et être écouté." },
  { icon:"🧹", name:"Agent d’entretien", short:"J’aide à garder la classe propre.", detail:"J’efface le tableau et j’aide à remettre la classe propre et rangée quand c’est nécessaire.", rule:"Je ne touche qu’au matériel prévu pour cette mission." },
  { icon:"🏀", name:"Transporteur", short:"Je porte le matériel.", detail:"Je transporte le matériel nécessaire pour le sport, la chorale ou une activité particulière.", rule:"Je porte le matériel correctement et je le rapporte à sa place." },
  { icon:"🔄", name:"Remplaçant", short:"Je remplace un camarade absent.", detail:"Si un élève responsable est absent, je prends temporairement sa mission.", rule:"Je regarde quelle mission a besoin d’un remplaçant avant d’agir." },
  { icon:"📝", name:"Écrivain", short:"J’écris la date.", detail:"Le matin, j’écris la date au tableau proprement et lisiblement.", rule:"Je vérifie la date avant de l’écrire." },
  { icon:"💡", name:"Électricien", short:"Je pense aux lumières.", detail:"J’allume les lumières si besoin et je vérifie qu’elles sont éteintes quand la classe sort.", rule:"Je n’actionne les interrupteurs que lorsque c’est utile." },
  { icon:"🦜", name:"Perroquet", short:"Je reformule la consigne.", detail:"J’écoute attentivement une consigne importante puis je la répète clairement avec mes propres mots.", rule:"Je n’ajoute pas une nouvelle consigne : j’aide seulement à mieux comprendre celle du maître." },
  { icon:"🤫", name:"Gardien du calme", short:"J’aide la classe à rester calme.", detail:"Je donne l’exemple et je peux rappeler gentiment qu’un moment calme est nécessaire.", rule:"Je ne commande pas les autres : je rappelle calmement la règle." }
];

const HISTORY_KEY = "nino_metiers_history_v1";
const CURRENT_PREFIX = "nino_metiers_week_";
const FALLBACK_PHOTO = "assets/portraits/portrait_neutre.png";
const PHOTO_VERSION = "022";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function mondayOf(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(12,0,0,0);
  return d;
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", { day:"numeric", month:"long", year:"numeric" }).format(date);
}

function shuffled(arr) {
  const a = [...arr];
  for (let i=a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function normalizePair(a,b) {
  return [a,b].sort((x,y)=>x.localeCompare(y,"fr")).join("|");
}

function previousRecord(history, currentKey) {
  const keys = Object.keys(history).filter(k => k < currentKey).sort();
  return keys.length ? history[keys[keys.length-1]] : null;
}

function scoreCandidate(candidate, previous) {
  if (!previous) return 0;
  let score = 0;
  const prevJobByStudent = {};
  const prevPairs = new Set();

  previous.assignments.forEach(a => {
    a.students.forEach(s => { prevJobByStudent[s] = a.job; });
    if (a.students.length === 2) prevPairs.add(normalizePair(a.students[0], a.students[1]));
  });

  candidate.assignments.forEach(a => {
    a.students.forEach(s => {
      if (prevJobByStudent[s] === a.job) score += 12;
    });
    if (a.students.length === 2 && prevPairs.has(normalizePair(a.students[0], a.students[1]))) {
      score += 7;
    }
  });

  return score;
}

function makeCandidate() {
  const replacement = JOBS.find(j => j.name === "Remplaçant");
  const normalJobs = JOBS.filter(j => j.name !== "Remplaçant");
  const chosenJobs = shuffled(normalJobs).slice(0,7);
  const pupils = shuffled(STUDENTS);

  const assignments = [];
  for (let i=0; i<7; i++) {
    assignments.push({
      job: chosenJobs[i].name,
      students: [pupils[i*2], pupils[i*2+1]]
    });
  }

  assignments.push({
    job: replacement.name,
    students: [pupils[14]]
  });

  return { assignments };
}

function createWeeklyDraw(weekKey, history) {
  const previous = previousRecord(history, weekKey);
  let best = null;
  let bestScore = Infinity;

  for (let i=0; i<500; i++) {
    const candidate = makeCandidate();
    const score = scoreCandidate(candidate, previous);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
      if (score === 0) break;
    }
  }

  return {
    week: weekKey,
    createdAt: new Date().toISOString(),
    assignments: best.assignments
  };
}

function loadWeeklyDraw() {
  const monday = mondayOf();
  const key = dateKey(monday);
  const storageKey = CURRENT_PREFIX + key;
  let draw = null;

  try {
    draw = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch (_) {}

  let history = {};
  try {
    history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
  } catch (_) {}

  if (!draw || !Array.isArray(draw.assignments)) {
    draw = createWeeklyDraw(key, history);
    localStorage.setItem(storageKey, JSON.stringify(draw));
    history[key] = draw;

    const keys = Object.keys(history).sort();
    while (keys.length > 10) {
      delete history[keys.shift()];
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  return { draw, monday };
}

function guessFilename(prenom) {
  return `${prenom.replace(/\s+/g, "_")}.jpg`;
}

function studentManifestEntry(prenom) {
  return MANIFEST_ELEVES.find(e => e.prenom === prenom) || null;
}

function studentPhotoUrl(prenom) {
  const entry = studentManifestEntry(prenom);
  const filename = entry?.fichier || guessFilename(prenom);
  return encodeURI(`assets/eleves/${filename}`) + `?v=${PHOTO_VERSION}`;
}

function renderStudent(prenom) {
  return `
    <div class="assignment-student">
      <span class="assignment-student-photo-wrap">
        <img class="assignment-student-photo" src="${studentPhotoUrl(prenom)}" alt="Portrait de ${esc(prenom)}" loading="lazy" data-student="${esc(prenom)}">
      </span>
      <span class="assignment-student-name">${esc(prenom)}</span>
    </div>
  `;
}

const { draw, monday } = loadWeeklyDraw();

document.querySelector("#week-note").textContent =
  `🔄 Semaine du lundi ${formatDate(monday)}`;

document.querySelector("#draw-status").textContent =
  "Le tirage est mémorisé pour toute la semaine. Un nouveau tirage sera créé automatiquement lundi prochain.";

const jobByName = Object.fromEntries(JOBS.map(job => [job.name, job]));
const current = document.querySelector("#current-jobs");

current.innerHTML = draw.assignments.map(a => {
  const job = jobByName[a.job];
  const cls = a.job === "Remplaçant" ? "assignment-card assignment-card--replacement" : "assignment-card";
  return `
    <article class="${cls}">
      <div class="assignment-job">
        <span class="assignment-icon">${job.icon}</span>
        <span class="assignment-title">${job.name}</span>
      </div>
      <div class="assignment-students assignment-students--${a.students.length === 1 ? "single" : "pair"}">
        ${a.students.map(renderStudent).join("")}
      </div>
    </article>
  `;
}).join("");

current.querySelectorAll('.assignment-student-photo').forEach(img => {
  img.addEventListener('error', () => {
    if (!img.src.includes('portrait_neutre.png')) {
      img.src = FALLBACK_PHOTO;
    }
  }, { once: true });
});

const assignedByJob = Object.fromEntries(draw.assignments.map(a => [a.job,a.students]));
const grid = document.querySelector("#jobs-grid");
grid.innerHTML = JOBS.map((job, index) => {
  const assigned = assignedByJob[job.name];
  return `
    <button class="job-card ${assigned ? "" : "inactive-this-week"}" data-job="${index}">
      <span class="job-icon">${job.icon}</span>
      <span class="job-name">${job.name}</span>
      <span class="job-short">${job.short}</span>
      <span class="job-pair">${
        assigned
          ? `👥 ${assigned.join(" + ")}`
          : "⏸ Pas attribué cette semaine"
      }</span>
    </button>
  `;
}).join("");

const panel = document.querySelector("#all-jobs-panel");
const showButton = document.querySelector("#show-all-jobs");
showButton.addEventListener("click", () => {
  panel.hidden = !panel.hidden;
  showButton.textContent = panel.hidden ? "📋 Voir tous les métiers" : "✕ Masquer les métiers";
  if (!panel.hidden) panel.scrollIntoView({ behavior:"smooth", block:"start" });
});

const detail = document.querySelector("#job-detail");
const detailTitle = document.querySelector("#job-detail-title");
const detailText = document.querySelector("#job-detail-text");
const detailRule = document.querySelector("#job-detail-rule");

document.querySelectorAll("[data-job]").forEach(button => {
  button.addEventListener("click", () => {
    const job = JOBS[Number(button.dataset.job)];
    detailTitle.textContent = `${job.icon} ${job.name}`;
    detailText.textContent = job.detail;
    detailRule.textContent = `⭐ À retenir : ${job.rule}`;
    detail.hidden = false;
    detail.scrollIntoView({ behavior:"smooth", block:"nearest" });
  });
});
