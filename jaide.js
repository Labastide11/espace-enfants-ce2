// Espace Enfants CE2 — J'aide — V0.4
// Trombinoscope repris des portraits présents dans Progressions CE2.
// Une image neutre est utilisée automatiquement si un portrait ne se charge pas.

const ELEVES = [
  { prenom: 'Aaron', photo: "assets/eleves/aaron.jpg" },
  { prenom: 'Adam', photo: "assets/eleves/adam.jpg" },
  { prenom: 'Akshiga', photo: "assets/eleves/akshiga.jpg" },
  { prenom: 'Amine', photo: "assets/eleves/amine.jpg" },
  { prenom: 'Anissa', photo: "assets/eleves/anissa.jpg" },
  { prenom: 'Badr', photo: "assets/eleves/badr.jpg" },
  { prenom: 'Boy', photo: "assets/eleves/boy.jpg" },
  { prenom: 'Chris-Yoan', photo: "assets/eleves/chris-yoan.jpg" },
  { prenom: 'Eléa', photo: "assets/eleves/elea.jpg" },
  { prenom: 'Hiba', photo: "assets/eleves/hiba.jpg" },
  { prenom: 'Ibrahim', photo: "assets/eleves/ibrahim.jpg" },
  { prenom: 'Mélanie', photo: "assets/eleves/melanie.jpg" },
  { prenom: 'Neyla', photo: "assets/eleves/neyla.jpg" },
  { prenom: 'Nordine', photo: "assets/eleves/nordine.jpg" },
  { prenom: 'Rofrane', photo: "assets/eleves/rofrane.jpg" },
  { prenom: 'Sara', photo: "assets/eleves/sara.jpg" },
  { prenom: 'Stéfanie', photo: "assets/eleves/stefanie.jpg" },
  { prenom: 'Tiffany', photo: "assets/eleves/tiffany.jpg" },
  { prenom: 'Youssef', photo: "assets/eleves/youssef.jpg" },
  { prenom: 'Zoé', photo: "assets/eleves/zoe.jpg" }
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
