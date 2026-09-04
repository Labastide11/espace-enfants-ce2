const jobs = [
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

const grid = document.querySelector("#jobs-grid");
const detail = document.querySelector("#job-detail");
const detailTitle = document.querySelector("#job-detail-title");
const detailText = document.querySelector("#job-detail-text");
const detailRule = document.querySelector("#job-detail-rule");

grid.innerHTML = jobs.map((job, index) => `
  <button class="job-card" data-job="${index}">
    <span class="job-icon">${job.icon}</span>
    <span class="job-name">${job.name}</span>
    <span class="job-short">${job.short}</span>
    <span class="job-pair">👥 Binôme de la semaine : à attribuer</span>
  </button>
`).join("");

document.querySelectorAll("[data-job]").forEach((button) => {
  button.addEventListener("click", () => {
    const job = jobs[Number(button.dataset.job)];
    detailTitle.textContent = `${job.icon} ${job.name}`;
    detailText.textContent = job.detail;
    detailRule.textContent = `⭐ À retenir : ${job.rule}`;
    detail.hidden = false;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});
