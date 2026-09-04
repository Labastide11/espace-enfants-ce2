// Espace Enfants CE2 — Entraide simplifiée — V0.14

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const FALLBACK = "assets/portraits/portrait_neutre.png";
const STORAGE_KEY = "nino_entraide_status_v014";

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
  return encodeURI(`assets/eleves/${filename}`) + "?v=014";
}

function visibleInMode(eleve) {
  const state = getStatus(eleve.prenom);

  if (mode === "give") {
    return state !== "need";
  }

  return state !== "helper";
}

function setupHeader() {
  if (mode === "give") {
    pageTitle.textContent = "Je peux aider";
    pageIntro.innerHTML =
      "<strong>Clique sur ta photo si tu peux aider.</strong><br>" +
      "Ta carte devient verte. Clique de nouveau quand tu ne peux plus aider.";
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
    const helperClass = state === "helper" ? " is-helper" : "";
    const helperBadge = state === "helper"
      ? '<span class="student-status status-helper">🟢 Disponible pour aider</span>'
      : "";

    return `
      <button class="student-card${helperClass}" type="button"
              data-student="${esc(eleve.prenom)}"
              aria-label="Choisir ${esc(eleve.prenom)}">
        <span class="student-photo-wrap">
          <img class="student-photo"
               src="${photoUrl(eleve.fichier)}"
               alt="Portrait de ${esc(eleve.prenom)}"
               loading="lazy">
        </span>
        <span class="student-firstname">${esc(eleve.prenom)}</span>
        ${helperBadge}
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

      // Parcours "Je peux aider" : clic direct = activation / désactivation.
      if (mode === "give") {
        const next = getStatus(prenom) === "helper" ? "neutral" : "helper";
        setStatus(prenom, next);
        return;
      }

      // Parcours "J'ai besoin d'aide" : fonctionnement conservé.
      openNeedPanel(prenom);
    });
  });
}

function openNeedPanel(prenom) {
  const state = getStatus(prenom);

  panel.hidden = false;
  helpersPanel.hidden = true;
  panelTitle.textContent = prenom;

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

  panelContent.querySelectorAll("[data-action='need']").forEach(btn => {
    btn.addEventListener("click", () => {
      setStatus(prenom, "need");
      openNeedPanel(prenom);
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
  const helpers = ELEVES.filter(
    e => e.prenom !== requester && getStatus(e.prenom) === "helper"
  );

  helpersPanel.hidden = false;

  if (!helpers.length) {
    helpersGrid.innerHTML = `
      <div class="no-helper">
        🤖 Aucun camarade n’est disponible pour le moment.<br>
        <strong>Demande au maître.</strong>
      </div>
    `;
    return;
  }

  helpersGrid.innerHTML = helpers.map(eleve => `
    <button class="helper-card" type="button" data-helper="${esc(eleve.prenom)}">
      <img src="${photoUrl(eleve.fichier)}" alt="Portrait de ${esc(eleve.prenom)}">
      <strong>${esc(eleve.prenom)}</strong>
      <span>🟢 Disponible</span>
    </button>
  `).join("");

  helpersGrid.querySelectorAll("[data-helper]").forEach(btn => {
    btn.addEventListener("click", () => {
      helpersGrid.innerHTML = `
        <div class="chosen-helper">
          🤝 <strong>Va voir ${esc(btn.dataset.helper)}.</strong><br>
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

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) render();
});

render();
