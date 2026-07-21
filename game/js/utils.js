import { player } from './state.js';
import { WEAPONS, ARMORS } from './data/gear.js';

/* ---------- HELPERS ---------- */

export function rand(min,max){ return Math.random()*(max-min)+min; }
export function randInt(min,max){ return Math.floor(rand(min,max+1)); }
export function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
export function pct(v,max){ return clamp((v/max)*100,0,100); }
export function addMat(name,n){ player.materials[name] = (player.materials[name]||0) + n; }
export function currentWeapon(){ return WEAPONS[player.weapon] || WEAPONS.basic; }
export function currentArmor(){
  return {
    head: ARMORS[player.armorSlots?.head] || ARMORS.basic,
    body: ARMORS[player.armorSlots?.body] || ARMORS.basic
  };
}
export function getArmorStats(){
  const armor = currentArmor();
  const resist = { fire: (armor.head.resist?.fire || 0) + (armor.body.resist?.fire || 0), ice: (armor.head.resist?.ice || 0) + (armor.body.resist?.ice || 0) };
  return { def: (armor.head.def || 0) + (armor.body.def || 0), resist };
}
export function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
