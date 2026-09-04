// Espace Enfants CE2 — Entraide simultanée — V0.13

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const FALLBACK = "assets/portraits/portrait_neutre.png";
const STORAGE_KEY = "nino_entraide_status_v013";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "give" ? "give" : "need";

const grid = document.querySelector("#student-grid");
const pageTitle = document.querySelector("#help-page-title");
const pageIntro = document.querySelector("#help-page-intro");
const panel = document.querySelector("#help-panel");
const panelTitle = document.querySelector("#panel-title");
const panelContent = document.querySelector("#panel-content");
const cancelPanel = document.querySelector("#cancel-panel");
const helpersPanel = document.querySelector("#helpers-panel");
const helpersGrid = document.querySelector("#helpers-grid");

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
  const item = loadStatuses()[prenom];
  return item?.state || "neutral";
}

function setStatus(prenom, state, extra = {}) {
  const statuses = loadStatuses();
  if (state === "neutral") {
    delete statuses[prenom];
  } else {
    statuses[prenom] = {
      state,
      updatedAt: Date.now(),
      ...extra
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
  return encodeURI(`assets/eleves/${filename}`) + "?v=013";
}

function statusBadge(state) {
  if (state === "helper") return '<span class="student-status status-helper">🟢 Disponible pour aider</span>';
  if (state === "need") return '<span class="student-status status-need">🟠 J’ai besoin d’aide</span>';
  return '<span class="student-status status-neutral">⚪ Je travaille</span>';
}

function visibleInMode(eleve) {
  const state = getStatus(eleve.prenom);
  if (mode === "give") return state !== "need";
  return state !== "helper";
}

function setupHeader() {
  if (mode === "give") {
    pageTitle.textContent = "Je peux aider";
    pageIntro.innerHTML =
      "<strong>Choisis ta photo.</strong><br>" +
      "Si tu as tout bon ou si tu as compris tes erreurs, tu peux te rendre disponible.";
  } else {
    pageTitle.textContent = "J’ai besoin d’aide";
    pageIntro.innerHTML =
      "<strong>Choisis ta photo.</strong><br>" +
      "Si tu es bloqué, Nino cherchera un camarade disponible.";
  }
}

function render() {
  setupHeader();
  panel.hidden = true;
  helpersPanel.hidden = true;

  const visible = ELEVES.filter(visibleInMode);

  grid.innerHTML = visible.map((eleve) => {
    const state = getStatus(eleve.prenom);
    return `
      <button class="student-card state-${state}" type="button"
              data-student="${esc(eleve.prenom)}"
              aria-label="Choisir ${esc(eleve.prenom)}">
        <span class="student-photo-wrap">
          <img class="student-photo"
               src="${photoUrl(eleve.fichier)}"
               alt="Portrait de ${esc(eleve.prenom)}"
               loading="lazy">
        </span>
        <span class="student-firstname">${esc(eleve.prenom)}</span>
        ${statusBadge(state)}
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".student-photo").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.src.includes("portrait_neutre.png")) img.src = FALLBACK;
    }, { once: true });
  });

  grid.querySelectorAll("[data-student]").forEach(button => {
    button.addEventListener("click", () => openStudent(button.dataset.student));
  });
}

function openStudent(prenom) {
  const state = getStatus(prenom);
  panel.hidden = false;
  helpersPanel.hidden = true;
  panelTitle.textContent = prenom;

  if (mode === "give") {
    if (state === "helper") {
      panelContent.innerHTML = `
        <div class="nino-message success">
          🟢 <strong>${esc(prenom)}, tu es disponible pour aider.</strong>
        </div>
        <button class="big-action neutral-btn" type="button" data-action="neutral">
          ✅ J’ai fini d’aider
        </button>
      `;
    } else {
      panelContent.innerHTML = `
        <p class="question"><strong>Pourquoi peux-tu aider ?</strong></p>
        <div class="reason-grid">
          <button class="big-action good-btn" type="button" data-reason="allgood">
            ✅ J’ai eu tout bon
          </button>
          <button class="big-action understood-btn" type="button" data-reason="errors">
            💡 J’ai compris mes erreurs
          </button>
        </div>
      `;
    }
  } else {
    if (state === "need") {
      panelContent.innerHTML = `
        <div class="nino-message need">
          🟠 <strong>${esc(prenom)}, Nino cherche quelqu’un pour t’aider.</strong>
        </div>
        <button class="big-action neutral-btn" type="button" data-action="neutral">
          ✅ Je n’ai plus besoin d’aide
        </button>
      `;
      showAvailableHelpers(prenom);
    } else {
      panelContent.innerHTML = `
        <p class="question"><strong>Tu es bloqué et tu as besoin d’aide ?</strong></p>
        <button class="big-action need-btn" type="button" data-action="need">
          🙋 Oui, j’ai besoin d’aide
        </button>
      `;
    }
  }

  panelContent.querySelectorAll("[data-reason]").forEach(btn => {
    btn.addEventListener("click", () => {
      setStatus(prenom, "helper", { reason: btn.dataset.reason });
      openStudent(prenom);
    });
  });

  panelContent.querySelectorAll("[data-action='need']").forEach(btn => {
    btn.addEventListener("click", () => {
      setStatus(prenom, "need");
      openStudent(prenom);
    });
  });

  panelContent.querySelectorAll("[data-action='neutral']").forEach(btn => {
    btn.addEventListener("click", () => {
      setStatus(prenom, "neutral");
    });
  });

  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showAvailableHelpers(requester) {
  const helperNames = ELEVES
    .filter(e => e.prenom !== requester && getStatus(e.prenom) === "helper");

  helpersPanel.hidden = false;

  if (!helperNames.length) {
    helpersGrid.innerHTML = `
      <div class="no-helper">
        🤖 Aucun camarade n’est disponible pour le moment.<br>
        <strong>Demande au maître.</strong>
      </div>
    `;
    return;
  }

  helpersGrid.innerHTML = helperNames.map(eleve => `
    <button class="helper-card" type="button" data-helper="${esc(eleve.prenom)}">
      <img src="${photoUrl(eleve.fichier)}" alt="Portrait de ${esc(eleve.prenom)}">
      <strong>${esc(eleve.prenom)}</strong>
      <span>🟢 Disponible</span>
    </button>
  `).join("");

  helpersGrid.querySelectorAll("[data-helper]").forEach(btn => {
    btn.addEventListener("click", () => {
      const helper = btn.dataset.helper;
      helpersGrid.innerHTML = `
        <div class="chosen-helper">
          🤝 <strong>Va voir ${esc(helper)}.</strong><br>
          Explique-lui ce qui te bloque.
        </div>
      `;
    });
  });
}

cancelPanel.addEventListener("click", () => {
  panel.hidden = true;
  helpersPanel.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Mise à jour immédiate si les deux pages sont ouvertes dans deux onglets/fenêtres.
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) render();
});

render();
