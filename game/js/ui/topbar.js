import { player } from '../state.js';
import { currentWeapon, currentArmor } from '../utils.js';

/* ---------- TOPBAR ---------- */

export function renderTopbar(){
  document.getElementById('tb-name').textContent = player.name;
  document.getElementById('tb-zenny').textContent = player.zenny;
  document.getElementById('tb-weapon').textContent = currentWeapon().name;
  const armor = currentArmor();
  document.getElementById('tb-armor').textContent = `${armor.head.name} / ${armor.body.name}`;
}
