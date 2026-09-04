// Espace Enfants CE2 — Mon métier — V0.26
// 12 métiers toujours attribués : 9 solos + 3 binômes.
// Anis et Rayan ne restent pas seuls sur un métier important du matin.
// Un clic sur une carte déplie directement les consignes du métier.

const MANIFEST_ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];

const STUDENTS = [
  "Anis","Assya","Bilal","Espoir","Fahd","Hamza","Jinene","Khadidja",
  "Mohamed S","Mohamed Z","Rayan","Sayf","Yaman","Yazdan","Younis"
];

const JOBS = [
  {
    icon:"📦", name:"Distributeur",
    short:"Je distribue et je ramasse.",
    detail:"Je distribue et je ramasse les cahiers, fiches, fichiers ou le petit matériel demandé.",
    rule:"Je fais vite, calmement et sans jouer avec le matériel."
  },
  {
    icon:"🚶", name:"Chef de rang",
    short:"Je conduis le rang.",
    detail:"Je me place devant et j’aide le groupe à se déplacer calmement et en sécurité.",
    rule:"Je marche, j’attends le groupe et je respecte les consignes de déplacement."
  },
  {
    icon:"📚", name:"Bibliothécaire",
    short:"Je prends soin des livres.",
    detail:"Je range les livres de la bibliothèque de classe et je vérifie qu’ils sont bien remis à leur place.",
    rule:"Je manipule les livres avec soin."
  },
  {
    icon:"✉️", name:"Facteur",
    short:"Je porte les messages.",
    detail:"Je porte un document ou un message dans une autre classe ou auprès d’un adulte de l’école.",
    rule:"Je vais directement à l’endroit demandé puis je reviens en classe."
  },
  {
    icon:"🎤", name:"Animateur du Quoi de neuf",
    short:"Je distribue la parole.",
    detail:"J’aide à organiser le Quoi de neuf : j’annonce l’ordre de passage et je distribue la parole.",
    rule:"Je veille à ce que chacun puisse parler et être écouté."
  },
  {
    icon:"🧹", name:"Agent d’entretien",
    short:"J’aide à garder la classe propre.",
    detail:"J’efface le tableau et j’aide à remettre la classe propre et rangée quand c’est nécessaire.",
    rule:"Je ne touche qu’au matériel prévu pour cette mission."
  },
  {
    icon:"🧰", name:"Responsable du matériel",
    short:"Je prépare et je range le matériel.",
    detail:"Je prépare, distribue ou range le matériel quand c’est nécessaire.",
    rule:"Je prends soin du matériel et je le remets à sa place après utilisation."
  },
  {
    icon:"🔄", name:"Remplaçant",
    short:"Je remplace un camarade absent.",
    detail:"Si un élève responsable est absent, je prends temporairement sa mission.",
    rule:"Je regarde quelle mission a besoin d’un remplaçant avant d’agir."
  },
  {
    icon:"📝", name:"Écrivain",
    short:"J’écris la date.",
    detail:"Le matin, j’écris la date au tableau proprement et lisiblement.",
    rule:"Je vérifie la date avant de l’écrire."
  },
  {
    icon:"🔐", name:"Gardien",
    short:"Je m’occupe des portes.",
    detail:"Avec l’accord du maître, je ferme à clé les portes qui doivent l’être.",
    rule:"Je ne ferme une porte que lorsque le maître me le demande."
  },
  {
    icon:"🦜", name:"Perroquet",
    short:"Je reformule la consigne.",
    detail:"J’écoute attentivement une consigne importante puis je la répète clairement avec mes propres mots.",
    rule:"Je n’ajoute pas une nouvelle consigne : j’aide seulement à mieux comprendre celle du maître."
  },
  {
    icon:"🤫", name:"Gardien du calme",
    short:"J’aide la classe à rester calme.",
    detail:"Je donne l’exemple et je peux rappeler gentiment qu’un moment calme est nécessaire.",
    rule:"Je ne commande pas les autres : je rappelle calmement la règle."
  }
];

const FLEX_STUDENTS = new Set(["Anis", "Rayan"]);
const MORNING_CRITICAL_JOBS = new Set([
  "Distributeur",
  "Chef de rang",
  "Animateur du Quoi de neuf",
  "Écrivain",
  "Gardien"
]);

// Nouveau stockage : force une nouvelle répartition compatible V0.26.
const HISTORY_KEY = "nino_metiers_history_v3";
const PERIOD_START_KEY = "nino_metiers_period_start_v1";
const CURRENT_PREFIX = "nino_metiers_week_v3_";
const FALLBACK_PHOTO = "assets/portraits/portrait_neutre.png";
const PHOTO_VERSION = "026";

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
  return new Intl.DateTimeFormat("fr-FR", {
    day:"numeric", month:"long", year:"numeric"
  }).format(date);
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


function getPeriodStartKey(currentWeekKey, history) {
  let saved = localStorage.getItem(PERIOD_START_KEY);

  if (saved && saved <= currentWeekKey) return saved;

  const knownWeeks = Object.keys(history).filter(k => k <= currentWeekKey).sort();
  const firstKnown = knownWeeks[0] || currentWeekKey;
  localStorage.setItem(PERIOD_START_KEY, firstKnown);
  return firstKnown;
}

function periodRecords(history, startKey, currentWeekKey) {
  return Object.entries(history)
    .filter(([week]) => week >= startKey && week <= currentWeekKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, record]) => record)
    .filter(record => record && Array.isArray(record.assignments));
}

function buildPeriodCounts(records) {
  const counts = Object.fromEntries(
    STUDENTS.map(student => [
      student,
      Object.fromEntries(JOBS.map(job => [job.name, 0]))
    ])
  );

  records.forEach(record => {
    record.assignments.forEach(assignment => {
      assignment.students.forEach(student => {
        if (counts[student] && assignment.job in counts[student]) {
          counts[student][assignment.job] += 1;
        }
      });
    });
  });

  return counts;
}

function countWeeksInPeriod(records) {
  return records.length;
}

function makeCandidate() {
  const jobs = shuffled(JOBS);
  const pupils = shuffled(STUDENTS);

  // Les 12 métiers reçoivent d'abord un élève.
  const assignments = jobs.map((job, index) => ({
    job: job.name,
    students: [pupils[index]]
  }));

  // Trois métiers deviennent des binômes pour accueillir les 3 élèves restants.
  const pairIndexes = shuffled([...Array(JOBS.length).keys()]).slice(0, 3);
  for (let i=0; i<3; i++) {
    assignments[pairIndexes[i]].students.push(pupils[12+i]);
  }

  return { assignments };
}

function scoreCandidate(candidate, previous) {
  let score = 0;

  // Contrainte forte : Anis et Rayan ne sont pas seuls
  // sur un métier important du matin.
  candidate.assignments.forEach(a => {
    if (
      a.students.length === 1 &&
      FLEX_STUDENTS.has(a.students[0]) &&
      MORNING_CRITICAL_JOBS.has(a.job)
    ) {
      score += 10000;
    }
  });

  if (!previous) return score;

  const prevJobByStudent = {};
  const prevPairs = new Set();
  const prevPairJobs = new Set();

  previous.assignments.forEach(a => {
    a.students.forEach(s => { prevJobByStudent[s] = a.job; });
    if (a.students.length === 2) {
      prevPairs.add(normalizePair(a.students[0], a.students[1]));
      prevPairJobs.add(a.job);
    }
  });

  candidate.assignments.forEach(a => {
    a.students.forEach(s => {
      // Éviter le même métier deux semaines de suite.
      if (prevJobByStudent[s] === a.job) score += 20;
    });

    if (a.students.length === 2) {
      // Faire tourner les métiers en binôme.
      if (prevPairJobs.has(a.job)) score += 8;

      // Éviter de reformer le même binôme.
      if (prevPairs.has(normalizePair(a.students[0], a.students[1]))) {
        score += 10;
      }
    }
  });

  return score;
}

function createWeeklyDraw(weekKey, history) {
  const previous = previousRecord(history, weekKey);
  const periodStart = getPeriodStartKey(weekKey, history);
  const records = periodRecords(history, periodStart, weekKey);
  const periodCounts = buildPeriodCounts(records);

  let best = null;
  let bestScore = Infinity;

  for (let i=0; i<4000; i++) {
    const candidate = makeCandidate();
    let score = scoreCandidate(candidate, previous);

    // Équilibrage sur toute la période :
    // plus un élève a déjà eu un métier, plus ce métier est pénalisé.
    candidate.assignments.forEach(assignment => {
      assignment.students.forEach(student => {
        score += (periodCounts[student]?.[assignment.job] || 0) * 14;
      });
    });

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

  // Une répartition V0.26 valide doit toujours contenir les 12 métiers.
  const valid = draw &&
    Array.isArray(draw.assignments) &&
    draw.assignments.length === JOBS.length &&
    draw.assignments.every(a => Array.isArray(a.students) && a.students.length >= 1);

  if (!valid) {
    draw = createWeeklyDraw(key, history);
    localStorage.setItem(storageKey, JSON.stringify(draw));
    history[key] = draw;

    const keys = Object.keys(history).sort();
    while (keys.length > 45) delete history[keys.shift()];

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  // Toujours conserver la semaine courante dans l'historique,
  // même si le tirage existait déjà.
  if (!history[key]) {
    history[key] = draw;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  return { draw, monday, history, weekKey: key };
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
        <img class="assignment-student-photo"
             src="${studentPhotoUrl(prenom)}"
             alt="Portrait de ${esc(prenom)}"
             loading="lazy">
      </span>
      <span class="assignment-student-name">${esc(prenom)}</span>
    </div>
  `;
}

const { draw, monday, history, weekKey } = loadWeeklyDraw();

document.querySelector("#week-note").textContent =
  `🔄 Semaine du lundi ${formatDate(monday)}`;

document.querySelector("#draw-status").textContent =
  "Les 12 métiers sont attribués : 9 élèves seuls et 3 binômes. Un nouveau tirage sera créé lundi prochain.";

const jobByName = Object.fromEntries(JOBS.map(job => [job.name, job]));
const current = document.querySelector("#current-jobs");

current.innerHTML = draw.assignments.map((a, index) => {
  const job = jobByName[a.job];
  const replacement = a.job === "Remplaçant" ? " assignment-card--replacement" : "";

  return `
    <article class="assignment-card${replacement}" data-assignment="${index}">
      <button class="assignment-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="assignment-detail-${index}">
        <div class="assignment-job">
          <span class="assignment-icon">${job.icon}</span>
          <span class="assignment-title">${job.name}</span>
          <span class="assignment-chevron">⌄</span>
        </div>

        <div class="assignment-students assignment-students--${a.students.length === 1 ? "single" : "pair"}">
          ${a.students.map(renderStudent).join("")}
        </div>
      </button>

      <div class="assignment-detail"
           id="assignment-detail-${index}"
           hidden>
        <p><strong>Ce que je dois faire :</strong> ${esc(job.detail)}</p>
        <p class="assignment-rule"><strong>⭐ À retenir :</strong> ${esc(job.rule)}</p>
      </div>
    </article>
  `;
}).join("");

current.querySelectorAll(".assignment-student-photo").forEach(img => {
  img.addEventListener("error", () => {
    if (!img.src.includes("portrait_neutre.png")) img.src = FALLBACK_PHOTO;
  }, { once: true });
});

current.querySelectorAll(".assignment-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".assignment-card");
    const detail = card.querySelector(".assignment-detail");
    const isOpen = !detail.hidden;

    detail.hidden = isOpen;
    card.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});

const assignedByJob = Object.fromEntries(
  draw.assignments.map(a => [a.job, a.students])
);

const grid = document.querySelector("#jobs-grid");
grid.innerHTML = JOBS.map((job, index) => {
  const assigned = assignedByJob[job.name] || [];

  return `
    <button class="job-card" data-job="${index}" type="button">
      <span class="job-icon">${job.icon}</span>
      <span class="job-name">${job.name}</span>
      <span class="job-short">${job.short}</span>
      <span class="job-pair">👥 ${assigned.join(" + ")}</span>
    </button>
  `;
}).join("");

document.querySelectorAll("[data-job]").forEach(button => {
  button.addEventListener("click", () => {
    const job = JOBS[Number(button.dataset.job)];
    const existing = button.querySelector(".job-inline-detail");

    document.querySelectorAll(".job-inline-detail").forEach(detail => {
      if (detail !== existing) detail.remove();
    });

    if (existing) {
      existing.remove();
      return;
    }

    const detail = document.createElement("span");
    detail.className = "job-inline-detail";
    detail.innerHTML = `
      <strong>Ce que je dois faire :</strong> ${esc(job.detail)}
      <br><strong>⭐ À retenir :</strong> ${esc(job.rule)}
    `;
    button.appendChild(detail);
  });
});

const panel = document.querySelector("#all-jobs-panel");
const showButton = document.querySelector("#show-all-jobs");

showButton.addEventListener("click", () => {
  panel.hidden = !panel.hidden;
  showButton.textContent = panel.hidden
    ? "📋 Voir les 12 métiers"
    : "✕ Masquer les métiers";

  if (!panel.hidden) {
    panel.scrollIntoView({ behavior:"smooth", block:"start" });
  }
});


// -----------------------------------------------------------------------------
// Répartition de la période
// -----------------------------------------------------------------------------

const periodStatsPanel = document.querySelector("#period-stats-panel");
const periodStatsGrid = document.querySelector("#period-stats-grid");
const periodStatsSummary = document.querySelector("#period-stats-summary");
const showPeriodStatsButton = document.querySelector("#show-period-stats");
const periodResetButton = document.querySelector("#period-reset-button");

function shortJobLabel(jobName) {
  const job = JOBS.find(j => j.name === jobName);
  return job ? `${job.icon} ${job.name}` : jobName;
}

function renderPeriodStats() {
  const latestHistory = (() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    } catch {
      return {};
    }
  })();

  const startKey = getPeriodStartKey(weekKey, latestHistory);
  const records = periodRecords(latestHistory, startKey, weekKey);
  const counts = buildPeriodCounts(records);

  periodStatsSummary.textContent =
    `${countWeeksInPeriod(records)} semaine(s) comptabilisée(s) depuis le ${startKey.split("-").reverse().join("/")}.`;

  periodStatsGrid.innerHTML = STUDENTS.map(student => {
    const studentCounts = counts[student] || {};
    const done = JOBS
      .map(job => ({ job, count: studentCounts[job.name] || 0 }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count || a.job.name.localeCompare(b.job.name, "fr"));

    const total = done.reduce((sum, item) => sum + item.count, 0);

    return `
      <article class="period-student-card">
        <div class="period-student-head">
          <strong>${esc(student)}</strong>
          <span>${total} métier${total > 1 ? "s" : ""}</span>
        </div>
        <div class="period-job-counts">
          ${
            done.length
              ? done.map(item => `
                  <span class="period-job-chip">
                    ${esc(shortJobLabel(item.job.name))}
                    <b>×${item.count}</b>
                  </span>
                `).join("")
              : '<span class="period-empty">Aucun métier comptabilisé</span>'
          }
        </div>
      </article>
    `;
  }).join("");
}

showPeriodStatsButton.addEventListener("click", () => {
  const willOpen = periodStatsPanel.hidden;
  periodStatsPanel.hidden = !willOpen;

  showPeriodStatsButton.textContent = willOpen
    ? "✕ Masquer la répartition"
    : "📊 Répartition de la période";

  if (willOpen) {
    renderPeriodStats();
    periodStatsPanel.scrollIntoView({ behavior:"smooth", block:"start" });
  }
});

periodResetButton.addEventListener("click", () => {
  const ok = window.confirm(
    "Commencer une nouvelle période ?\\n\\n" +
    "La répartition précédente restera dans l’historique, mais les compteurs de la période repartiront de cette semaine."
  );

  if (!ok) return;

  localStorage.setItem(PERIOD_START_KEY, weekKey);
  renderPeriodStats();
});
