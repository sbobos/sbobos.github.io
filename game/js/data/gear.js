import { HEADS, HANDLES, CORES, MECHANISMS } from "./weaponparts.js";

/* ---------- WEAPON DEFINITIONS ----------
   Each entry names which 4 parts it's built from, plus the meta fields
   (recipe/goldcoin/tree/unlocksFrom/forgeLevel) that describe forge
   progression — those stay weapon-level, not part-level, since they're
   about *access* to this combo, not the combo's combat stats.

   forgeLevel is the minimum player.forgeLevel (js/data/forge.js) required
   to craft this item, independent of whether the player can afford its
   own recipe. 0 = starter, needs no forge upgrade.
*/
export const WEAPONS = {
  basic: {
    key: "basic",
    name: "Hunter's Blade",
    headKey: "hunterEdge",
    handleKey: "basicGrip",
    coreKey: "inertCore",
    mechanismKey: "balancedSwing",
    tag: "Starter",
    tree: "starter",
    forgeLevel: 0,
  },
  boarhammer: {
    key: "boarhammer",
    name: "Ram Head Slugger",
    headKey: "boarHead",
    handleKey: "basicGrip",
    coreKey: "inertCore",
    mechanismKey: "slugImpact",
    tag: "Boar Forge",
    recipe: { "Large Skull": 1, "Boar Tusk": 2 },
    goldcoin: 80,
    tree: "boar",
    unlocksFrom: "basic",
    forgeLevel: 1,
  },
};

/**
 * Turns 4 explicit part keys into the flat combat stat shape. Used by both
 * assembleWeapon() (presets) and the custom-crafting path — this is the
 * only place part stats get combined, so presets and custom weapons always
 * compute identically.
 */
export function assembleFromPartKeys({
  headKey,
  handleKey,
  coreKey,
  mechanismKey,
}) {
  const head = HEADS[headKey];
  const handle = HANDLES[handleKey];
  const core = CORES[coreKey];
  const mech = MECHANISMS[mechanismKey];
  if (!head || !handle || !core || !mech) {
    console.error("Unknown part key(s)", {
      headKey,
      handleKey,
      coreKey,
      mechanismKey,
    });
    return null;
  }

  return {
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
  };
}

/** Head + Mechanism, with a Core-element prefix when the Core isn't inert. */
export function generateWeaponName(headKey, coreKey, mechanismKey) {
  const head = HEADS[headKey];
  const core = CORES[coreKey];
  const mech = MECHANISMS[mechanismKey];
  const corePrefix = core.element !== "none" ? `${core.name} ` : "";
  return `${corePrefix}${head.name} ${mech.name}`.trim();
}

export function assembleWeapon(weaponKey) {
  const w = WEAPONS[weaponKey];
  if (!w) {
    console.error(`Unknown weapon: ${weaponKey}`);
    return null;
  }
  const parts = assembleFromPartKeys(w);
  if (!parts) return null;

  return {
    key: w.key,
    name: w.name,
    ...parts,
    tag: w.tag,
    tree: w.tree,
    recipe: w.recipe,
    goldcoin: w.goldcoin,
    unlocksFrom: w.unlocksFrom,
    forgeLevel: w.forgeLevel ?? 0,
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
    forgeLevel: 0,
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
    forgeLevel: 1,
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
    forgeLevel: 1,
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
    forgeLevel: 1,
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
    forgeLevel: 2,
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
    forgeLevel: 0,
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
    forgeLevel: 1,
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
    forgeLevel: 1,
  },

  huntergloves: {
    key: "huntergloves",
    name: "Hunter's Gloves",
    slot: "arms",
    def: 2,
    resist: { fire: 0, ice: 0 },
    tag: "Starter",
    recipe: { "Large Bone": 1 },
    goldcoin: 25,
    skills: {},
    forgeLevel: 0,
  },
  boarbraces: {
    key: "boarbraces",
    name: "Boarhide Braces",
    slot: "arms",
    def: 4,
    resist: { fire: -5, ice: 5 },
    tag: "Boar Forge",
    recipe: { "Boar Pelt": 2, "Large Bone": 1 },
    goldcoin: 55,
    skills: { guard: 2 },
    forgeLevel: 1,
  },
  wyrmgauntlets: {
    key: "wyrmgauntlets",
    name: "Wyrmscale Gauntlets",
    slot: "arms",
    def: 5,
    resist: { fire: 10, ice: 0 },
    tag: "Wyrm Forge",
    recipe: { "Wyrm Scale": 2, "Wyrm Claw": 1 },
    goldcoin: 70,
    skills: { fireRes: 3 },
    forgeLevel: 1,
  },
  frostmitts: {
    key: "frostmitts",
    name: "Frosthide Mitts",
    slot: "arms",
    def: 5,
    resist: { fire: 0, ice: 10 },
    tag: "Bear Forge",
    recipe: { "Bear Pelt": 2, "Bear Fang": 1 },
    goldcoin: 65,
    skills: { iceRes: 3 },
    forgeLevel: 1,
  },
  bulwarkarms: {
    key: "bulwarkarms",
    name: "Bulwark Vambraces",
    slot: "arms",
    def: 8,
    resist: { fire: 5, ice: 5 },
    tag: "Master Forge",
    recipe: { "Wyrm Hide": 1, "Bear Pelt": 1, "Sand Pearl": 1 },
    goldcoin: 140,
    skills: { guard: 3, attackUp: 2 },
    forgeLevel: 2,
  },

  hunterbelt: {
    key: "hunterbelt",
    name: "Hunter's Belt",
    slot: "waist",
    def: 2,
    resist: { fire: 0, ice: 0 },
    tag: "Starter",
    recipe: { "Large Bone": 1 },
    goldcoin: 25,
    skills: {},
    forgeLevel: 0,
  },
  boarcoil: {
    key: "boarcoil",
    name: "Boarhide Coil",
    slot: "waist",
    def: 4,
    resist: { fire: -5, ice: 5 },
    tag: "Boar Forge",
    recipe: { "Boar Pelt": 2, "Large Bone": 1 },
    goldcoin: 55,
    skills: { guard: 2 },
    forgeLevel: 1,
  },
  wyrmcoil: {
    key: "wyrmcoil",
    name: "Wyrmscale Coil",
    slot: "waist",
    def: 5,
    resist: { fire: 10, ice: 0 },
    tag: "Wyrm Forge",
    recipe: { "Wyrm Scale": 2, "Wyrm Hide": 1 },
    goldcoin: 70,
    skills: { fireRes: 3 },
    forgeLevel: 1,
  },
  frostbelt: {
    key: "frostbelt",
    name: "Frosthide Belt",
    slot: "waist",
    def: 5,
    resist: { fire: 0, ice: 10 },
    tag: "Bear Forge",
    recipe: { "Bear Pelt": 2, "Bear Fang": 1 },
    goldcoin: 65,
    skills: { iceRes: 3 },
    forgeLevel: 1,
  },
  bulwarkwaist: {
    key: "bulwarkwaist",
    name: "Bulwark Faulds",
    slot: "waist",
    def: 8,
    resist: { fire: 5, ice: 5 },
    tag: "Master Forge",
    recipe: { "Wyrm Hide": 1, "Bear Pelt": 1, "Sand Pearl": 1 },
    goldcoin: 140,
    skills: { guard: 3, attackUp: 2 },
    forgeLevel: 2,
  },

  hunterboots: {
    key: "hunterboots",
    name: "Hunter's Boots",
    slot: "legs",
    def: 2,
    resist: { fire: 0, ice: 0 },
    tag: "Starter",
    recipe: { "Large Bone": 1 },
    goldcoin: 25,
    skills: {},
    forgeLevel: 0,
  },
  boargreaves: {
    key: "boargreaves",
    name: "Boarhide Greaves",
    slot: "legs",
    def: 4,
    resist: { fire: -5, ice: 5 },
    tag: "Boar Forge",
    recipe: { "Boar Pelt": 2, "Large Bone": 1 },
    goldcoin: 55,
    skills: { guard: 2 },
    forgeLevel: 1,
  },
  wyrmgreaves: {
    key: "wyrmgreaves",
    name: "Wyrmscale Greaves",
    slot: "legs",
    def: 5,
    resist: { fire: 10, ice: 0 },
    tag: "Wyrm Forge",
    recipe: { "Wyrm Scale": 2, "Wyrm Claw": 1 },
    goldcoin: 70,
    skills: { fireRes: 3 },
    forgeLevel: 1,
  },
  frostboots: {
    key: "frostboots",
    name: "Frosthide Boots",
    slot: "legs",
    def: 5,
    resist: { fire: 0, ice: 10 },
    tag: "Bear Forge",
    recipe: { "Bear Pelt": 2, "Bear Fang": 1 },
    goldcoin: 65,
    skills: { iceRes: 3 },
    forgeLevel: 1,
  },
  bulwarklegs: {
    key: "bulwarklegs",
    name: "Bulwark Greaves",
    slot: "legs",
    def: 8,
    resist: { fire: 5, ice: 5 },
    tag: "Master Forge",
    recipe: { "Wyrm Hide": 1, "Bear Pelt": 1, "Sand Pearl": 1 },
    goldcoin: 140,
    skills: { guard: 3, attackUp: 2 },
    forgeLevel: 2,
  },
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
    desc: "Raises your maximum HP by 2 and restores you to full.",
    effect: (p) => {
      p.maxHp += 2;
      p.hp = p.maxHp;
    },
  },
  tonic: {
    key: "tonic",
    name: "Stamina Tonic",
    price: 45,
    desc: "Raises your maximum stamina by 2 and refills it.",
    effect: (p) => {
      p.maxStamina += 2;
      p.stamina = p.maxStamina;
    },
  },
};
