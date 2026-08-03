import { player } from "../../state.js";
import { SHOP_ITEMS } from "../../data/gear.js";
import { BOUNTIES } from "../../data/bounties.js";
import { TRADE_OFFERS } from "../../data/trades.js";
import { addMat } from "../../utils.js";
import { renderVillage } from "../village.js";
import { iconStripDetail } from "../components/iconStripDetail.js";

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

/* ---------- SHOP ---------- */

function getShopItems() {
  return Object.values(SHOP_ITEMS).map((item) => ({
    key: item.key,
    icon: "🛒",
    label: item.name,
    tag: "Shop Item",
    desc: item.desc,
    cost: "",
    ready: player.goldcoin >= item.price,
    disabled: player.goldcoin < item.price,
    actionLabel: "Buy",

    renderExtra() {
      const ok = player.goldcoin >= item.price;
      return `
        <ul class="req-list">
          <li class="${ok ? "ok" : "bad"}"><span>Gold Coin</span><span>${player.goldcoin}/${item.price}</span></li>
        </ul>
      `;
    },

    onAction() {
      return buyShopItem(item.key);
    },
  }));
}

export function buyShopItem(key) {
  const item = SHOP_ITEMS[key];
  if (!item) return false;
  if (player.goldcoin < item.price) return false;

  player.goldcoin -= item.price;
  item.effect(player);
  return true;
}

const shopStrip = iconStripDetail({
  items: getShopItems,
  onSuccess() {
    renderVillage();
  },
});

/* ---------- BOUNTY BOARD ---------- */

function getBountyItems() {
  return BOUNTIES.map((bounty) => {
    const costEntries = Object.entries(bounty.cost);

    const canTurnIn = costEntries.every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );

    const rewardParts = Object.entries(bounty.rewardMaterials || {}).map(
      ([mat, n]) => `${n}x ${mat}`,
    );

    if (bounty.rewardgoldcoin)
      rewardParts.push(`${bounty.rewardgoldcoin} Gold Coin`);

    return {
      key: bounty.key,
      icon: "📜",
      label: bounty.title,
      tag: "Bounty · Repeatable",
      desc: bounty.desc,
      cost: `Reward: ${rewardParts.join(", ") || "Gold Coin"}`,
      ready: canTurnIn,
      disabled: !canTurnIn,
      actionLabel: "Turn In",

      renderExtra() {
        return `
          <div class="action-group-label" style="margin-top:8px;">Required Materials</div>
          ${reqListHtml(costEntries)}
        `;
      },

      onAction() {
        return turnInBounty(bounty.key);
      },
    };
  });
}

const bountyStrip = iconStripDetail({
  items: getBountyItems,
  onSuccess() {
    renderVillage();
  },
});

export function turnInBounty(key) {
  const bounty = BOUNTIES.find((b) => b.key === key);
  if (!bounty) return false;

  const canTurnIn = Object.entries(bounty.cost).every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );

  if (!canTurnIn) return false;

  Object.entries(bounty.cost).forEach(([mat, need]) => addMat(mat, -need));
  Object.entries(bounty.rewardMaterials || {}).forEach(([mat, n]) =>
    addMat(mat, n),
  );
  if (bounty.rewardgoldcoin) player.goldcoin += bounty.rewardgoldcoin;

  return true;
}

/* ---------- TRADER'S STALL ---------- */

function getTradeItems() {
  return TRADE_OFFERS.map((trade) => {
    const giveEntries = Object.entries(trade.give);

    const canTrade = giveEntries.every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );

    return {
      key: trade.key,
      icon: "🔄",
      label: tradeGetLabel(trade),
      tag: "Barter",
      desc: `Receive: ${tradeGetLabel(trade)}`,
      cost: "",
      ready: canTrade,
      disabled: !canTrade,
      actionLabel: "Trade",

      renderExtra() {
        return `
          <div class="action-group-label" style="margin-top:8px;">You Give</div>
          ${reqListHtml(giveEntries)}
        `;
      },

      onAction() {
        return doTrade(trade.key);
      },
    };
  });
}

const tradeStrip = iconStripDetail({
  items: getTradeItems,
  onSuccess() {
    renderVillage();
  },
});

export function doTrade(key) {
  const trade = TRADE_OFFERS.find((t) => t.key === key);
  if (!trade) return false;

  const canTrade = Object.entries(trade.give).every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );

  if (!canTrade) return false;

  Object.entries(trade.give).forEach(([mat, need]) => addMat(mat, -need));
  if (trade.get.goldcoin) player.goldcoin += trade.get.goldcoin;
  Object.entries(trade.get.materials || {}).forEach(([mat, n]) =>
    addMat(mat, n),
  );

  return true;
}

export function buildShopTabs() {
  return [
    {
      key: "shop",
      label: "Shop",
      render: shopStrip.render,
      onAction: shopStrip.onAction,
    },
    {
      key: "bounty",
      label: "Bounties",
      render: bountyStrip.render,
      onAction: bountyStrip.onAction,
    },
    {
      key: "trade",
      label: "Trades",
      render: tradeStrip.render,
      onAction: tradeStrip.onAction,
    },
  ];
}