const advice = {
  unfinished: {
    title: "✅ Nino te conseille :",
    actions: [
      "📖 Relis la consigne une fois.",
      "👀 Regarde ce qu’il te reste à faire.",
      "✏️ Reprends calmement ton travail."
    ]
  },
  check: {
    title: "🔎 Avant de dire « fini » :",
    actions: [
      "📖 Relis tes réponses.",
      "✏️ Vérifie ton écriture et ta présentation.",
      "✅ Regarde si tu as répondu à toute la consigne."
    ]
  },
  done: {
    title: "📚 Bravo, tu as terminé !",
    actions: [
      "📖 Tu peux lire tranquillement.",
      "✏️ Tu peux écrire ou dessiner calmement.",
      "🧩 Tu peux choisir une activité autonome."
    ]
  },
  stuck: {
    title: "🤝 Nino t’aide à te débloquer :",
    actions: [
      "📖 Relis la consigne.",
      "👀 Regarde un exemple ou ce que tu as déjà fait.",
      "🤝 Demande de l’aide à un camarade.",
      "👨‍🏫 Si tu es toujours bloqué, demande au maître."
    ]
  }
};

const answer = document.querySelector("#nino-answer");
const title = document.querySelector("#answer-title");
const list = document.querySelector("#action-list");
const choices = document.querySelector(".choice-grid");

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const item = advice[button.dataset.choice];
    title.textContent = item.title;
    list.innerHTML = item.actions.map(action => `<div class="action-item">${action}</div>`).join("");
    answer.hidden = false;
    choices.style.display = "none";
    answer.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelector("#restart").addEventListener("click", () => {
  answer.hidden = true;
  choices.style.display = "grid";
  window.scrollTo({ top: 0, behavior: "smooth" });
});
