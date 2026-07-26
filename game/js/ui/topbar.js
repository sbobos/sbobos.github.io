import { player } from "../state.js";
import { currentWeapon, currentArmor } from "../utils.js";
import { getArmorStats } from "../utils.js";

/* ---------- TOPBAR ---------- */

export function renderTopbar() {
  document.getElementById("tb-name").textContent = player.name;
  document.getElementById("tb-goldcoin").textContent = player.goldcoin;
  document.getElementById("tb-weapon").textContent = currentWeapon().name;
  const armor = currentArmor();
  document.getElementById("tb-armor").textContent =
    `DEF ${getArmorStats().def}`;
}
