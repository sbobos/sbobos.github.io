/**
 * iconStripDetail — builds a `{render, onAction}` pair for the
 * "pick an item from a list on the left, see its detail on the right" shape
 */
export function iconStripDetail({ items: getItems, onSuccess }) {
  let selectedKey = null;

  function render() {
    const items = getItems();
    if (!selectedKey || !items.find((i) => i.key === selectedKey)) {
      selectedKey = items[0]?.key ?? null;
    }
    const selected = items.find((i) => i.key === selectedKey);

    // Compute extra HTML if item supplies extra / renderExtra
    let extraHtml = "";
    if (selected) {
      if (typeof selected.renderExtra === "function") {
        extraHtml = selected.renderExtra();
      } else if (selected.extra) {
        extraHtml = selected.extra;
      }
    }

    return `
  <div class="detail-layout">
    <div class="icon-strip">
      ${items
        .map(
          (it) => `
        <div class="icon-item ${it.key === selectedKey ? 'selected' : ''} ${it.ready ? 'ready' : ''} ${it.equipped ? 'equipped' : ''}"
             data-action="select-item" data-key="${it.key}">
          <span class="icon inv-icon">${it.icon}</span>
        </div>
      `,
        )
        .join('')}
    </div>
    <div class="detail-sidebar" id="detail-sidebar">
          ${selected
        ? `
            <div class="detail-title">${selected.label}</div>
            <div class="detail-tag">${selected.tag}</div>
            <div class="detail-desc">${selected.desc ? selected.desc.replace(/\n/g, '<br>') : ''}</div>
            
            <!-- RENDER CUSTOM REQUIREMENTS / EXTRA DETAILS -->
            ${extraHtml ? `<div class="detail-extra">${extraHtml}</div>` : ""}

            <div class="detail-actions">
              <span>${selected.cost || ""}</span>

              ${selected.actionLabel
          ? `
                  <button
                    data-action="confirm-item"
                    data-key="${selected.key}"
                    ${selected.disabled ? "disabled" : ""}
                  >
                    ${selected.actionLabel}
                  </button>
                `
          : ""
        }
            </div>
          `
        : `<div class="detail-empty">Nothing selected.</div>`
      }
        </div>
      </div>
    `;
  }

  function onAction(bodyEl, action, key, event, overlay) {
    if (action === 'select-item') {
      selectedKey = key;
      bodyEl.innerHTML = render();
      return;
    }
    if (action === 'confirm-item') {
      const items = getItems();
      const item = items.find((i) => i.key === key);
      const ok = item?.onAction?.();
      if (ok) {
        onSuccess?.();
        overlay?.refresh(); // re-derives tabs fresh — picks up new gold/materials
        const pane = document.getElementById('detail-sidebar');
        if (pane) {
          pane.classList.remove('flash');
          void pane.offsetWidth; // restart the animation
          pane.classList.add('flash');
        }
      }
    }
  }

  return { render, onAction };
}