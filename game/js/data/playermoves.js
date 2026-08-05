export const MOVESETS = {
  standard: {
    key: "standard",
    moves: [
      {
        key: "light_slash",
        name: "Light Slash",
        desc: "Fast, low-commitment strike. Cheap on stamina.",
        staminaCost: 12,
        damageMult: 0.7,
        critRateMod: 0,
      },
      {
        key: "heavy_overhead",
        name: "Heavy Overhead",
        desc: "Slow, full-weight swing. Costly, but hits hard.",
        staminaCost: 32,
        damageMult: 1.6,
        critRateMod: 0.05,
        canOffset: true,
      },
    ],
  },

  // balancedSwing / "Blade" — no gimmick, no weakness. Same shape as
  // standard almost exactly, just its own key so it can drift later
  // without touching the shared fallback moveset.
  blade: {
    key: "blade",
    moves: [
      {
        key: "blade_quickcut",
        name: "Quick Cut",
        desc: "A clean, fast cut. Reliable and cheap.",
        staminaCost: 12,
        damageMult: 0.75,
        critRateMod: 0,
      },
      {
        key: "blade_fullswing",
        name: "Full Swing",
        desc: "A committed two-handed swing. No frills, just damage.",
        staminaCost: 30,
        damageMult: 1.55,
        critRateMod: 0.05,
        canOffset: true,
      },
    ],
  },

  // slugImpact / "Slugger" — rewards softening a part before the big hit.
  slugger: {
    key: "slugger",
    moves: [
      {
        key: "slugger_jab",
        name: "Blunt Jab",
        desc: "A quick knock — cheap, and chips away at part HP.",
        staminaCost: 14,
        damageMult: 0.65,
        critRateMod: -0.05,
      },
      {
        key: "slugger_haymaker",
        name: "Haymaker",
        desc: "A heavy blow that hits much harder against an already-broken part.",
        staminaCost: 34,
        damageMult: 1.4,
        critRateMod: 0,
        bonusVsBrokenPart: 12, // flat bonus damage if targeted part is already broken
        canOffset: true,
      },
    ],
  },

  // searingEdge / "Cleaver" — built around crits and fire-weak exploitation.
  cleaver: {
    key: "cleaver",
    moves: [
      {
        key: "cleaver_flick",
        name: "Flicker Cut",
        desc: "A precise, high-crit-chance flick of the blade.",
        staminaCost: 14,
        damageMult: 0.6,
        critRateMod: 0.15,
      },
      {
        key: "cleaver_searingarc",
        name: "Searing Arc",
        desc: "A wide burning arc. Deals bonus damage to fire-weak parts, and rewards a clean crit.",
        staminaCost: 28,
        damageMult: 1.3,
        critRateMod: 0.1,
        bonusOnCrit: 8, // flat bonus damage if this hit crits
        bonusVsElementWeak: { element: "fire", threshold: 20, amount: 10 }, // flat bonus if part's fire hitzone >= 20
        canOffset: true,
      },
    ],
  },

  // bracedGuard / "Gauntlet" — close-range, guard-and-punish playstyle.
  // guardStaminaMult (1.5) already lives on the Mechanism itself; these
  // moves lean cheap/fast to match a "trade blows up close" identity.
  gauntlet: {
    key: "gauntlet",
    moves: [
      {
        key: "gauntlet_jab",
        name: "Guard Jab",
        desc: "A tight, low-stamina strike thrown from a guarded stance.",
        staminaCost: 10,
        damageMult: 0.6,
        critRateMod: 0,
      },
      {
        key: "gauntlet_counterpunch",
        name: "Counter Punch",
        desc: "A heavier punch meant to follow up right after guarding.",
        staminaCost: 24,
        damageMult: 1.2,
        critRateMod: 0.1,
        canOffset: true,
      },
    ],
  },

  // overwhelmingForce / "Greatfang" — high variance, chance at a big proc.
  greatfang: {
    key: "greatfang",
    moves: [
      {
        key: "greatfang_swipe",
        name: "Reckless Swipe",
        desc: "An unrefined, wide swing. Middling damage, cheap-ish stamina.",
        staminaCost: 16,
        damageMult: 0.75,
        critRateMod: 0,
      },
      {
        key: "greatfang_overwhelm",
        name: "Overwhelming Force",
        desc: "A huge, risky swing. Usually just hits hard — but sometimes it hits MUCH harder.",
        staminaCost: 36,
        damageMult: 1.5,
        critRateMod: 0,
        procChance: 0.25,
        procBonus: 18, // flat bonus damage on proc
        canOffset: true,
      },
    ],
  },
};

export function movesetFor(weapon) {
  return MOVESETS[weapon.moveset] ?? MOVESETS.standard;
}
