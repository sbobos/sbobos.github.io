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
import {
  monsterTelegraphPhase,
  startDodgeTiming,
  stopDodgeTiming,
  getAndStopTiming,
  setTimingTimeoutCallback,
} from "./telegraph.js";
import { endHunt } from "./setup.js";
import { renderHunt } from "../ui/hunt.js";

let isBusy = false;

// Register auto-miss when the timing bar runs out
setTimingTimeoutCallback(() => {
  if (hunt.pendingMove && !isBusy) {
    logMsg("You failed to react in time!", "l-dmg");
    playerAction("timeout_miss");
  }
});

export async function playerAction(actionType, payload = {}) {
  if (hunt.over || isBusy) {
    return;
  }

  isBusy = true;

  try {
    if (player.staggered) {
      stopDodgeTiming();
      await handleStagger();
      return;
    }

    hunt.playerGuardedThisRound = actionType === "guard";

    if (actionType === "flee") {
      stopDodgeTiming();
      await handleFlee();
      return;
    }

    if (hunt.pendingMove) {
      const handled = await handleReaction(actionType, payload);
      if (handled) {
        if (combatFinished()) return;

        recoverStamina(10);
        await nextMonsterTurn();
        return;
      }
    }

    // Direct action during recovery window / player turn
    await performAction(actionType, payload);

    if (combatFinished()) {
      return;
    }

    recoverStamina(10);
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
  if (actionType === "timeout_miss") {
    payload.timingQuality = "MISSED";
    payload.dir = "none";
    resolvePendingMove("dodge", payload);

    playSound("player_hurt");
    triggerShake();
    triggerDamageFlash();

    renderHunt();
    return true;
  }

  // --- ATTACK / COUNTER OFFSET LOGIC ---
  if (actionType === "attack") {
    // Capture the timing quality specifically for the Attack offset window
    const timingQuality = getAndStopTiming("attack");
    payload.timingQuality = timingQuality;

    if (timingQuality === "PERFECT") {
      logMsg(
        "CRITICAL OFFSET ATTACK! You completely break the monster's assault and drain its stamina!",
        "l-good"
      );
      playSound("part_break");

      // Wipe ALL Monster Stamina at once!
      if (hunt.monster) {
        hunt.monster.stamina = 0;
      }
    } else {
      logMsg(
        "You commit to the attack, trading blows as the monster's strike lands!",
        "l-sys"
      );
    }

    doPlayerAttack(payload.partKey, payload.moveKey);

    if (combatFinished()) return true;

    renderHunt();
    await delay(400);

    const hpBefore = player.hp;
    resolvePendingMove("attack", payload);

    if (player.hp < hpBefore) {
      playSound("player_hurt");
      triggerShake();
      triggerDamageFlash();
    }

    if (combatFinished()) return true;

    hunt.recoveryWindow = true;
    renderHunt();
    return true;
  }

  // --- DODGE LOGIC ---
  if (actionType === "dodge") {
    const timingQuality = getAndStopTiming();
    payload.timingQuality = timingQuality;
  } else {
    stopDodgeTiming();
  }

  if (actionType === "item") {
    usePotion();
  }

  if (actionType === "guard") {
    const weapon = currentWeapon();
    recoverStamina(Math.round(15 * (weapon.guardStaminaMult ?? 1)));
  }

  const hpBefore = player.hp;
  resolvePendingMove(actionType, payload);

  if (player.hp < hpBefore) {
    playSound("player_hurt");
    triggerShake();
    triggerDamageFlash();
  }

  if (combatFinished()) return true;

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

  if (combatFinished()) return;

  if (!hunt.recoveryWindow) {
    hunt.recoveryWindow = true;
    logMsg("The monster recoils, giving you a brief opening.", "l-good");
  } else {
    logMsg("You keep the pressure on while the monster is off-balance.", "l-good");
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
  if (hunt.pendingMoveWasJustResolved) return;
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
  stopDodgeTiming();
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

    if (combatFinished()) return;
    renderHunt();
  }

  await nextMonsterTurn();
}

async function nextMonsterTurn() {
  if (combatFinished()) return;

  await delay(400);
  if (combatFinished()) return;

  hunt.pendingMoveWasJustResolved = false;
  monsterTelegraphPhase();

  renderHunt();
  hunt.playerGuardedThisRound = false;

  // 👇 START TIMING BAR INSTANTLY IF MONSTER IS ATTACKING 👇
  if (hunt.pendingMove) {
    await delay(50); // Small DOM paint delay
    const speed = hunt.pendingMove.speedMs || 1500;
    startDodgeTiming(speed);
  }
}

function combatFinished() {
  if (hunt.over) {
    stopDodgeTiming();
    return true;
  }

  if (hunt.monster.hp <= 0) {
    stopDodgeTiming();
    logMsg(`THE ${hunt.monster.name.toUpperCase()} COLLAPSES. THE HUNT IS OVER.`, "l-break");
    endHunt("victory");
    return true;
  }

  if (player.hp <= 0) {
    stopDodgeTiming();
    playSound("player_hurt");
    triggerShake();
    triggerDamageFlash();

    logMsg("You have fainted...", "l-dmg");
    endHunt("defeat");
    return true;
  }

  return false;
}