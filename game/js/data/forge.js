/* ---------- FORGE TIERS ----------
   The forge itself has levels, separate from any individual weapon/armor
   recipe. A weapon/armor's `forgeLevel` field (see gear.js) is the
   minimum player.forgeLevel required to craft it — on top of, not
   instead of, its own material/goldcoin recipe.

   Level 0 needs no recipe (the player already starts there). Level 2's
   recipe deliberately leans on Wyrm Core / Bear Heart — both only drop
   from breaking a belly part that itself requires breaking another part
   first (see bosses.js requiresBroken) — so reaching the Master Forge
   means you've already cleared the game's hardest break-gated content,
   not just stockpiled goldcoin.
*/

export const FORGE_LEVELS = {
  0: {
    level: 0,
    name: "Camp Forge",
    desc: "A traveler's anvil — enough to keep starter gear in shape.",
  },
  1: {
    level: 1,
    name: "Village Forge",
    desc: "A proper forge, capable of shaping tempered parts from your first real hunts.",
    recipe: {
      "Large Bone": 1,
      "Wyrm Scale": 1,
    },
    goldcoin: 150,
  },
  2: {
    level: 2,
    name: "Master's Forge",
    desc: "Reinforced and rune-etched — only the toughest trophies earn a place on this anvil.",
    recipe: { "Wyrm Core": 1, "Bear Heart": 1, "Sand Pearl": 2 },
    goldcoin: 400,
  },
};
