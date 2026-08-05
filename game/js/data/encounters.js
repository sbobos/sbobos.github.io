export const ENCOUNTERS = {
  // Generic Nodes using LOOT_TABLES.[type][arenaKey]
  iron_mine: {
    type: "mining",
    title: "Ore Deposit",
    text: "A rich vein of minerals catches your eye.",
    staminaCost: 8,
    deepStaminaCost: 16,
    deepInjury: { chance: 22, damage: 8 },
  },

  herb_patch: {
    type: "foraging",
    title: "Medicinal Herbs",
    text: "Several useful flora grow beside the path.",
    staminaCost: 2,
    injury: { chance: 15, damage: 5 },
    deepStaminaCost: 6,
    deepInjury: { chance: 30, damage: 8 },
  },

  // Dynamic Battle Node — monster pulled from current Arena
  small_beast: {
    type: "battle",
    title: "Wild Pack",
    text: "A small group of beasts blocks your path.",
  },

  // Events that spawn arena-appropriate ambushes
  lost_hunter: {
    type: "event",
    event: "lost_hunter",
    title: "Lost Hunter",
    text: "You find a hunter separated from their party, unsure which way to go.",
    escortStaminaCost: 10,
    escortRewardChance: 60,
    escortRewardGold: 25,
    ambushChance: 20,
    aloneReward: 10,
  },

  oasis: {
    type: "rest",
    title: "Resting Area",
    text: "You find a peaceful spot by the oasis to rest and recover.",
    heal: 20,
    stamina: 25,
    fullHeal: 60,
    fullStamina: 70,
    ambushChance: 20,
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

  boss_encounter: {
    type: "boss",
    title: null,
    text: null,
  },
};