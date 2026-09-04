// Espace Enfants CE2 — Entraide — V0.12
// L'accueil distingue désormais directement :
//   ?mode=give -> Je peux aider
//   ?mode=need -> J'ai besoin d'aide

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const FALLBACK = "assets/portraits/portrait_neutre.png";

const params = new URLSearchParams(window.location.search);
const requestedMode = ["give", "need"].includes(params.get("mode"))
  ? params.get("mode")
  : "";

const grid = document.querySelector("#student-grid");
const choice = document.querySelector("#help-choice");
const choiceTitle = document.querySelector("#help-choice-title");
const choiceActions = document.querySelector("#help-choice-actions");
const note = document.querySelector("#help-note");
const pageTitle = document.querySelector("#help-page-title");
const pageIntro = document.querySelector("#help-page-intro");

let selectedStudent = "";

if (requestedMode === "give") {
  pageTitle.textContent = "Je peux aider";
  pageIntro.innerHTML = "<strong>Choisis ton prénom.</strong><br>Puis Nino te demandera pour quoi tu peux aider.";
} else if (requestedMode === "need") {
  pageTitle.textContent = "J’ai besoin d’aide";
  pageIntro.innerHTML = "<strong>Choisis ton prénom.</strong><br>Puis Nino t’aidera à trouver un camarade.";
} else {
  pageTitle.textContent = "Entraide";
  pageIntro.innerHTML = "<strong>Commence par choisir ton prénom.</strong>";
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function photoUrl(filename) {
  return encodeURI(`assets/eleves/${filename}`) + "?v=012";
}

grid.innerHTML = ELEVES.map((eleve, index) => `
  <button class="student-card" type="button" data-student-index="${index}" aria-label="Choisir ${esc(eleve.prenom)}">
    <span class="student-photo-wrap">
      <img class="student-photo"
           src="${photoUrl(eleve.fichier)}"
           alt="Portrait de ${esc(eleve.prenom)}"
           loading="lazy">
    </span>
    <span class="student-firstname">${esc(eleve.prenom)}</span>
  </button>
`).join("");

grid.querySelectorAll(".student-photo").forEach(img => {
  img.addEventListener("error", () => {
    if (!img.src.includes("portrait_neutre.png")) img.src = FALLBACK;
  }, { once: true });
});

function showMode(mode) {
  choice.hidden = false;

  if (mode === "give") {
    choiceTitle.textContent = `${selectedStudent}, tu peux aider !`;
    note.textContent = "🤝 Indique maintenant pour quoi tu peux aider.";
  } else {
    choiceTitle.textContent = `${selectedStudent}, tu as besoin d’aide.`;
    note.textContent = "🙋 Nino va t’aider à trouver un camarade.";
  }

  choice.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

grid.querySelectorAll("[data-student-index]").forEach(button => {
  button.addEventListener("click", () => {
    grid.querySelectorAll(".student-card").forEach(card => card.classList.remove("is-selected"));
    button.classList.add("is-selected");

    const eleve = ELEVES[Number(button.dataset.studentIndex)];
    selectedStudent = eleve.prenom;

    if (requestedMode) {
      choiceActions.hidden = true;
      showMode(requestedMode);
    } else {
      choiceActions.hidden = false;
      choiceTitle.textContent = `Bonjour ${selectedStudent} ! Que veux-tu faire ?`;
      note.textContent = "Choisis une des deux possibilités.";
      choice.hidden = false;
      choice.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
});

document.querySelectorAll("[data-help-mode]").forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedStudent) return;
    showMode(button.dataset.helpMode);
  });
});
