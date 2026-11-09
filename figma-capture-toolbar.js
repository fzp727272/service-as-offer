/* Persistent, user-initiated launcher for Figma's capture-to-clipboard API. */
(() => {
  if (location.hash.startsWith('#figmacapture')) return;

  const bar = document.createElement('div');
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', '复制到 Figma');
  bar.style.cssText = 'position:fixed;z-index:2147483646;top:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;max-width:calc(100vw - 24px);background:#292929;color:white;border-radius:20px;box-shadow:0 6px 24px #0003;font:600 14px/1.2 system-ui,sans-serif;overflow:hidden';

  const addButton = (text, label, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.style.cssText = 'border:0;background:transparent;color:inherit;padding:15px 16px;font:inherit;white-space:nowrap;cursor:pointer';
    button.addEventListener('click', action);
    bar.appendChild(button);
    return button;
  };

  const status = document.createElement('span');
  status.textContent = '复制到剪贴板';
  status.setAttribute('aria-live', 'polite');
  status.style.cssText = 'padding:15px 16px;border-right:1px solid #ffffff24;white-space:nowrap';
  bar.appendChild(status);
  let selecting = false;

  async function capture(element) {
    if (!window.figma || typeof window.figma.captureForDesign !== 'function') {
      status.textContent = 'Figma 工具加载失败';
      return;
    }
    let selector = 'body';
    if (element && element !== document.body) {
      element.setAttribute('data-figma-capture-target', '');
      selector = '[data-figma-capture-target]';
    }
    bar.hidden = true;
    bar.style.display = 'none';
    try {
      const result = await window.figma.captureForDesign({ selector });
      if (result && result.success === false) status.textContent = '复制失败，请重试';
    } catch (error) {
      status.textContent = '复制失败，请重试';
      console.error('Figma capture failed:', error);
    } finally {
      if (element) element.removeAttribute('data-figma-capture-target');
      bar.hidden = false;
      bar.style.display = 'flex';
    }
  }

  function stopSelecting() {
    selecting = false;
    document.removeEventListener('click', selectElement, true);
    document.removeEventListener('keydown', onKey, true);
    status.textContent = '复制到剪贴板';
  }
  function selectElement(event) {
    if (bar.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const element = event.target;
    stopSelecting();
    capture(element);
  }
  function onKey(event) {
    if (event.key === 'Escape') stopSelecting();
  }

  addButton('整个屏幕', '复制整个屏幕到 Figma', () => { if (selecting) stopSelecting(); capture(document.body); });
  addButton('选择元素', '选择要复制到 Figma 的元素', () => {
    if (selecting) { stopSelecting(); return; }
    selecting = true;
    status.textContent = '点击页面元素（Esc 取消）';
    document.addEventListener('click', selectElement, true);
    document.addEventListener('keydown', onKey, true);
  });
  addButton('×', '关闭 Figma 复制工具栏', () => { stopSelecting(); bar.remove(); });
  document.body.appendChild(bar);
})();
