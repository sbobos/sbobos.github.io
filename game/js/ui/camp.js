import { player } from '../state.js';
import { SHOP_ITEMS } from '../data/gear.js';
import { BOUNTIES } from '../data/bounties.js';
import { TRADE_OFFERS } from '../data/trades.js';
import { addMat } from '../utils.js';
import { renderVillage } from './village.js';

/* ---------- SHOP ---------- */

function renderShopSection(){
  const cards = Object.values(SHOP_ITEMS).map(item => `
    <div class="card shop-card">
      <div class="shop-title">${item.name}</div>
      <div class="shop-desc">${item.desc}</div>
      <div class="shop-actions">
        <span>${item.price} zenny</span>
        <button ${player.zenny < item.price ? 'disabled' : ''} onclick="buyShopItem('${item.key}')">Buy</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="panel">
      <h2>Hunter's Shop</h2>
      <p class="section-copy">Camp supplies and small upgrades keep your hunts alive when the terrain turns hostile.</p>
      <div class="shop-grid">${cards}</div>
    </div>
  `;
}

export function buyShopItem(key){
  const item = SHOP_ITEMS[key];
  if (!item || player.zenny < item.price) return;
  player.zenny -= item.price;
  item.effect(player);
  renderVillage();
}

/* ---------- BOUNTY BOARD ---------- */

function reqListHtml(costEntries){
  return `
    <ul class="req-list">
      ${costEntries.map(([mat,need]) => {
        const have = player.materials[mat] || 0;
        const ok = have >= need;
        return `<li class="${ok?'ok':'bad'}"><span>${mat}</span><span>${have}/${need}</span></li>`;
      }).join('')}
    </ul>
  `;
}

function renderBountyCard(bounty){
  const costEntries = Object.entries(bounty.cost);
  const canTurnIn = costEntries.every(([mat,need]) => (player.materials[mat]||0) >= need);

  const rewardParts = Object.entries(bounty.rewardMaterials||{}).map(([mat,n]) => `${n}x ${mat}`);
  if (bounty.rewardZenny) rewardParts.push(`${bounty.rewardZenny} zenny`);

  return `
    <div class="card craft-card">
      <div class="ctag">Bounty · Repeatable</div>
      <div class="cname">${bounty.title}</div>
      <div class="cstat">${bounty.desc}</div>
      ${reqListHtml(costEntries)}
      <div class="compare-text">Reward: ${rewardParts.join(', ') || 'Zenny only'}</div>
      <button ${canTurnIn ? '' : 'disabled'} onclick="turnInBounty('${bounty.key}')">Turn in</button>
    </div>
  `;
}

function renderBountySection(){
  const cards = BOUNTIES.map(renderBountyCard).join('');
  return `
    <div class="panel">
      <h2>Bounty Board</h2>
      <p class="section-copy">Repeatable requests from camp and traveling traders. Turn in materials you're already sitting on for a guaranteed reward — no fresh hunt required.</p>
      <div class="forge-grid">${cards}</div>
    </div>
  `;
}

export function turnInBounty(key){
  const bounty = BOUNTIES.find(b => b.key === key);
  if (!bounty) return;
  const canTurnIn = Object.entries(bounty.cost).every(([mat,need]) => (player.materials[mat]||0) >= need);
  if (!canTurnIn) return;

  Object.entries(bounty.cost).forEach(([mat,need]) => addMat(mat, -need));
  Object.entries(bounty.rewardMaterials||{}).forEach(([mat,n]) => addMat(mat, n));
  if (bounty.rewardZenny) player.zenny += bounty.rewardZenny;

  renderVillage();
}

/* ---------- TRADER'S STALL ---------- */

function tradeGetLabel(trade){
  const parts = [];
  if (trade.get.zenny) parts.push(`${trade.get.zenny} zenny`);
  Object.entries(trade.get.materials||{}).forEach(([mat,n]) => parts.push(`${n}x ${mat}`));
  return parts.join(', ');
}

function renderTradeCard(trade){
  const giveEntries = Object.entries(trade.give);
  const canTrade = giveEntries.every(([mat,need]) => (player.materials[mat]||0) >= need);

  return `
    <div class="card craft-card">
      <div class="ctag">Barter</div>
      <div class="cname">${tradeGetLabel(trade)}</div>
      <div class="cstat">In exchange for:</div>
      ${reqListHtml(giveEntries)}
      <button ${canTrade ? '' : 'disabled'} onclick="doTrade('${trade.key}')">Trade</button>
    </div>
  `;
}

function renderTradeSection(){
  const cards = TRADE_OFFERS.map(renderTradeCard).join('');
  return `
    <div class="panel">
      <h2>Trader's Stall</h2>
      <p class="section-copy">Dump excess common materials for zenny, or barter up toward rarer ones. Rates are fixed and the stall is always open.</p>
      <div class="forge-grid">${cards}</div>
    </div>
  `;
}

export function doTrade(key){
  const trade = TRADE_OFFERS.find(t => t.key === key);
  if (!trade) return;
  const canTrade = Object.entries(trade.give).every(([mat,need]) => (player.materials[mat]||0) >= need);
  if (!canTrade) return;

  Object.entries(trade.give).forEach(([mat,need]) => addMat(mat, -need));
  if (trade.get.zenny) player.zenny += trade.get.zenny;
  Object.entries(trade.get.materials||{}).forEach(([mat,n]) => addMat(mat, n));

  renderVillage();
}

/* ---------- TAB ENTRY POINT ---------- */

export function renderCampTab(){
  return renderShopSection() + renderBountySection() + renderTradeSection();
}
