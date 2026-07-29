import { player } from "../state.js";
import { SHOP_ITEMS } from "../data/gear.js";
import { BOUNTIES } from "../data/bounties.js";
import { TRADE_OFFERS } from "../data/trades.js";
import { addMat } from "../utils.js";
import { renderVillage } from "./village.js";

/* ---------- LOCAL UI STATE (ephemeral — not saved) ---------- */
let activeCampTab = "shop";
let selectedKeys = { shop: null, bounty: null, trade: null };

const CAMP_TABS = [
  { key: "shop", label: "Shop" },
  { key: "bounty", label: "Bounties" },
  { key: "trade", label: "Trades" },
];

/* ---------- SHARED HELPERS ---------- */

function reqListHtml(costEntries) {
  return `
    <ul class="req-list">
      ${costEntries
        .map(([mat, need]) => {
          const have = player.materials[mat] || 0;
          const ok = have >= need;
          return `<li class="${ok ? "ok" : "bad"}"><span>${mat}</span><span>${have}/${need}</span></li>`;
        })
        .join("")}
    </ul>
  `;
}

function tradeGetLabel(trade) {
  const parts = [];
  if (trade.get.goldcoin) parts.push(`${trade.get.goldcoin} Gold Coin`);
  Object.entries(trade.get.materials || {}).forEach(([mat, n]) =>
    parts.push(`${n}x ${mat}`),
  );
  return parts.join(", ");
}

function renderIconStrip(items, tab, selectedKey) {
  return `
    <div class="detail-strip inv-icon-strip">
      ${items
        .map(
          (it) => `
        <div class="inv-icon-item ${it.key === selectedKey ? "selected" : ""} ${it.ready ? "ready" : ""}"
             onclick="selectCampItem('${tab}', '${it.key}')">
          <span class="inv-icon">${it.icon}</span>
          <span class="inv-icon-label">${it.label}</span>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

/* ---------- SHOP ---------- */

function getShopList() {
  return Object.values(SHOP_ITEMS).map((item) => ({
    key: item.key,
    icon: "🛒",
    label: item.name,
    ready: player.goldcoin >= item.price,
    data: item,
  }));
}

function renderShopDetail(item) {
  if (!item) return `<div class="inv-empty">Select a shop item.</div>`;
  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">🛒</span>
      <div>
        <div class="inv-detail-title">${item.name}</div>
        <div class="inv-detail-tag">Shop Item</div>
      </div>
    </div>
    <div class="shop-desc">${item.desc}</div>
    <div class="shop-actions">
      <span>${item.price} Gold Coin</span>
      <button ${player.goldcoin < item.price ? "disabled" : ""} onclick="buyShopItem('${item.key}')">Buy</button>
    </div>
  `;
}

export function buyShopItem(key) {
  const item = SHOP_ITEMS[key];
  if (!item || player.goldcoin < item.price) return;
  player.goldcoin -= item.price;
  item.effect(player);
  renderVillage();
}

/* ---------- BOUNTY BOARD ---------- */

function getBountyList() {
  return BOUNTIES.map((bounty) => {
    const costEntries = Object.entries(bounty.cost);
    const canTurnIn = costEntries.every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );
    return {
      key: bounty.key,
      icon: "📜",
      label: bounty.title,
      ready: canTurnIn,
      data: bounty,
    };
  });
}

function renderBountyDetail(bounty) {
  if (!bounty) return `<div class="inv-empty">Select a bounty.</div>`;
  const costEntries = Object.entries(bounty.cost);
  const canTurnIn = costEntries.every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );
  const rewardParts = Object.entries(bounty.rewardMaterials || {}).map(
    ([mat, n]) => `${n}x ${mat}`,
  );
  if (bounty.rewardgoldcoin)
    rewardParts.push(`${bounty.rewardgoldcoin} Gold Coin`);

  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">📜</span>
      <div>
        <div class="inv-detail-title">${bounty.title}</div>
        <div class="inv-detail-tag">Bounty · Repeatable</div>
      </div>
    </div>
    <div class="shop-desc">${bounty.desc}</div>
    ${reqListHtml(costEntries)}
    <div class="compare-text">Reward: ${rewardParts.join(", ") || "Gold Coin only"}</div>
    <div class="shop-actions">
      <span></span>
      <button ${canTurnIn ? "" : "disabled"} onclick="turnInBounty('${bounty.key}')">Turn in</button>
    </div>
  `;
}

export function turnInBounty(key) {
  const bounty = BOUNTIES.find((b) => b.key === key);
  if (!bounty) return;
  const canTurnIn = Object.entries(bounty.cost).every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );
  if (!canTurnIn) return;

  Object.entries(bounty.cost).forEach(([mat, need]) => addMat(mat, -need));
  Object.entries(bounty.rewardMaterials || {}).forEach(([mat, n]) =>
    addMat(mat, n),
  );
  if (bounty.rewardgoldcoin) player.goldcoin += bounty.rewardgoldcoin;

  renderVillage();
}

/* ---------- TRADER'S STALL ---------- */

function getTradeList() {
  return TRADE_OFFERS.map((trade) => {
    const giveEntries = Object.entries(trade.give);
    const canTrade = giveEntries.every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );
    return {
      key: trade.key,
      icon: "🔄",
      label: tradeGetLabel(trade),
      ready: canTrade,
      data: trade,
    };
  });
}

function renderTradeDetail(trade) {
  if (!trade) return `<div class="inv-empty">Select a trade offer.</div>`;
  const giveEntries = Object.entries(trade.give);
  const canTrade = giveEntries.every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );

  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">🔄</span>
      <div>
        <div class="inv-detail-title">${tradeGetLabel(trade)}</div>
        <div class="inv-detail-tag">Barter</div>
      </div>
    </div>
    <div class="cstat">In exchange for:</div>
    ${reqListHtml(giveEntries)}
    <div class="shop-actions">
      <span></span>
      <button ${canTrade ? "" : "disabled"} onclick="doTrade('${trade.key}')">Trade</button>
    </div>
  `;
}

export function doTrade(key) {
  const trade = TRADE_OFFERS.find((t) => t.key === key);
  if (!trade) return;
  const canTrade = Object.entries(trade.give).every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );
  if (!canTrade) return;

  Object.entries(trade.give).forEach(([mat, need]) => addMat(mat, -need));
  if (trade.get.goldcoin) player.goldcoin += trade.get.goldcoin;
  Object.entries(trade.get.materials || {}).forEach(([mat, n]) =>
    addMat(mat, n),
  );

  renderVillage();
}

/* ---------- TAB CONTENT ---------- */

function renderTabContent() {
  if (activeCampTab === "shop") {
    const items = getShopList();
    if (!items.length)
      return `<div class="inv-empty">The shop has nothing in stock.</div>`;
    if (!items.find((i) => i.key === selectedKeys.shop))
      selectedKeys.shop = items[0].key;
    const selected = items.find((i) => i.key === selectedKeys.shop);
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "shop", selectedKeys.shop)}
        <div class="detail-sidebar">${renderShopDetail(selected?.data)}</div>
      </div>
    `;
  }

  if (activeCampTab === "bounty") {
    const items = getBountyList();
    if (!items.length)
      return `<div class="inv-empty">No bounties posted right now.</div>`;
    if (!items.find((i) => i.key === selectedKeys.bounty))
      selectedKeys.bounty = items[0].key;
    const selected = items.find((i) => i.key === selectedKeys.bounty);
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "bounty", selectedKeys.bounty)}
        <div class="detail-sidebar">${renderBountyDetail(selected?.data)}</div>
      </div>
    `;
  }

  if (activeCampTab === "trade") {
    const items = getTradeList();
    if (!items.length)
      return `<div class="inv-empty">The trader has nothing to offer.</div>`;
    if (!items.find((i) => i.key === selectedKeys.trade))
      selectedKeys.trade = items[0].key;
    const selected = items.find((i) => i.key === selectedKeys.trade);
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "trade", selectedKeys.trade)}
        <div class="detail-sidebar">${renderTradeDetail(selected?.data)}</div>
      </div>
    `;
  }

  return "";
}

function renderTabBar() {
  return `
    <div class="inv-tab-bar">
      ${CAMP_TABS.map(
        (t) => `
        <button class="inv-tab ${activeCampTab === t.key ? "active" : ""}" onclick="selectCampTab('${t.key}')">
          ${t.label}
        </button>
      `,
      ).join("")}
    </div>
  `;
}

/* ---------- TAB ENTRY POINT ---------- */

export function renderCampTab() {
  return `
    <div class="panel">
      <h2>Camp</h2>
      <p class="section-copy">Shop for supplies, turn in bounties, and barter materials without a hunt required.</p>
      ${renderTabBar()}
      ${renderTabContent()}
    </div>
  `;
}

/* ---------- UI HANDLERS (need window bindings in main.js) ---------- */
export function selectCampTab(tab) {
  activeCampTab = tab;
  renderVillage();
}

export function selectCampItem(tab, key) {
  selectedKeys[tab] = key;
  renderVillage();
}
