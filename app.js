const message = document.querySelector("#message");

const labels = {
  help: "🤝 J’aide sera construit après les premières étapes.",
  choice: "🧭 « Je ne sais pas quoi faire » sera la première rubrique que nous construirons.",
  jobs: "🧹 « Mes responsabilités » viendra ensuite avec la rotation du lundi."
};

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    message.textContent = labels[button.dataset.action];
  });
});
