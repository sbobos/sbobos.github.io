import { renderTopbar } from "./topbar.js";

let currentCallback = null;

export function renderEncounter(encounter, buttons = []) {
  document.getElementById("village-screen").classList.add("hidden");

  const screen = document.getElementById("hunt-screen");
  screen.classList.remove("hidden");

  screen.innerHTML = `
    <div class="panel">

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

function getIcon(type) {
  switch (type) {
    case "mining":
      return "⛏️";

    case "foraging":
      return "🌿";

    case "battle":
      return "🐗";

    case "event":
      return "❔";

    case "rest":
      return "🔥";

    default:
      return "📍";
  }
}
