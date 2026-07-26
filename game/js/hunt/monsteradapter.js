import { SMALL_MONSTERS } from "../data/monsters/smallmonsters.js";

export function smallMonsterToHuntShape(key) {
  const m = SMALL_MONSTERS[key];

  return {
    id: m.id,
    name: m.name,
    icon: m.icon,
    arenaKey: m.arena,
    maxHp: m.hp,
    defaultMoveKeys: m.moveKeys ?? ["basic_attack"], // see note below
    parts: [
      {
        key: "body",
        name: m.name,
        maxHp: m.hp,
        hitzone: { cut: 100, blunt: 100, fire: 100, ice: 100 },
        exposedMultiplier: 1,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 0,
        breakMsg: null,
        rewards: [],
        disablesMoves: [],
      },
    ],
    carveTable: { normal: `smallMonster.${m.lootTable}` },
    goldcoinRange: m.goldcoinRange,
  };
}
