export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function chance(rate) {
  return Math.random() < rate;
}

export function spendStamina(player, amount) {
  if (player.stamina < amount) {
    return false;
  }

  player.stamina -= amount;
  return true;
}

export function recoverStamina(player, amount) {
  player.stamina = clamp(
    player.stamina + amount,
    0,
    player.maxStamina
  );
}

export function findMonsterPart(
    monster,
    key
) {
    return monster.parts.find(
        part => part.key === key
    );
}

export function damageEntity(
    entity,
    amount
) {

    entity.hp = Math.max(
        0,
        entity.hp - amount
    );
}
