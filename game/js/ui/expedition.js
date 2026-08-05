import { renderTopbar } from "./topbar.js";

let currentCallback = null;

export function renderEncounter(encounter, buttons = [], progress = null) {
  document.getElementById("village-screen").classList.add("hidden");

  const screen = document.getElementById("hunt-screen");
  screen.classList.remove("hidden");

  const trailHtml = progress ? renderTrail(progress) : "";

  screen.innerHTML = `
    <div class="panel">

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

      <div class="telegraph-banner">
        ${encounter.text}
      </div>

      <div id="encounter-actions" class="actions"></div>

    </div>
  `;

  const container = document.getElementById("encounter-actions");

  buttons.forEach((button, index) => {
    const b = document.createElement("button");
    b.textContent = button.label;
    b.onclick = () => {
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
 * Placeholder trail strip — one marker per expedition node, left to right.
 * No fog of war: every node's type is visible from the start, including
 * the boss node at the end. This is deliberately abstract (icons + a
 * connecting line) rather than a real map/tile-path, so a proper visual
 * node-walk can slot in later without changing the data flow — the trail
 * just needs {nodes, step} from getExpeditionProgress().
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