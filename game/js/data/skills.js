/* ---------- ARMOR SKILL CATALOG ----------
   A skill activates once the player's total equipped skill points (summed
   across all 5 armor slots) reach `threshold`. Single-tier for now — old-gen
   MH has multiple thresholds per skill (e.g. 10 vs 15 vs 20 for different
   effect strength); easy to extend to an array of tiers later without
   reshaping anything else, since the UI/math below reads `threshold` generically.
*/
export const SKILLS = {
  attackUp: {
    key: "attackUp",
    name: "Attack Up",
    threshold: 10,
    desc: "+10% attack damage while active.",
  },
  guard: {
    key: "guard",
    name: "Guard",
    threshold: 10,
    desc: "Guarding costs 50% less stamina while active.",
  },
  fireRes: {
    key: "fireRes",
    name: "Fire Resistance",
    threshold: 10,
    desc: "Bonus fire resistance while active.",
  },
  iceRes: {
    key: "iceRes",
    name: "Ice Resistance",
    threshold: 10,
    desc: "Bonus ice resistance while active.",
  },
};