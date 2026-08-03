import { hunt, player } from "../state.js";

import { doPlayerAttack } from "./combat/attack.js";
import {
  currentWeapon,
  playSound,
  triggerShake,
  triggerDamageFlash,
  delay,
} from "../utils.js";

import { logMsg } from "./log.js";
import { resolvePendingMove } from "./resolve.js";
import { monsterTelegraphPhase } from "./telegraph.js";
import { endHunt } from "./setup.js";

import { renderHunt } from "../ui/hunt.js";

// Input lock to prevent rapid spamming while turn sequence plays out
let isBusy = false;

export async function playerAction(actionType, payload = {}) {
  if (hunt.over || isBusy) {
    return;
  }

  isBusy = true;

  try {
    if (player.staggered) {
      await handleStagger();
      return;
    }

    hunt.playerGuardedThisRound = actionType === "guard";

    if (actionType === "flee") {
      await handleFlee();
      return;
    }

    if (hunt.pendingMove) {
      const handled = await handleReaction(actionType, payload);
      if (handled) {
        return;
      }
    }

    await performAction(actionType, payload);

    // Stop execution completely if player action ended the hunt (e.g. killed monster)
    if (combatFinished()) {
      return;
    }

    await nextMonsterTurn();
  } finally {
    isBusy = false;
  }
}

async function handleStagger() {
  player.staggered = false;

  logMsg("You're staggered and lose your footing!", "l-dmg");
  playSound("player_hurt");
  triggerShake();
  triggerDamageFlash();

  if (combatFinished()) return;
  renderHunt();

  await delay(600);
  if (combatFinished()) return;

  await nextMonsterTurn();
}

async function handleReaction(actionType, payload) {
  if (actionType === "attack") {
    logMsg(
      "You commit to the attack, trading blows as the monster's strike lands!",
      "l-sys",
    );

    doPlayerAttack(payload.partKey, payload.moveKey);

    // If attack killed the monster, render log/end and exit
    if (combatFinished()) {
      return true;
    }

    renderHunt();

    // Pacing pause before monster strike connects
    await delay(500);

    const hpBefore = player.hp;
    resolvePendingMove("attack", payload);

    if (player.hp < hpBefore) {
      playSound("player_hurt");
      triggerShake();
      triggerDamageFlash();
    }

    if (combatFinished()) {
      return true;
    }

    hunt.recoveryWindow = true;
    renderHunt();

    return true;
  }

  if (actionType !== "guard" && actionType !== "dodge") {
    logMsg(
      "The monster is already committing to its attack — react now!",
      "l-sys",
    );

    renderHunt();
    return true;
  }

  const hpBefore = player.hp;
  resolvePendingMove(actionType, payload);

  if (player.hp < hpBefore) {
    playSound("player_hurt");
    triggerShake();
    triggerDamageFlash();
  }

  if (combatFinished()) {
    return true;
  }

  renderHunt();
  return true;
}

async function performAction(actionType, payload) {
  switch (actionType) {
    case "attack":
      attack(payload.partKey, payload.moveKey);
      break;

    case "guard":
      guard();
      break;

    case "dodge":
      dodge();
      break;

    case "item":
      usePotion();
      break;
  }
}

function attack(partKey, moveKey) {
  doPlayerAttack(partKey, moveKey);

  if (combatFinished()) {
    return;
  }

  if (!hunt.recoveryWindow) {
    hunt.recoveryWindow = true;

    logMsg(
      "The monster recoils from the hit, giving you a brief opening.",
      "l-good",
    );
  } else {
    logMsg(
      "You keep the pressure on while the monster is still off-balance.",
      "l-good",
    );
  }

  renderHunt();
}

function guard() {
  const weapon = currentWeapon();

  recoverStamina(Math.round(20 * (weapon.guardStaminaMult ?? 1)));

  if (!hunt.pendingMove) {
    logMsg("You settle into a ready stance, catching your breath.", "l-sys");
  }
  renderHunt();
}

function dodge() {
  if (hunt.pendingMoveWasJustResolved) {
    return;
  }

  recoverStamina(10);

  logMsg("You reposition, staying light on your feet.", "l-sys");
  renderHunt();
}

function usePotion() {
  if (player.potions <= 0) {
    logMsg("No potions left in your pack.", "l-sys");
    renderHunt();
    return;
  }

  player.potions--;
  player.hp = Math.min(player.maxHp, player.hp + 40);

  logMsg("You down a potion, recovering 40 HP.", "l-sys");
  renderHunt();
}

function recoverStamina(amount) {
  player.stamina = Math.min(player.maxStamina, player.stamina + amount);
}

async function handleFlee() {
  if (Math.random() < 0.75) {
    logMsg("You break away and retreat from the hunting grounds.", "l-sys");

    hunt.pendingMove = null;
    endHunt("flee");
    return;
  }

  logMsg("You can't find an opening to escape!", "l-sys");
  renderHunt();

  if (hunt.pendingMove) {
    await delay(500);

    const hpBefore = player.hp;
    resolvePendingMove("flee_fail", {});

    if (player.hp < hpBefore) {
      playSound("player_hurt");
      triggerShake();
      triggerDamageFlash();
    }

    if (combatFinished()) {
      return;
    }

    renderHunt();
  }

  await nextMonsterTurn();
}

async function nextMonsterTurn() {
  if (combatFinished()) return;

  // Pacing pause (500ms) before monster telegraphs its next move
  await delay(500);

  if (combatFinished()) return;

  hunt.pendingMoveWasJustResolved = false;
  hunt.recoveryWindow = false;

  monsterTelegraphPhase();

  renderHunt();

  hunt.playerGuardedThisRound = false;
}

function combatFinished() {
  if (hunt.over) {
    return true;
  }

  // 1. Monster Defeated (Victory)
  if (hunt.monster.hp <= 0) {
    logMsg(`THE ${hunt.monster.name.toUpperCase()} COLLAPSES. THE HUNT IS OVER.`, "l-break");
    endHunt("victory");
    return true;
  }

  // 2. Player Defeated (Defeat)
  if (player.hp <= 0) {
    playSound("player_hurt");
    triggerShake();
    triggerDamageFlash();

    logMsg("You have fainted...", "l-dmg");
    endHunt("defeat");
    return true;
  }

  return false;
}
