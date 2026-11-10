(() => {
  const boundOpeners = new WeakSet();
  const boundClosers = new WeakSet();

  function init() {
    document.querySelectorAll("[data-open-dialog]").forEach((button) => {
      if (boundOpeners.has(button)) return;
      boundOpeners.add(button);
      button.addEventListener("click", () => {
        document.getElementById(button.dataset.openDialog)?.showModal();
      });
    });

    document.querySelectorAll("[data-close-dialog]").forEach((button) => {
      if (boundClosers.has(button)) return;
      boundClosers.add(button);
      button.addEventListener("click", () => button.closest("dialog")?.close());
    });
  }

  window.PrototypeDialog = { init };
  init();
})();