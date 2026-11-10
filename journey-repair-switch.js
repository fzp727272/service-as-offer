(() => {
  const versions = window.ServiceJourneyMap.repairVersions;

  document.querySelectorAll("[data-repair-switch]").forEach(switcher => {
    const link = switcher.querySelector("[data-version-link]");
    const description = switcher.querySelector("[data-version-description]");
    const buttons = [...switcher.querySelectorAll("[data-version]")];

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const version = versions[button.dataset.version];
        if (!version) return;

        buttons.forEach(option => {
          option.setAttribute("aria-pressed", String(option === button));
        });
        link.href = version.href;
        link.textContent = version.label;
        description.textContent = version.description;
      });
    });
  });
})();
