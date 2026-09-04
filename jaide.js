// Espace Enfants CE2 — J'aide — V0.5
// Trombinoscope mis à jour avec les photos 2026-2027 fournies par l'enseignant.

const ELEVES = [
  { prenom: 'Anis', photo: "assets/eleves/anis.jpg" },
  { prenom: 'Assya', photo: "assets/eleves/assya.jpg" },
  { prenom: 'Bilal', photo: "assets/eleves/bilal.jpg" },
  { prenom: 'Espoir', photo: "assets/eleves/espoir.jpg" },
  { prenom: 'Fahd', photo: "assets/eleves/fahd.jpg" },
  { prenom: 'Hamza', photo: "assets/eleves/hamza.jpg" },
  { prenom: 'Jinene', photo: "assets/eleves/jinene.jpg" },
  { prenom: 'Khadidja', photo: "assets/eleves/khadidja.jpg" },
  { prenom: 'Mohamed  S', photo: "assets/eleves/mohamed-s.jpg" },
  { prenom: 'Mohamed Z', photo: "assets/eleves/mohamed-z.jpg" },
  { prenom: 'Rayan', photo: "assets/eleves/rayan.jpg" },
  { prenom: 'Sayf', photo: "assets/eleves/sayf.jpg" },
  { prenom: 'Yaman', photo: "assets/eleves/yaman.jpg" },
  { prenom: 'Yazdan', photo: "assets/eleves/yazdan.jpg" },
  { prenom: 'Younis', photo: "assets/eleves/younis.jpg" }
];

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

grid.innerHTML = ELEVES.map((eleve, index) => `
  <button class="student-card" type="button" data-student-index="${index}" aria-label="Choisir ${esc(eleve.prenom)}">
    <span class="student-photo-wrap">
      <img class="student-photo" src="${eleve.photo}" alt="Portrait de ${esc(eleve.prenom)}" loading="lazy">
    </span>
    <span class="student-firstname">${esc(eleve.prenom)}</span>
  </button>
`).join("");

grid.querySelectorAll(".student-photo").forEach(img => {
  img.addEventListener("error", () => {
    if (img.src.endsWith(FALLBACK)) return;
    img.src = FALLBACK;
  }, { once: true });
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
    choice.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

document.querySelectorAll("[data-help-mode]").forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedStudent) return;
    note.textContent = button.dataset.helpMode === "give"
      ? `🤝 ${selectedStudent}, bientôt tu pourras indiquer ce pour quoi tu peux aider.`
      : `🙋 ${selectedStudent}, bientôt Nino t’aidera à trouver un camarade.`;
  });
});
