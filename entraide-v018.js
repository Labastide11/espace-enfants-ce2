// Espace Enfants CE2 — Page unique d'entraide — V0.18

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const STORAGE_KEY = "nino_entraide_status_v018";
const FALLBACK = "assets/portraits/portrait_neutre.png";

const workList = document.querySelector("#work-list");
const helpList = document.querySelector("#help-list");
const needList = document.querySelector("#need-list");

const popover = document.querySelector("#choice-popover");
const popoverStudent = document.querySelector("#choice-student");
const closeBtn = document.querySelector("#choice-close");

let selectedStudent = "";

function loadStatuses() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function saveStatuses(statuses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

function getState(prenom) {
  return loadStatuses()[prenom]?.state || "neutral";
}

function setState(prenom, state) {
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
  return encodeURI(`assets/eleves/${filename}`) + "?v=018";
}

function studentCard(eleve, state) {
  const badge =
    state === "helper"
      ? '<span class="state-badge badge-helper">✓ Je peux aider</span>'
      : state === "need"
        ? '<span class="state-badge badge-need">🙋 J’ai besoin d’aide</span>'
        : "";

  return `
    <button class="entraide-student" type="button" data-student="${esc(eleve.prenom)}">
      <span class="entraide-photo-wrap">
        <img class="entraide-photo"
             src="${photoUrl(eleve.fichier)}"
             alt="Portrait de ${esc(eleve.prenom)}"
             loading="lazy">
        ${badge}
      </span>
      <span class="entraide-name">${esc(eleve.prenom)}</span>
    </button>
  `;
}

function render() {
  const groups = {
    neutral: [],
    helper: [],
    need: []
  };

  ELEVES.forEach(eleve => {
    const state = getState(eleve.prenom);
    groups[state]?.push(eleve);
  });

  workList.innerHTML = groups.neutral.map(e => studentCard(e, "neutral")).join("");
  helpList.innerHTML = groups.helper.map(e => studentCard(e, "helper")).join("");
  needList.innerHTML = groups.need.map(e => studentCard(e, "need")).join("");

  document.querySelectorAll(".entraide-photo").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.src.includes("portrait_neutre.png")) img.src = FALLBACK;
    }, { once: true });
  });

  document.querySelectorAll("[data-student]").forEach(button => {
    button.addEventListener("click", () => {
      selectedStudent = button.dataset.student;
      popoverStudent.textContent = selectedStudent;
      popover.hidden = false;
    });
  });
}

document.querySelectorAll("[data-state]").forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedStudent) return;
    setState(selectedStudent, button.dataset.state);
    popover.hidden = true;
  });
});

closeBtn.addEventListener("click", () => {
  popover.hidden = true;
});

popover.addEventListener("click", event => {
  if (event.target === popover) popover.hidden = true;
});

// Synchronisation entre onglets/fenêtres du même navigateur.
window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY) render();
});

render();
