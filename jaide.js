// Espace Enfants CE2 — Entraide simplifiée — V0.17

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const FALLBACK = "assets/portraits/portrait_neutre.png";
const STORAGE_KEY = "nino_entraide_status_v017";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "give" ? "give" : "need";

const grid = document.querySelector("#student-grid");
const pageTitle = document.querySelector("#help-page-title");
const pageIntro = document.querySelector("#help-page-intro");
const panel = document.querySelector("#help-panel");
const helpersPanel = document.querySelector("#helpers-panel");

function loadStatuses() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function saveStatuses(statuses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

function getStatus(prenom) {
  return loadStatuses()[prenom]?.state || "neutral";
}

function setStatus(prenom, state) {
  const statuses = loadStatuses();

  if (state === "neutral") {
    delete statuses[prenom];
  } else {
    statuses[prenom] = {
      state,
      updatedAt: Date.now()
    };
  }

  saveStatuses(statuses);
  render();
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function photoUrl(filename) {
  return encodeURI(`assets/eleves/${filename}`) + "?v=017";
}

function visibleInMode(eleve) {
  const state = getStatus(eleve.prenom);

  // Un demandeur d'aide n'apparaît pas sur "Je peux aider".
  if (mode === "give") return state !== "need";

  // Un aidant n'apparaît pas sur "J'ai besoin d'aide".
  return state !== "helper";
}

function setupHeader() {
  if (mode === "give") {
    pageTitle.textContent = "Je peux aider";
    pageIntro.innerHTML =
      "<strong>Clique sur ta photo si tu peux aider.</strong><br>" +
      "Ta carte devient verte. Clique de nouveau pour annuler.";
  } else {
    pageTitle.textContent = "J’ai besoin d’aide";
    pageIntro.innerHTML =
      "<strong>Choisis ta photo.</strong><br>" +
      "Si tu es bloqué, clique sur ta photo.";
  }
}

function render() {
  setupHeader();

  // Aucun écran intermédiaire dans les deux parcours.
  if (panel) panel.hidden = true;
  if (helpersPanel) helpersPanel.hidden = true;

  const visible = ELEVES.filter(visibleInMode);

  grid.innerHTML = visible.map((eleve) => {
    const state = getStatus(eleve.prenom);

    const stateClass =
      state === "helper" ? " is-helper" :
      state === "need" ? " is-need" : "";

    const badge =
      state === "helper"
        ? '<span class="helper-photo-badge">✓ Je peux aider</span>'
        : state === "need"
          ? '<span class="need-photo-badge">🙋 J’ai besoin d’aide</span>'
          : "";

    return `
      <button class="student-card${stateClass}" type="button"
              data-student="${esc(eleve.prenom)}"
              aria-label="Choisir ${esc(eleve.prenom)}">
        <span class="student-photo-wrap">
          <img class="student-photo"
               src="${photoUrl(eleve.fichier)}"
               alt="Portrait de ${esc(eleve.prenom)}"
               loading="lazy">
          ${badge}
        </span>
        <span class="student-firstname">${esc(eleve.prenom)}</span>
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".student-photo").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.src.includes("portrait_neutre.png")) img.src = FALLBACK;
    }, { once: true });
  });

  grid.querySelectorAll("[data-student]").forEach(button => {
    button.addEventListener("click", () => {
      const prenom = button.dataset.student;
      const current = getStatus(prenom);

      if (mode === "give") {
        setStatus(prenom, current === "helper" ? "neutral" : "helper");
        return;
      }

      setStatus(prenom, current === "need" ? "neutral" : "need");
    });
  });
}

// Si deux pages sont ouvertes en même temps dans le même navigateur,
// elles se mettent à jour automatiquement.
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) render();
});

render();
