import { HEADS, HANDLES, CORES, MECHANISMS } from "./weaponparts.js";

/* ---------- WEAPON DEFINITIONS ----------
   Each entry names which 4 parts it's built from, plus the meta fields
   (recipe/goldcoin/tree/unlocksFrom) that describe forge progression —
   those stay weapon-level, not part-level, since they're about *access*
   to this combo, not the combo's combat stats.
*/
export const WEAPONS = {
  basic: {
    key: "basic",
    name: "Hunter's Blade",
    headKey: "hunterEdge",
    handleKey: "steadyGrip",
    coreKey: "inertCore",
    mechanismKey: "balancedSwing",
    tag: "Starter",
    tree: "starter",
  },
  boarhammer: {
    key: "boarhammer",
    name: "Ram Head Slugger",
    headKey: "boarHead",
    handleKey: "steadyGrip",
    coreKey: "inertCore",
    mechanismKey: "slugImpact",
    tag: "Boar Forge",
    recipe: { "Large Skull": 3, "Boar Tusk": 2 },
    goldcoin: 80,
    tree: "boar",
    unlocksFrom: "basic",
  },
  wyrmfang: {
    key: "wyrmfang",
    name: "Wyrmfang Cleaver",
    headKey: "wyrmHead",
    handleKey: "steadyGrip",
    coreKey: "emberCore",
    mechanismKey: "searingEdge",
    tag: "Wyrm Forge",
    recipe: { "Wyrm Fang": 3, "Wyrm Scale": 2 },
    goldcoin: 120,
    tree: "wyrm",
    unlocksFrom: "basic",
  },
  bearclaw: {
    key: "bearclaw",
    name: "Maul Claw Gauntlet",
    headKey: "bearHead",
    handleKey: "steadyGrip",
    coreKey: "inertCore",
    mechanismKey: "bracedGuard",
    tag: "Bear Forge",
    recipe: { "Bear Claw": 3, "Bear Pelt": 1 },
    goldcoin: 100,
    tree: "bear",
    unlocksFrom: "basic",
  },
  dunelord: {
    key: "dunelord",
    name: "Dunelord Greatfang",
    headKey: "duneHead",
    handleKey: "steadyGrip",
    coreKey: "infernoCore",
    mechanismKey: "overwhelmingForce",
    tag: "Master Forge",
    recipe: { "Wyrm Fang": 4, "Sand Pearl": 1, "Bear Claw": 2 },
    goldcoin: 260,
    tree: "master",
    unlocksFrom: "wyrmfang",
  },
};

/**
 * Resolves a WEAPONS entry's part keys into the flat stat shape the rest
 * of the codebase reads: atk, damageType, element, elementPower, plus the
 * trade-off fields (critMod, physicalMult, staminaMult) and the moveset
 * key that drives the move-select menu.
 *
 * `special`/`specialDesc` no longer describe a numeric proc — that system
 * (specials.js) is retired. `specialDesc` is kept as a display-only string
 * (the Mechanism's `flavor`) so existing UI code showing "Weapon style: ..."
 * keeps working; the actual signature effects now live on individual moves
 * in js/data/playerMoves.js.
 */
export function assembleWeapon(weaponKey) {
  const w = WEAPONS[weaponKey];
  if (!w) {
    console.error(`Unknown weapon: ${weaponKey}`);
    return null;
  }

  const head = HEADS[w.headKey];
  const handle = HANDLES[w.handleKey];
  const core = CORES[w.coreKey];
  const mech = MECHANISMS[w.mechanismKey];

  return {
    key: w.key,
    name: w.name,
    atk: Math.round(head.atk * (1 + handle.atkMod)),
    damageType: head.damageType,
    critMod: head.critMod,
    element: core.element,
    elementPower: core.elementPower,
    physicalMult: core.physicalMult,
    staminaMult: handle.staminaMult,
    moveset: mech.moveset,
    guardStaminaMult: mech.guardStaminaMult,
    specialDesc: mech.flavor,
    tag: w.tag,
    tree: w.tree,
    recipe: w.recipe,
    goldcoin: w.goldcoin,
    unlocksFrom: w.unlocksFrom,
  };
}

export const ARMORS = {
  basic: {
    key: "basic",
    name: "Cloth Vest",
    slot: "chest",
    def: 3,
    resist: { fire: 0, ice: 0 },
    tag: "Starter",
    skills: {},
  },
  boarhide: {
    key: "boarhide",
    name: "Boarhide Cloth",
    slot: "chest",
    def: 6,
    resist: { fire: -5, ice: 5 },
    tag: "Boar Forge",
    recipe: { "Boar Pelt": 3, "Large Bone": 2 },
    goldcoin: 80,
    skills: { guard: 4 },
  },
  wyrmscale: {
    key: "wyrmscale",
    name: "Wyrmscale Mail",
    slot: "chest",
    def: 9,
    resist: { fire: 20, ice: 0 },
    tag: "Wyrm Forge",
    recipe: { "Wyrm Scale": 4, "Wyrm Hide": 1 },
    goldcoin: 110,
    skills: { fireRes: 6 },
  },
  frosthide: {
    key: "frosthide",
    name: "Frosthide Coat",
    slot: "chest",
    def: 8,
    resist: { fire: 0, ice: 20 },
    tag: "Bear Forge",
    recipe: { "Bear Pelt": 3, "Bear Fang": 2 },
    goldcoin: 100,
    skills: { iceRes: 6 },
  },
  bulwark: {
    key: "bulwark",
    name: "Bulwark of Ironveil",
    slot: "chest",
    def: 15,
    resist: { fire: 10, ice: 10 },
    tag: "Master Forge",
    recipe: { "Wyrm Hide": 2, "Bear Pelt": 2, "Sand Pearl": 1 },
    goldcoin: 240,
    skills: { guard: 6, attackUp: 4 },
  },
  headband: {
    key: "headband",
    name: "Hunter's Headband",
    slot: "head",
    def: 2,
    resist: { ice: 5 },
    tag: "Starter",
    recipe: { "Large Bone": 1 },
    goldcoin: 30,
    skills: {},
  },
  frostcap: {
    key: "frostcap",
    name: "Frostcap Hood",
    slot: "head",
    def: 4,
    resist: { ice: 15 },
    tag: "Bear Forge",
    recipe: { "Bear Fang": 1, "Bear Pelt": 1 },
    goldcoin: 60,
    skills: { iceRes: 4 },
  },
  sandmask: {
    key: "sandmask",
    name: "Sandmask Visor",
    slot: "head",
    def: 3,
    resist: { fire: 10 },
    tag: "Wyrm Forge",
    recipe: { "Wyrm Scale": 2, "Wyrm Eye": 1 },
    goldcoin: 70,
    skills: { fireRes: 4 },
  },
  // arms / waist / legs: no items yet — same "catalog exists, empty until
  // content is added" pattern as HANDLES having only steadyGrip.
};

export const SHOP_ITEMS = {
  potion: {
    key: "potion",
    name: "Potion",
    price: 30,
    desc: "Adds one potion to your satchel for the next hunt.",
    effect: (p) => {
      p.potions += 1;
    },
  },
  salve: {
    key: "salve",
    name: "Vitality Salve",
    price: 45,
    desc: "Raises your maximum HP by 10 and restores you to full.",
    effect: (p) => {
      p.maxHp += 2;
      p.hp = p.maxHp;
    },
  },
  tonic: {
    key: "tonic",
    name: "Stamina Tonic",
    price: 45,
    desc: "Raises your maximum stamina by 10 and refills it.",
    effect: (p) => {
      p.maxStamina += 2;
      p.stamina = p.maxStamina;
    },
  },
};
