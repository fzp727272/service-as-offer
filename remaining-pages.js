(() => {
  document.querySelectorAll("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.openDialog)?.showModal();
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });

  document.querySelectorAll("[data-local-message]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.localMessage);
      if (target) target.hidden = false;
      button.setAttribute("aria-expanded", "true");
    });
  });

  const requestForm = document.querySelector("[data-repair-request]");
  const imageInput = document.querySelector("#repair-images");
  const imagePreview = document.querySelector("#repair-image-preview");
  const imageFeedback = document.querySelector("#repair-image-feedback");
  const maxRepairImages = 5;
  const repairImages = [];
  const renderRepairImages = () => {
    if (!imagePreview) return;
    const items = repairImages.map((image, index) => {
      const item = document.createElement("div");
      item.className = "repair-image-item";
      const preview = document.createElement("img");
      preview.src = image.url;
      preview.alt = image.file.name ? `问题图片：${image.file.name}` : `问题图片 ${index + 1}`;
      preview.title = image.file.name;
      const remove = document.createElement("button");
      remove.className = "repair-image-remove";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `移除图片：${image.file.name}`);
      remove.addEventListener("click", () => {
        URL.revokeObjectURL(image.url);
        repairImages.splice(index, 1);
        renderRepairImages();
        if (imageFeedback) {
          imageFeedback.textContent = "";
          imageFeedback.hidden = true;
        }
      });
      item.append(preview, remove);
      return item;
    });
    if (repairImages.length < maxRepairImages) {
      const add = document.createElement("label");
      add.className = "repair-image-add";
      add.htmlFor = "repair-images";
      add.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M7 12h5l2.5-4h11l2.5 4h5v20H7z"></path><circle cx="20" cy="21" r="6"></circle><circle class="camera-flash" cx="28" cy="16" r="1"></circle></svg><span>上传图片</span><small>最多 5 张</small>';
      items.push(add);
    }
    imagePreview.replaceChildren(...items);
  };
  renderRepairImages();
  imageInput?.addEventListener("change", () => {
    let rejectedType = false;
    let rejectedCount = false;
    for (const file of imageInput.files || []) {
      if (!file.type.startsWith("image/")) {
        rejectedType = true;
        continue;
      }
      if (repairImages.length >= maxRepairImages) {
        rejectedCount = true;
        continue;
      }
      repairImages.push({ file, url: URL.createObjectURL(file) });
    }
    imageInput.value = "";
    renderRepairImages();
    if (imageFeedback) {
      if (rejectedCount) {
        imageFeedback.textContent = "最多上传 5 张图片，请移除部分图片后再添加。";
        imageFeedback.hidden = false;
      } else if (rejectedType) {
        imageFeedback.textContent = "仅支持上传图片文件，请重新选择。";
        imageFeedback.hidden = false;
      } else {
        imageFeedback.textContent = "";
        imageFeedback.hidden = true;
      }
    }
  });
  window.addEventListener("pagehide", () => {
    repairImages.forEach(image => URL.revokeObjectURL(image.url));
  }, { once: true });
  requestForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requestForm.reportValidity()) return;
    const message = document.getElementById("request-feedback");
    if (message) message.hidden = false;
  });

  document.querySelectorAll("[data-cancel-appointment]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = document.getElementById("appointment-state");
      const action = document.getElementById("cancel-appointment-action");
      const feedback = document.getElementById("cancel-feedback");
      const dialog = document.getElementById("cancel-dialog");
      if (status) status.textContent = "已取消预约";
      if (action) action.hidden = true;
      if (feedback) feedback.hidden = false;
      dialog?.close();
      const url = new URL(location.href);
      url.searchParams.set("booking", "cancelled");
      url.searchParams.delete("demoState");
      location.replace(url);
    });
  });

  document.querySelectorAll("[data-cancel-order-review]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (dialog) dialog.close();
      const url = new URL(location.href);
      url.searchParams.set("demoState", "cancelled");
      url.searchParams.set("paymentState", "unpaid");
      url.searchParams.set("booking", "none");
      location.replace(url);
    });
  });

  document.querySelectorAll("[data-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-decision]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      const output = document.getElementById("decision-feedback");
      if (output) output.textContent = `已标记评审选项：${button.dataset.decision}。此操作不更改业务状态。`;
    });
  });
})();
