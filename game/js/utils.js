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

  const skillProgress = Object.entries(skillPoints)
    .map(([skillKey, points]) => {
      const meta = SKILLS[skillKey];
      if (!meta) return null;
      return { ...meta, points, active: points >= meta.threshold };
    })
    .filter(Boolean);

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

/* ---------- AUDIO SYNTHESIZER (WEB AUDIO API) ---------- */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === "slash") {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === "crit") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "player_hurt") {
      // Deep punchy bass impact for when player gets hit
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "break") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.3);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "enrage") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    console.warn("Audio Context error:", err);
  }
}

/**
 * Triggers heavy screen shake animation.
 */
export function triggerShake(elementId = "hunt-screen") {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");

  setTimeout(() => el.classList.remove("shake"), 350);
}

/**
 * Flash red tint across screen when taking damage.
 */
export function triggerDamageFlash() {
  let flashOverlay = document.getElementById("damage-flash-overlay");

  if (!flashOverlay) {
    flashOverlay = document.createElement("div");
    flashOverlay.id = "damage-flash-overlay";
    document.body.appendChild(flashOverlay);
  }

  flashOverlay.classList.remove("flash-active");
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add("flash-active");

  setTimeout(() => flashOverlay.classList.remove("flash-active"), 450);
}

/**
 * Helper delay function to pace out combat resolutions.
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
