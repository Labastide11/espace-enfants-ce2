const advice = {
  unfinished: {
    title: "✅ Tu continues ton travail",
    actions: [
      "📖 Je relis la consigne une fois.",
      "👀 Je regarde ce qu’il me reste à faire.",
      "✏️ Je reprends calmement mon travail.",
      "✅ Quand j’ai fini, je peux revenir choisir une autre carte."
    ]
  },
  check: {
    title: "🔎 Tu vérifies avant de rendre",
    actions: [
      "📖 Je relis mes réponses.",
      "✏️ Je corrige si je vois une erreur.",
      "🧼 Je vérifie la présentation et l’écriture.",
      "✅ Je regarde si j’ai bien répondu à toute la consigne."
    ]
  },
  done: {
    title: "🎉 Bravo, tu as terminé !",
    actions: [
      "📚 Je peux lire tranquillement.",
      "✏️ Je peux dessiner ou écrire calmement.",
      "🧩 Je peux faire une activité autonome autorisée.",
      "😊 Je reste calme et silencieux."
    ]
  },
  stuck: {
    title: "🙋 Voici comment demander de l’aide",
    actions: [
      "📖 Je relis la consigne une fois.",
      "👀 Je regarde un exemple ou ce que j’ai déjà fait.",
      "🤝 Je demande d’abord à un camarade aidant.",
      "👨‍🏫 Si je suis encore bloqué, je demande au maître."
    ]
  }
};

const answer = document.querySelector('#nino-answer');
const title = document.querySelector('#answer-title');
const list = document.querySelector('#action-list');
const choices = document.querySelector('.choice-grid');

function openAnswer(choiceKey) {
  const item = advice[choiceKey];
  title.textContent = item.title;
  list.innerHTML = item.actions
    .map((action, index) => `<div class="action-item"><span class="action-number">${index + 1}</span><span class="action-text">${action}</span></div>`)
    .join('');
  answer.hidden = false;
  choices.style.display = 'none';
  answer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-choice]').forEach((button) => {
  button.addEventListener('click', () => openAnswer(button.dataset.choice));
});

document.querySelector('#restart').addEventListener('click', () => {
  answer.hidden = true;
  choices.style.display = 'grid';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
