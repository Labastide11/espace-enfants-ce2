document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "help") {
      alert("🤝 J’aide arrive bientôt.");
    }
    if (action === "jobs") {
      alert("🧹 Mon métier arrive bientôt.");
    }
  });
});
