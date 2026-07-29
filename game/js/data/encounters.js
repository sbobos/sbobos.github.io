export const ENCOUNTERS = {
  iron_mine: {
    type: "mining",

    title: "Iron Deposit",

    text: "A rich vein of ore catches your eye.",

    staminaCost: 8,

    deepStaminaCost: 16,

    deepInjury: {
      chance: 22,
      damage: 8,
    },
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

    deepStaminaCost: 6,

    deepInjury: {
      chance: 30,
      damage: 8,
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

    title: "Wandering Merchant",

    text: "A merchant has set up a small stall along the trail.",

    potionPrice: 15,

    rationsPrice: 10,

    rationsStamina: 20,
  },

  lost_hunter: {
    type: "event",

    event: "lost_hunter",

    title: "Lost Hunter",

    text: "You find a hunter who's been separated from their party, unsure which way to go.",

    escortStaminaCost: 10,

    escortRewardChance: 60,

    escortRewardGold: 25,

    ambushChance: 20,

    ambushMonster: "boarling",

    aloneReward: 10,
  },

  oasis: {
    type: "rest",

    heal: 20,

    stamina: 25,

    fullHeal: 60,

    fullStamina: 70,

    ambushChance: 20,

    ambushMonster: "boarling",
  },

  boss_encounter: {
    type: "boss",

    title: null, // let it be derived from the monster(s) at runtime
    
    text: null,
  },
};