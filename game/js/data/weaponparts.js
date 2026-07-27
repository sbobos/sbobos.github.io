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
  hunterEdge: { key:"hunterEdge", name:"Hunter",    damageType:"cut",   atk:10, critMod:0 },
  boarHead:   { key:"boarHead",   name:"Boar",       damageType:"blunt", atk:15,  critMod:0 },
  wyrmHead:   { key:"wyrmHead",   name:"Wyrm",       damageType:"cut",   atk:19,  critMod:0 },
  bearHead:   { key:"bearHead",   name:"Bear",       damageType:"blunt", atk:17,  critMod:0 },
  duneHead:   { key:"duneHead",   name:"Dunelord",   damageType:"cut",   atk:26,  critMod:0 },
};

export const HANDLES = {
  // staminaMult: multiplies a move's staminaCost. atkMod: % adjustment to head atk.
  // Only one handle exists so far — all 5 current weapons use it unmodified.
  steadyGrip: { key:"steadyGrip", name:"Steady", staminaMult:1.0, atkMod:0 },
};

export const CORES = {
  // elementPower is flat added damage of `element` type. physicalMult scales
  // the Head's physical contribution — a real elemental Core should trade
  // some of this away; retrofit cores stay neutral for now.
  inertCore:   { key:"inertCore",   name:"",        element:"none", elementPower:0,  physicalMult:1.0 },
  emberCore:   { key:"emberCore",   name:"Ember",   element:"fire", elementPower:8,  physicalMult:1.0 },
  infernoCore: { key:"infernoCore", name:"Inferno", element:"fire", elementPower:14, physicalMult:1.0 },
};

export const MECHANISMS = {
  // moveset points into js/data/playerMoves.js MOVESETS. guardStaminaMult
  // is the one passive that isn't move-shaped (it modifies the Guard
  // action itself, not an attack), so it stays on the Mechanism directly.
  balancedSwing: {
    key:"balancedSwing", name:"Blade", moveset:"blade",
    guardStaminaMult:1.0,
    flavor:"A balanced kit — no gimmick, no real weakness.",
  },
  slugImpact: {
    key:"slugImpact", name:"Slugger", moveset:"slugger",
    guardStaminaMult:1.0,
    flavor:"Rewards softening a part before committing to the big swing.",
  },
  searingEdge: {
    key:"searingEdge", name:"Cleaver", moveset:"cleaver",
    guardStaminaMult:1.0,
    flavor:"Built around landing crits and exploiting fire-weak parts.",
  },
  bracedGuard: {
    key:"bracedGuard", name:"Gauntlet", moveset:"gauntlet",
    guardStaminaMult:1.5,
    flavor:"Guarding recovers extra stamina — built to trade blows up close.",
  },
  overwhelmingForce: {
    key:"overwhelmingForce", name:"Greatfang", moveset:"greatfang",
    guardStaminaMult:1.0,
    flavor:"High variance — every heavy swing has a shot at overwhelming force.",
  },
};