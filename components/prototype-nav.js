(() => {
  const componentBase = document.currentScript?.src || document.baseURI;
  class PrototypeNav extends HTMLElement {
    static get observedAttributes() { return ["title", "back-href", "back-label", "sticky"]; }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const title = this.getAttribute("title") || "";
      const backHref = this.getAttribute("back-href") || "01-service-entry.html";
      const backLabel = this.getAttribute("back-label") || "返回上一页";
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${this.escapeAttribute(new URL('prototype-nav.css?v=20261109-rule-alignment', componentBase).href)}">
        <div class="statusbar" aria-hidden="true">
          <span>9:41</span>
          <img src="assets/figma/navbar-status-icons.svg" alt="">
        </div>
        <header class="nav" aria-label="小程序导航">
          <a class="back" href="${this.escapeAttribute(backHref)}" aria-label="${this.escapeAttribute(backLabel)}">
            <img src="assets/figma/navbar-back.svg" alt="">
          </a>
          <span class="nav-title">${this.escapeText(title)}</span>
          <span class="capsule" aria-hidden="true"><img src="assets/figma/navbar-wechat-capsule.svg" alt=""></span>
        </header>`;

      this.shadowRoot.querySelector(".back").addEventListener("click", event => {
        const navigationEvent = new CustomEvent("prototype-nav-back", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { href: backHref, originalEvent: event }
        });
        if (!this.dispatchEvent(navigationEvent)) event.preventDefault();
        if (event.defaultPrevented) return;

        if (this.getAttribute("back-mode") === "history" && history.length > 1) {
          try {
            if (document.referrer && new URL(document.referrer).origin === location.origin) {
              event.preventDefault();
              history.back();
            }
          } catch { /* Keep the fallback link for invalid or cross-origin referrers. */ }
        }
      });
    }

    escapeText(value) {
      return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }

    escapeAttribute(value) {
      return this.escapeText(value);
    }
  }

  if (!customElements.get("prototype-nav")) customElements.define("prototype-nav", PrototypeNav);
})();
