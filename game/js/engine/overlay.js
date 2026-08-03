/**
 * Overlay — a generic panel shell: header (title + close) + tab bar + body.
 *
 * This is the ONLY part of the engine your room UIs talk to, and it has
 * zero knowledge of shop items, bounties, crafting, or quests. Each tab
 * you give it supplies its own `render()` (returns an HTML string for the
 * body) and its own `onAction()` (handles clicks inside that HTML via
 * delegation). Because of that, Forge, Inventory, and Quest Board can each
 * have completely different internal layouts and still use this same shell.
 *
 * Tab shape:
 *   {
 *     key: 'shop',
 *     label: 'Shop',
 *     render: () => '<div>...html, with data-action="..." data-key="..." on
 *                     anything clickable...</div>',
 *     onAction: (bodyEl, action, key, event, overlay) => {
 *       // mutate state, then usually: overlay.refresh()
 *     },
 *   }
 *
 * Usage:
 *   const overlay = new Overlay({ shellEl, titleEl, tabbarEl, bodyEl, closeBtn });
 *   overlay.show({ title: 'Shop', tabsFn: buildShopTabs });
 *   // ...later, after some external state change (e.g. quest completed)...
 *   overlay.refresh();
 *
 * `tabsFn` is called fresh every time `show()` or `refresh()` runs. Treat it
 * like a selector over your game state (map SHOP_ITEMS + player.goldcoin
 * into tab data), not something you have to remember to keep in sync by hand.
 *
 * For the common "pick an item from a list, see its detail on the right"
 * shape (Shop, Bounties, Trades, likely Inventory), use the
 * iconStripDetail() helper in ui/components/iconStripDetail.js instead of
 * writing render()/onAction() from scratch. For anything that doesn't fit
 * that shape (Forge's paperdoll + craft grid, a Quest Board map layout),
 * write render()/onAction() by hand — the shell doesn't care either way.
 */
export class Overlay {
  constructor({ shellEl, titleEl, tabbarEl, bodyEl, closeBtn }) {
    this.shellEl = shellEl;
    this.titleEl = titleEl;
    this.tabbarEl = tabbarEl;
    this.bodyEl = bodyEl;
    this.closeBtn = closeBtn;

    this.getTabs = null;
    this.activeTabKey = null;
    this._currentTab = null;

    this.bodyEl.addEventListener("click", (e) => this._handleBodyClick(e));
    this.tabbarEl.addEventListener("click", (e) => this._handleTabClick(e));
    this.onClose = null;

    this.closeBtn.addEventListener("click", () => {
      this.hide();
      this.onClose?.();
    });
  }

  show({ title, tabsFn }) {
    this.titleEl.textContent = title;
    this.getTabs = tabsFn;
    const tabs = this.getTabs();
    this.activeTabKey = tabs[0]?.key ?? null;
    this._renderTabbar(tabs);
    this._renderBody(tabs);
    this.shellEl.classList.add("active");
  }

  hide() {
    this.shellEl.classList.remove("active");
  }

  /** Re-derives tabs from tabsFn and re-renders tab bar + body. Call this
   *  after any action changes state that the panel should reflect. */
  refresh() {
    if (!this.getTabs) return;
    const tabs = this.getTabs();
    this._renderTabbar(tabs);
    this._renderBody(tabs);
  }

  _renderTabbar(tabs) {
    this.tabbarEl.innerHTML = tabs
      .map(
        (t) => `
      <button class="panel-tab ${t.key === this.activeTabKey ? "active" : ""}"
              data-select-tab="${t.key}">
        ${t.label}
      </button>
    `,
      )
      .join("");
  }

  _renderBody(tabs) {
    const tab = tabs.find((t) => t.key === this.activeTabKey);
    this._currentTab = tab || null;
    this.bodyEl.innerHTML = tab ? tab.render() : "";
  }

  _handleTabClick(e) {
    const el = e.target.closest("[data-select-tab]");
    if (!el) return;
    this.activeTabKey = el.dataset.selectTab;
    this.refresh();
  }

  _handleBodyClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el || !this._currentTab?.onAction) return;
    this._currentTab.onAction(
      this.bodyEl,
      el.dataset.action,
      el.dataset.key,
      e,
      this,
    );
  }
}
