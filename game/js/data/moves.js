/* ==========================================================================
   MOVE DATABASE

   Every move is pure data.

   The combat system should only read these fields. Avoid checking move.key
   inside combat logic—add a new field here instead whenever possible.

   --------------------------------------------------------------------------
   Fields

   key             Internal identifier.

   name            Display name for UI, logs, hunter notes, etc.

   type            "damage" | "debuff"

   telegraph       Message shown when the monster prepares the move.

   resolveText     Message shown when the move resolves.

   dodgeType       Correct dodge direction.
                   "left" | "right" | "back"

   guardResult     What happens if the player chooses Guard.

                   "block"   = normal guarded hit
                   "stagger" = guard is broken, player becomes staggered
                   "pierce"  = ignores guarding entirely
                   "ignore"  = guard has no effect

   staminaBreak    Set player stamina to 0 after guarding.

   knockback       "none" | "small" | "medium" | "large"

   baseDamage      Raw damage before armor and modifiers. Rank-exclusive
                   moves (see bosses.js `ranks[rank].addMoveKeys`) are
                   further scaled by that rank's damageMult at resolve time
                   — the baseDamage here is the rank-normal value.

   element         "none" | "fire" | "ice"

   status          Optional status effect.
                   null | "burn" | "bleed" | "poison" | ...

   ========================================================================== */

export const MOVES = {
  /* ==================== BOAR ==================== */

  boar_ram: {
    key: "boar_ram",
    name: "Boar Ram",

    type: "damage",
    staminaCost: 25,

    dodgeType: "left",
    guardResult: "block",

    staminaBreak: false,
    knockback: "medium",

    baseDamage: 16,
    element: "none",
    status: null,

    telegraph:
      "The boar lowers its tusked snout and angles sharply to your right, locking eyes with you — dodge LEFT to evade!",

    resolveText:
      "The Boar surges forward like a battering ram! Its tusks spear through your guard and knock you back.",
  },

  boar_headbut: {
    key: "boar_headbut",
    name: "Headbutt",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "block",

    staminaBreak: false,
    knockback: "small",

    baseDamage: 12,
    element: "none",
    status: null,

    telegraph:
      "The Boar pulls its heavy, armored skull back at point-blank range — leap BACKWARDS to clear its reach!",

    resolveText:
      "The head whips its heavy head upward! The massive impact leaves your head ringing!",
  },

  boar_kick: {
    key: "boar_kick",
    name: "Hind Kick",

    type: "damage",
    staminaCost: 25,

    dodgeType: "right",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 10,
    element: "none",
    status: null,

    telegraph:
      "The Boar pivots, sweeping its hindquarters toward your left — step RIGHT immediately!",

    resolveText:
      "The Boar kicks out savagely with its sharp hind hooves, tearing through you!",
  },

  /* ---- Elite (Ram Hog) ---- */
  boar_frenzy: {
    key: "boar_frenzy",
    name: "Frenzied Charge",

    type: "damage",
    staminaCost: 25,

    dodgeType: "left",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 22,
    element: "none",
    status: null,

    telegraph:
      "Raw fury takes hold as it winds up a deadly charge down your right flank — roll LEFT to get out of the way!",

    resolveText:
      "It launches into a frenzied charge, faster and heavier than before, snapping clean through your guard!",
  },

  /* ---- Master (Ram Hog) ---- */
  boar_rampage: {
    key: "boar_rampage",
    name: "Rampage",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "pierce",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 28,
    element: "none",
    status: null,

    telegraph:
      "Bloodshot eyes lock onto you as it kicks up a wide wall of dust — create distance and jump BACK!",

    resolveText:
      "It goes into a full rampage, plowing through everything in its path — guard or not, you take the hit.",
  },

  /* ==================== WYRM ==================== */

  wyrm_bite: {
    key: "wyrm_bite",
    name: "Savage Bite",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "block",

    staminaBreak: false,
    knockback: "small",

    baseDamage: 16,
    element: "none",
    status: null,

    telegraph:
      "The wyrm coils its neck forward, snapping violently — jump BACK to stay clear of the jaws!",

    resolveText: "It snaps forward with a vicious bite!",
  },

  wyrm_tailwhip: {
    key: "wyrm_tailwhip",
    name: "Tail Whip",

    type: "damage",
    staminaCost: 25,

    dodgeType: "left",
    guardResult: "block",

    staminaBreak: false,
    knockback: "medium",

    baseDamage: 18,
    element: "none",
    status: null,

    telegraph:
      "Its tail winds up high to your right, preparing a sweeping strike — dive LEFT!",

    resolveText: "The tail whips through where you were standing!",
  },

  wyrm_spikeslam: {
    key: "wyrm_spikeslam",
    name: "Spike Slam",

    type: "damage",
    staminaCost: 25,

    dodgeType: "right",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 20,
    element: "none",
    status: null,

    telegraph:
      "It rears back, leaning spiked weight heavily toward your left — leap RIGHT before it crashes down!",

    resolveText:
      "It slams its spiked back into the ground like a falling boulder!",
  },

  wyrm_sandcharge: {
    key: "wyrm_sandcharge",
    name: "Sand Charge",

    type: "damage",
    staminaCost: 25,

    dodgeType: "right",
    guardResult: "block",

    staminaBreak: false,
    knockback: "medium",

    baseDamage: 14,
    element: "none",
    status: null,

    telegraph:
      "It digs in its claws and shifts weight to burst toward your left flank — slide RIGHT!",

    resolveText: "It charges through the sand at full speed!",
  },

  wyrm_sandburst: {
    key: "wyrm_sandburst",
    name: "Sand Burst",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 24,
    element: "fire",
    status: "burn",

    telegraph:
      "Superheated sand ignites around its body — jump BACKWARDS to escape the blast radius!",

    resolveText: "The wyrm erupts in a violent explosion of superheated sand!",
  },

  /* ---- Elite (Duneback Wyrm) ---- */
  wyrm_burrowstrike: {
    key: "wyrm_burrowstrike",
    name: "Burrow Strike",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 24,
    element: "none",
    status: null,

    telegraph:
      "Ripples close in beneath your feet as it prepares to burst directly upward — hop BACK right now!",

    resolveText:
      "It erupts from directly underfoot in a spray of sand and fangs!",
  },

  /* ---- Master (Duneback Wyrm) ---- */
  wyrm_sandmaelstrom: {
    key: "wyrm_sandmaelstrom",
    name: "Sand Maelstrom",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "pierce",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 30,
    element: "fire",
    status: "burn",

    telegraph:
      "A glowing vortex expands beneath you — disengage and retreat BACKWARDS immediately!",

    resolveText:
      "The dunes erupt into a screaming maelstrom of superheated sand, engulfing everything nearby!",
  },

  /* ==================== BEAR ==================== */

  bear_paw: {
    key: "bear_paw",
    name: "Heavy Paw",

    type: "damage",
    staminaCost: 25,

    dodgeType: "left",
    guardResult: "block",

    staminaBreak: false,
    knockback: "small",

    baseDamage: 15,
    element: "none",
    status: null,

    telegraph:
      "It cocks back a massive right paw, preparing a heavy horizontal swipe — roll LEFT!",

    resolveText: "A heavy paw swipe crashes toward you!",
  },

  bear_charge: {
    key: "bear_charge",
    name: "Bear Charge",

    type: "damage",
    staminaCost: 25,

    dodgeType: "right",
    guardResult: "block",

    staminaBreak: false,
    knockback: "medium",

    baseDamage: 18,
    element: "none",
    status: null,

    telegraph:
      "It lowers its head and aims straight along your left side — evade RIGHT!",

    resolveText: "It barrels straight toward you!",
  },

  bear_slam: {
    key: "bear_slam",
    name: "Earth Slam",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 20,
    element: "none",
    status: null,

    telegraph:
      "Both massive forelegs rise high above your head — spring BACK before the ground ruptures!",

    resolveText: "Both forelegs slam into the earth with tremendous force!",
  },

  bear_roar: {
    key: "bear_roar",
    name: "War Roar",

    type: "debuff",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "block",

    staminaBreak: false,
    knockback: "none",

    baseDamage: 0,
    element: "none",
    status: "fear",

    telegraph:
      "It rears up on hind legs, inhaling to blast a shockwave forward — step BACK out of range!",

    resolveText:
      "A thunderous roar echoes across the arena, rattling your nerves!",
  },

  bear_furybite: {
    key: "bear_furybite",
    name: "Fury Bite",

    type: "damage",
    staminaCost: 25,

    dodgeType: "left",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 26,
    element: "none",
    status: "bleed",

    telegraph:
      "Frenzied eyes focus on your right shoulder as exposed fangs lunge forward — dodge LEFT!",

    resolveText: "It lunges forward in a desperate, savage bite!",
  },

  /* ---- Elite (Frost Maul Bear) ---- */
  bear_mauling: {
    key: "bear_mauling",
    name: "Mauling Strike",

    type: "damage",
    staminaCost: 25,

    dodgeType: "left",
    guardResult: "stagger",

    staminaBreak: true,
    knockback: "medium",

    baseDamage: 24,
    element: "none",
    status: null,

    telegraph:
      "It rears back, coiling for a vicious two-claw combo targeting your right side — slip LEFT!",

    resolveText:
      "It lashes out with both claws in a brutal one-two mauling strike!",
  },

  /* ---- Master (Frost Maul Bear) ---- */
  bear_avalanche: {
    key: "bear_avalanche",
    name: "Avalanche",

    type: "damage",
    staminaCost: 25,

    dodgeType: "back",
    guardResult: "pierce",

    staminaBreak: true,
    knockback: "large",

    baseDamage: 32,
    element: "none",
    status: null,

    telegraph:
      "It towers over you like a falling mountain — leap BACKWARDS immediately to clear the crush zone!",

    resolveText:
      "It comes down like an avalanche, an unstoppable wall of muscle and claw!",
  },

  /* ---- Small Monster ---- */
  boarling_tackle: {
    key: "boarling_tackle",
    name: "Tackle",
    type: "damage",
    staminaCost: 25,
    dodgeType: "left",
    guardResult: "block",
    staminaBreak: false,
    knockback: "small",
    baseDamage: 8,
    element: "none",
    status: null,
    telegraph: "The boarling squeals and charges down your right side — hop LEFT!",
    resolveText: "The boarling lunges forward, crashing into your legs!",
  },

  sandjackal_nip: {
    key: "sandjackal_nip",
    name: "Quick Nip",
    type: "damage",
    staminaCost: 25,
    dodgeType: "back",
    guardResult: "block",
    staminaBreak: false,
    knockback: "small",
    baseDamage: 12,
    element: "none",
    status: null,
    telegraph: "The jackal snaps low at your feet — jump BACK!",
    resolveText: "The jackal leaps forward and nips at your ankles!",
  },

  icewolf: {
    key: "icewolf_pounce",
    name: "Frost Pounce",
    type: "damage",
    staminaCost: 25,
    dodgeType: "right",
    guardResult: "block",
    staminaBreak: false,
    knockback: "small",
    baseDamage: 14,
    element: "ice",
    status: null,
    telegraph: "The wolf leaps in from your left with frosty claws — dodge RIGHT!",
    resolveText: "The wolf pounces with frost-coated claws!",
  },
};