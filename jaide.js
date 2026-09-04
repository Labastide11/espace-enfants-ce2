// Espace Enfants CE2 — J'aide — V0.9
// Le trombinoscope utilise uniquement le manifeste généré depuis assets/eleves/.

const ELEVES = Array.isArray(window.NINO_ELEVES) ? window.NINO_ELEVES : [];
const FALLBACK = "assets/portraits/portrait_neutre.png";

const grid = document.querySelector("#student-grid");
const choice = document.querySelector("#help-choice");
const choiceTitle = document.querySelector("#help-choice-title");
const note = document.querySelector("#help-note");
let selectedStudent = "";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function photoUrl(filename) {
  // encodeURI keeps the exact filename logic while safely encoding spaces for the browser.
  return encodeURI(`assets/eleves/${filename}`) + "?v=09";
}

if (!ELEVES.length) {
  grid.innerHTML = '<p class="help-note">Aucun portrait trouvé.</p>';
} else {
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
}

grid.querySelectorAll(".student-photo").forEach(img => {
  img.addEventListener("error", () => {
    console.warn("Portrait introuvable :", img.getAttribute("src"));
    if (!img.src.includes("portrait_neutre.png")) img.src = FALLBACK;
  }, { once:true });
});

grid.querySelectorAll("[data-student-index]").forEach(button => {
  button.addEventListener("click", () => {
    grid.querySelectorAll(".student-card").forEach(card => card.classList.remove("is-selected"));
    button.classList.add("is-selected");
    const eleve = ELEVES[Number(button.dataset.studentIndex)];
    selectedStudent = eleve.prenom;
    choiceTitle.textContent = `Bonjour ${selectedStudent} ! Que veux-tu faire ?`;
    note.textContent = "Choisis une des deux possibilités.";
    choice.hidden = false;
    choice.scrollIntoView({ behavior:"smooth", block:"nearest" });
  });
});

document.querySelectorAll("[data-help-mode]").forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedStudent) return;
    note.textContent = button.dataset.helpMode === "give"
      ? `🤝 ${selectedStudent}, tu vas pouvoir indiquer ce pour quoi tu peux aider.`
      : `🙋 ${selectedStudent}, Nino va t’aider à trouver un camarade.`;
  });
});
