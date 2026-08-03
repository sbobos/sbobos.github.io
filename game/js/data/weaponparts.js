/* ---------- WEAPON PART CATALOG ----------
   A weapon is assembled from one entry each of HEADS / HANDLES / CORES /
   MECHANISMS. Each part owns one axis of the build:

     Head       raw ATK + damage type (cut/blunt) + crit trade-off
     Handle     stamina economy (staminaMult) + a small ATK trade-off
     Core       element type/power + a physical-damage trade-off
     Mechanism  which moveset the weapon uses, plus a guard-stamina passive

   Trade-off fields (critMod, physicalMult, atkMod, staminaMult,
   guardStaminaMult) exist so "better" parts aren't strictly-better upgrades
   — a high-ATK Head can cost crit rate, a strong Core can cost physical
   damage, etc. Retrofit parts below use neutral values (0 / 1.0) so the 5
   current weapons compute identically to their pre-refactor stats —
   nothing about existing balance changes until new parts populate these
   trade-offs.

   Mechanisms no longer carry a `special`/`specialDesc` numeric proc — that
   system is retired. Weapon identity now comes entirely from which
   moveset (js/data/playerMoves.js) the Mechanism grants; any signature
   effect (bonus vs broken parts, crit synergy, etc.) lives directly on a
   specific move in that moveset instead of a hidden global chance.
*/

export const HEADS = {
  hunterEdge: {
    key: "hunterEdge",
    name: "Hunter",
    damageType: "cut",
    atk: 100,
    critMod: 0,
    forgeLevel: 0,
  },
  boarHead: {
    key: "boarHead",
    name: "Boar",
    damageType: "blunt",
    atk: 15,
    critMod: 0,
    recipe: { "Large Skull": 1 },
    goldcoin: 30,
    forgeLevel: 1,
  },
  wyrmHead: {
    key: "wyrmHead",
    name: "Wyrm",
    damageType: "cut",
    atk: 19,
    critMod: 0,
    recipe: { "Wyrm Fang": 3 },
    goldcoin: 50,
    forgeLevel: 1,
  },
  bearHead: {
    key: "bearHead",
    name: "Bear",
    damageType: "blunt",
    atk: 17,
    critMod: 0,
    recipe: { "Bear Claw": 3 },
    goldcoin: 40,
    forgeLevel: 1,
  },
  duneHead: {
    key: "duneHead",
    name: "Dunelord",
    damageType: "cut",
    atk: 26,
    critMod: 0,
    recipe: { "Wyrm Fang": 4, "Sand Pearl": 1 },
    goldcoin: 120,
    forgeLevel: 2,
  },
};

export const HANDLES = {
  basicGrip: {
    key: "basicGrip",
    name: "Basic",
    staminaMult: 1.0,
    atkMod: 0,
    forgeLevel: 0,
  },

  hunterGrip: {
    key: "hunterGrip",
    name: "Hunter",
    staminaMult: 0.85,
    atkMod: 0,
    recipe: {
      "Boar Pelt": 4,
      "Large Bone": 3,
      "Iron Ore": 2,
    },
    goldcoin: 30,
    forgeLevel: 1,
  },

  reinforcedGrip: {
    key: "reinforcedGrip",
    name: "Reinforced",
    staminaMult: 1.15,
    atkMod: 0.25,
    recipe: {
      "Iron Ore": 6,
      "Large Bone": 2,
      "Boar Pelt": 2,
    },
    goldcoin: 40,
    forgeLevel: 1,
  },

  finesseGrip: {
    key: "finesseGrip",
    name: "Finesse",
    staminaMult: 0.9,
    atkMod: 0.1,
    recipe: {
      "Dragon Bone": 1,
      "Iron Ore": 3,
      "Large Bone": 2,
    },
    goldcoin: 35,
    forgeLevel: 1,
  },
};

export const CORES = {
  inertCore: {
    key: "inertCore",
    name: "",
    element: "none",
    elementPower: 0,
    physicalMult: 1.0,
    forgeLevel: 0,
  },
  emberCore: {
    key: "emberCore",
    name: "Ember",
    element: "fire",
    elementPower: 8,
    physicalMult: 1.0,
    recipe: { "Wyrm Scale": 2 },
    goldcoin: 40,
    forgeLevel: 1,
  },
  infernoCore: {
    key: "infernoCore",
    name: "Inferno",
    element: "fire",
    elementPower: 14,
    physicalMult: 1.0,
    recipe: { "Sand Pearl": 1 },
    goldcoin: 100,
    forgeLevel: 2,
  },
};

export const MECHANISMS = {
  balancedSwing: {
    key: "balancedSwing",
    name: "Blade",
    moveset: "blade",
    guardStaminaMult: 1.0,
    forgeLevel: 0,
    flavor: "A balanced kit — no gimmick, no real weakness.",
  },
  slugImpact: {
    key: "slugImpact",
    name: "Slugger",
    moveset: "slugger",
    guardStaminaMult: 1.0,
    recipe: { "Boar Tusk": 2 },
    goldcoin: 50,
    forgeLevel: 1,
    flavor: "Rewards softening a part before committing to the big swing.",
  },
  searingEdge: {
    key: "searingEdge",
    name: "Cleaver",
    moveset: "cleaver",
    guardStaminaMult: 1.0,
    recipe: { "Wyrm Scale": 2 },
    goldcoin: 70,
    forgeLevel: 1,
    flavor: "Built around landing crits and exploiting fire-weak parts.",
  },
  bracedGuard: {
    key: "bracedGuard",
    name: "Gauntlet",
    moveset: "gauntlet",
    guardStaminaMult: 1.5,
    recipe: { "Bear Pelt": 1 },
    goldcoin: 60,
    forgeLevel: 1,
    flavor: "Guarding recovers extra stamina — built to trade blows up close.",
  },
  overwhelmingForce: {
    key: "overwhelmingForce",
    name: "Greatfang",
    moveset: "greatfang",
    guardStaminaMult: 1.0,
    recipe: { "Bear Claw": 2 },
    goldcoin: 140,
    forgeLevel: 2,
    flavor:
      "High variance — every heavy swing has a shot at overwhelming force.",
  },
};
