import { renderTopbar } from "./topbar.js";

let currentCallback = null;

const TYPE_COLORS = {
  battle: "#e74c3c",   // Red
  boss: "#8e44ad",     // Purple
  mining: "#f39c12",   // Amber
  foraging: "#2ecc71", // Green
  rest: "#e67e22",     // Orange
  event: "#3498db"     // Blue
};

export function renderEncounter(encounter, buttons = [], progress = null) {
  document.getElementById("village-screen").classList.add("hidden");

  const screen = document.getElementById("hunt-screen");
  screen.classList.remove("hidden");

  // Screen entrance reaction: brief shake on combat/boss
  screen.classList.remove("shake-impact");
  if (encounter.type === "battle" || encounter.type === "boss") {
    void screen.offsetWidth; // Force reflow to re-trigger animation
    screen.classList.add("shake-impact");
  }

  const trailHtml = progress ? renderTrail(progress) : "";
  const accentColor = TYPE_COLORS[encounter.type] || "#ffffff";

  screen.innerHTML = `
    <div class="panel" style="--accent-color: ${accentColor};">

      ${trailHtml}

      <div class="arena-tag">
        Expedition
      </div>

      <div class="monster-head">
        <span class="micon">${getIcon(encounter.type)}</span>

        <div>
          <span class="mname">${encounter.title}</span>
        </div>
      </div>

      <div class="telegraph-banner"></div>

      <div id="encounter-actions" class="actions"></div>

    </div>
  `;

  // 1. Typewriter effect for telegraph banner
  const bannerEl = screen.querySelector(".telegraph-banner");
  typewriteText(bannerEl, encounter.text || "");

  // 2. Staggered button creation with web audio blips
  const container = document.getElementById("encounter-actions");

  buttons.forEach((button, index) => {
    const b = document.createElement("button");
    b.textContent = button.label;
    b.style.animationDelay = `${index * 0.08}s`;

    // Attach tooltip text if provided on the button object
    if (button.tooltip) {
      b.setAttribute("data-tooltip", button.tooltip);
    }

    b.onmouseenter = () => playBlip(280, "triangle", 0.04);
    b.onclick = () => {
      playBlip(520, "square", 0.08);
      if (currentCallback) currentCallback(index);
    };

    container.appendChild(b);
  });

  renderTopbar();
}

export function setEncounterHandler(callback) {
  currentCallback = callback;
}

/**
 * Typewriter effect to reveal encounter text letter-by-letter
 */
function typewriteText(element, text, speed = 18) {
  element.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

/**
 * Zero-asset audio synth using Web Audio API
 */
function playBlip(freq, type = "sine", duration = 0.05) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio Context blocked or unsupported
  }
}

/**
 * Placeholder trail strip — one marker per expedition node, left to right.
 */
function renderTrail(progress) {
  const { nodes, step } = progress;

  const markers = nodes
    .map((node, index) => {
      const state =
        index < step ? "done" : index === step ? "current" : "upcoming";
      const isBoss = node.type === "boss";

      return `
      <div class="trail-node ${state} ${isBoss ? "boss" : ""}">
        <span class="trail-icon">${isBoss ? "💀" : getIcon(node.type)}</span>
      </div>
      ${index < nodes.length - 1 ? '<div class="trail-line"></div>' : ""}
    `;
    })
    .join("");

  return `<div class="expedition-trail">${markers}</div>`;
}

function getIcon(type) {
  switch (type) {
    case "mining":
      return "⛏️";

    case "foraging":
      return "🌿";

    case "battle":
      return "⚔️";

    case "event":
      return "❔";

    case "rest":
      return "🔥";

    case "boss":
      return "💀";

    default:
      return "📍";
  }
}