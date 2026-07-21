import { hunt, player } from '../state.js';
import { rand, randInt, currentWeapon, getArmorStats } from '../utils.js';
import { hitzoneMultiplier } from './parts.js';
import { logMsg } from './log.js';
import { resolvePendingMove } from './resolve.js';
import { monsterTelegraphPhase } from './telegraph.js';
import { endHunt } from './setup.js';
import { renderHunt } from '../ui/hunt.js';

/* ---------- PLAYER ACTIONS ---------- */

export function playerAction(actionType, payload){
  if (hunt.over) return;
  payload = payload || {};
  hunt.playerGuardedThisRound = (actionType === 'guard');

  if (actionType === 'flee'){
    handleFlee();
    return;
  }

  if (hunt.pendingMove){
    if (actionType === 'attack'){
      logMsg('You seize the opening and strike before the monster can complete its move!', 'l-good');
      doPlayerAttack(payload.partKey);
      hunt.pendingMove = null;
      hunt.sandstormActive = false;
      hunt.pendingMoveWasJustResolved = false;
      if (hunt.over) return;
      if (player.hp <= 0){ endHunt('defeat'); return; }
      hunt.recoveryWindow = true;
      renderHunt();
      return;
    }
    if (!['dodge','guard'].includes(actionType)){
      logMsg('The monster is already committing to its attack — react now!', 'l-sys');
      renderHunt();
      return;
    }
    resolvePendingMove(actionType, payload);
    if (player.hp <= 0){ endHunt('defeat'); return; }
  }

  if (actionType === 'attack'){
    doPlayerAttack(payload.partKey);
    if (hunt.over) return;
    if (player.hp <= 0){ endHunt('defeat'); return; }

    if (!hunt.recoveryWindow){
      hunt.recoveryWindow = true;
      logMsg('The monster recoils from the hit, giving you a brief opening.', 'l-good');
      renderHunt();
      return;
    }

    hunt.recoveryWindow = true;
    logMsg('You keep the pressure on while the monster is still off-balance.', 'l-good');
    renderHunt();
    return;
  } else if (actionType === 'guard') doPlayerGuardSelf();
  else if (actionType === 'item') doPlayerItem();
  else if (actionType === 'dodge' && !hunt.pendingMoveWasJustResolved) doPlayerDodgeSelf();

  hunt.pendingMoveWasJustResolved = false;
  if (hunt.over) return;
  if (player.hp <= 0){ endHunt('defeat'); return; }

  hunt.recoveryWindow = false;
  monsterTelegraphPhase();
  renderHunt();
}

export function getWeaponSpecialEffect(weapon, part, dmg, crit){
  let extraDmg = 0;
  let note = '';
  switch (weapon.key){
    case 'boarhammer':
      if (part.broken){ extraDmg = 4; note = 'Impact drives extra force into the exposed wound.'; }
      break;
    case 'wyrmfang':
      if (crit || part.hitzone.fire >= 20){ extraDmg = 6; note = 'The blade sears the weak spot with blazing force.'; }
      break;
    case 'dunelord':
      if (Math.random() < 0.2){ extraDmg = 8; note = 'The greatfang overwhelms the target with a crushing blow.'; }
      break;
  }
  return { extraDmg, note };
}

export function doPlayerAttack(partKey){
  const cost = 20;
  if (player.stamina < cost){
    logMsg("You're too winded to swing hard. Wait for stamina to recover.", 'l-sys');
    return;
  }
  player.stamina -= cost;

  const m = hunt.monster;
  const part = m.parts.find(p => p.key === partKey);
  const weapon = currentWeapon();
  const mult = hitzoneMultiplier(part);

  let physical = weapon.atk * (part.hitzone[weapon.damageType]/100) * mult;
  let elemental = 0;
  if (weapon.element !== 'none'){
    elemental = weapon.elementPower * (part.hitzone[weapon.element]/100) * mult;
  }
  let dmg = Math.round((physical + elemental) * rand(0.85,1.2));
  const crit = Math.random() < 0.15;
  if (crit) dmg = Math.round(dmg * 1.5);
  const special = getWeaponSpecialEffect(weapon, part, dmg, crit);
  dmg = Math.max(1, dmg + special.extraDmg);
  dmg = Math.max(1, dmg);

  const wasBrokenAlready = part.broken;
  part.hp = Math.max(0, part.hp - dmg);

  if (!(part.broken && part.postBreakImmune)){
    m.hp = Math.max(0, m.hp - dmg);
  }

  logMsg(`You strike the ${part.name.toLowerCase()} for ${dmg} damage.${crit ? ' A solid hit!' : ''}${special.note ? ' ' + special.note : ''}`, crit ? 'l-crit' : 'l-hit');

  if (part.hp <= 0 && !wasBrokenAlready){
    part.broken = true;
    m.hp = Math.max(0, m.hp - part.breakBonus);
    logMsg(`${part.breakMsg} (+${part.breakBonus} bonus damage)`, 'l-break');
  }

  if (!m.enraged && m.hp <= m.maxHp * 0.3){
    m.enraged = true;
    logMsg(`The ${m.name} is enraged! Its attacks grow fiercer.`, 'l-dmg');
  }

  if (m.hp <= 0){
    logMsg(`The ${m.name} collapses. The hunt is over.`, 'l-break');
    endHunt('victory');
  }
}

export function doPlayerGuardSelf(){
  const weapon = currentWeapon();
  let gain = 20;
  let note = '';
  if (weapon.key === 'bearclaw'){
    gain = 28;
    note = ' Your clawed gauntlet keeps your footing firm.';
  }
  player.stamina = Math.min(player.maxStamina, player.stamina + gain);
  if (!hunt.pendingMove){
    logMsg(`You settle into a ready stance, catching your breath.${note}`, 'l-sys');
  }
}

export function doPlayerItem(){
  if (player.potions <= 0){
    logMsg('No potions left in your pack.', 'l-sys');
    return;
  }
  player.potions -= 1;
  player.hp = Math.min(player.maxHp, player.hp + 40);
  logMsg('You down a potion, recovering 40 HP.', 'l-sys');
}

export function doPlayerDodgeSelf(){
  player.stamina = Math.min(player.maxStamina, player.stamina + 10);
  logMsg('You reposition, staying light on your feet.', 'l-sys');
}

export function handleFlee(){
  if (Math.random() < 0.75){
    logMsg('You break away and retreat from the hunting grounds.', 'l-sys');
    hunt.pendingMove = null;
    endHunt('flee');
    return;
  }
  logMsg("You can't find an opening to escape!", 'l-sys');
  if (hunt.pendingMove){
    resolvePendingMove('flee_fail', {});
    if (player.hp <= 0){ endHunt('defeat'); return; }
  }
  monsterTelegraphPhase();
  renderHunt();
}
