import { setPlayer, setStory } from "../../state.js";
import { generateSaveCode, loadSaveCode } from "../../save.js";
import { refreshQuestBoard } from "./questboard.js";

export function buildSaveTabs() {
  return [
    {
      key: "save",
      label: "Save",

      render() {
        return `
          <div class="panel">
            <h2>Save game</h2>

            <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">
              Generates a portable save code (your gear, materials, goldcoin, and stats).
              Copy it somewhere safe — pasting it back below restores that exact state.
              No browser storage is used, so this works the same whether you're playing
              here or from a saved copy of the file.
            </p>

            <button class="primary" onclick="doGenerateSave()">
              Generate save code
            </button>

            <textarea
              id="save-code-box"
              readonly
              rows="4"
              style="width:100%; margin-top:10px; font-family:var(--font-mono); font-size:11px; background:#0d1210; color:var(--text); border:1px solid var(--border); border-radius:4px; padding:8px;"
              placeholder="Your save code will appear here."
            ></textarea>

            <div
              id="save-status"
              style="font-size:11px; color:var(--moss); margin-top:6px; min-height:14px;"
            ></div>
          </div>
        `;
      },

      onAction(body, action, key, event, overlay) {},
    },

    {
      key: "load",
      label: "Load",

      render() {
        return `
          <div class="panel">
            <h2>Load game</h2>

            <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">
              Paste a save code below and load it.
            </p>

            <textarea
              id="load-code-box"
              rows="4"
              style="width:100%; font-family:var(--font-mono); font-size:11px; background:#0d1210; color:var(--text); border:1px solid var(--border); border-radius:4px; padding:8px;"
              placeholder="Paste your IRONVEIL1:... code here"
            ></textarea>

            <button
              class="primary"
              style="margin-top:10px;"
              onclick="doLoadSave()">
              Load save code
            </button>

            <div
              id="load-status"
              style="font-size:11px; margin-top:6px; min-height:14px;"
            ></div>
          </div>
        `;
      },

      onAction(body, action, key, event, overlay) {},
    },

    {
      key: "new",
      label: "New Game",

      render() {
        return `
          <div class="panel">
            <h2>New game</h2>

            <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">
              Wipes goldcoin, gear, and materials back to a fresh Hunter's Blade
              and Cloth Vest.
            </p>

            <button onclick="doNewGame()">
              Start a new hunter
            </button>
          </div>
        `;
      },

      onAction(body, action, key, event, overlay) {},
    },
  ];
}

export function doGenerateSave() {
  const code = generateSaveCode();
  const box = document.getElementById("save-code-box");
  const status = document.getElementById("save-status");
  if (!code) {
    status.textContent = "Could not generate a save code.";
    status.style.color = "var(--blood)";
    return;
  }
  box.value = code;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        status.textContent = "Copied to clipboard.";
        status.style.color = "var(--moss)";
      })
      .catch(() => {
        status.textContent =
          "Code generated — copy it manually from the box above.";
        status.style.color = "var(--moss)";
      });
  } else {
    box.select();
    status.textContent =
      "Code generated — copy it manually from the box above.";
    status.style.color = "var(--moss)";
  }
}

export function doLoadSave() {
  const code = document.getElementById("load-code-box").value;
  const status = document.getElementById("load-status");
  const ok = loadSaveCode(code);
  if (ok) {
    status.textContent = "Save loaded.";
    status.style.color = "var(--moss)";
    // refreshQuestBoard() clears the cached board entries and re-renders
    // the village screen — equivalent to the old inline
    // `cachedEntries = null; renderVillage();` pair, now that the cache
    // lives inside questboard.js.
    refreshQuestBoard();
  } else {
    status.textContent = "That code didn't load — check you copied it in full.";
    status.style.color = "var(--blood)";
  }
}

export function doNewGame() {
  setPlayer({
    name: "Hunter",
    maxHp: 120,
    hp: 120,
    maxStamina: 100,
    stamina: 100,
    weapon: "basic",
    armorSlots: { head: "headband", body: "basic" },
    ownedWeapons: ["basic"],
    ownedArmors: ["basic", "headband"],
    goldcoin: 60,
    potions: 3,
    materials: {},
    stats: { hunts: 0, victories: 0, fled: 0, defeats: 0 },
    trophies: {},
  });
  setStory({
    chapter: 1,
    activeMissionKey: "intro_boar",
    completedMissionKeys: [],
    unlockedMissionKeys: ["intro_boar"],
  });
  refreshQuestBoard();
}
