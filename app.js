document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.action === "help") {
      alert("🤝 J’aide arrive dans la prochaine étape.");
    }
  });
});
