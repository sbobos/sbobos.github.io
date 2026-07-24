export const ENCOUNTERS = {
  iron_mine: {
    type: "mining",

    title: "Iron Deposit",

    text: "A rich vein of ore catches your eye.",

    staminaCost: 8,
  },

  herb_patch: {
    type: "foraging",

    title: "Medicinal Herbs",

    text: "Several useful herbs grow beside the path.",

    staminaCost: 2,

    injury: {
      chance: 15,
      damage: 5,
    },
  },

  small_boar: {
    type: "battle",

    title: "Boar Pack",

    monster: "boarling",
  },

  merchant: {
    type: "event",

    event: "merchant",
  },

  lost_hunter: {
    type: "event",

    event: "lost_hunter",
  },

  oasis: {
    type: "rest",

    heal: 20,

    stamina: 25,
  },

  boss_encounter: {
    type: "boss",

    title: null, // let it be derived from the monster(s) at runtime
    
    text: null,
  },
};
