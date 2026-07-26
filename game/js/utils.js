import { player } from "./state.js";
import { assembleWeapon, ARMORS } from "./data/gear.js";
import { SKILLS } from "./data/skills.js";

/* ---------- HELPERS ---------- */

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}
export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
export function pct(v, max) {
  return clamp((v / max) * 100, 0, 100);
}
export function addMat(name, n) {
  player.materials[name] = (player.materials[name] || 0) + n;
}

export const ARMOR_SLOTS = ["head", "chest", "arms", "waist", "legs"];

export function currentWeapon() {
  return assembleWeapon(player.weapon) || assembleWeapon("basic");
}

export function currentArmor() {
  const equipped = {};
  ARMOR_SLOTS.forEach((slot) => {
    const key = player.armorSlots?.[slot];
    equipped[slot] = key ? ARMORS[key] : null;
  });
  return equipped;
}

export function getArmorStats() {
  const armor = currentArmor();
  const pieces = Object.values(armor).filter(Boolean);

  const def = pieces.reduce((sum, p) => sum + (p.def || 0), 0);
  const resist = { fire: 0, ice: 0 };
  pieces.forEach((p) => {
    resist.fire += p.resist?.fire || 0;
    resist.ice += p.resist?.ice || 0;
  });

  const skillPoints = {};
  pieces.forEach((p) => {
    Object.entries(p.skills || {}).forEach(([skillKey, pts]) => {
      skillPoints[skillKey] = (skillPoints[skillKey] || 0) + pts;
    });
  });

  const skillProgress = Object.entries(skillPoints).map(([skillKey, points]) => {
    const meta = SKILLS[skillKey];
    if (!meta) return null;
    return { ...meta, points, active: points >= meta.threshold };
  }).filter(Boolean);

  return { def, resist, skillPoints, skillProgress };
}

export function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

export function rollLoot(table) {
  const total = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = randInt(1, total);
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
}