(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const navigationIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7 18-3-8-8-3L21 3Z"/></svg>';
  const contactIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 3v-11a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg>';

  // The host owns dialog handling and presentation; these variants preserve its existing hooks.
  const render = (store, {variant = 'detail'} = {}) => {
    const name = escape(store.name);
    const id = escape(store.id);
    const href = `https://map.qq.com/?q=${encodeURIComponent(`${store.name} ${store.address}`)}`;
    if (variant === 'picker') {
      return `<div class="stp-store-actions"><a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="导航到${name}">${navigationIcon}</a><button type="button" data-stp-contact="${id}" aria-label="联系${name}">${contactIcon}</button></div>`;
    }
    if (variant !== 'detail') throw new TypeError(`Unknown store action variant: ${variant}`);
    const detailNavigationIcon = navigationIcon.replace('aria-hidden="true"', 'aria-hidden="true" focusable="false"');
    const detailContactIcon = contactIcon.replace('aria-hidden="true"', 'aria-hidden="true" focusable="false"');
    return `<div class="store-icon-actions" role="group" aria-label="${name}门店操作"><a class="store-icon-button is-navigation" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="导航到${name}" title="导航到门店">${detailNavigationIcon}</a><button type="button" class="store-contact-button store-icon-button is-message" data-store-wechat="${id}" data-store-name="${name}" data-store-phone="${escape(store.phone || '')}" aria-label="联系${name}" title="联系门店" aria-haspopup="dialog">${detailContactIcon}</button></div>`;
  };

  window.StoreActions = Object.freeze({render});
})();