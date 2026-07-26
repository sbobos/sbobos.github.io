/* BOUNTY fields:
   cost              { materialName: amount } required to turn in
   rewardMaterials   { materialName: amount } guaranteed on turn-in (may be empty)
   rewardgoldcoin       flat goldcoin paid on turn-in
   Bounties are repeatable — no completion tracking, just a materials gate,
   so they double as a sink for common drops once you're swimming in them.
*/

export const BOUNTIES = [
  { key:'bounty_boar_pelts', title:'Boarhide Delivery',
    desc:"The tannery keeps running short — bring in boar pelts for tanning.",
    cost:{'Boar Pelt':3}, rewardMaterials:{'Large Bone':2}, rewardgoldcoin:20 },

  { key:'bounty_bone_bundle', title:'Bone Bundle',
    desc:'Spare bones, sorted and bundled for the trade caravans.',
    cost:{'Large Bone':3}, rewardMaterials:{'Beast Stone':1}, rewardgoldcoin:15 },

  { key:'bounty_wyrm_scales', title:'Scalework Order',
    desc:'A smith wants wyrm scale to test a new alloy blend.',
    cost:{'Wyrm Scale':3}, rewardMaterials:{'Sand Pearl':1}, rewardgoldcoin:30 },

  { key:'bounty_wyrm_fangs', title:'Fang Collection',
    desc:'Traveling merchants pay well for matched sets of fangs.',
    cost:{'Wyrm Fang':2}, rewardMaterials:{'Wyrm Eye':1}, rewardgoldcoin:25 },

  { key:'bounty_bear_claws', title:'Claw Count',
    desc:'The quartermaster wants bear claws for grip wraps.',
    cost:{'Bear Claw':2}, rewardMaterials:{'Bear Pelt':1}, rewardgoldcoin:20 },

  { key:'bounty_bear_pelts', title:'Coldproofing Order',
    desc:'Winter gear needs thick pelts — the outfitter is buying in bulk.',
    cost:{'Bear Pelt':3}, rewardMaterials:{}, rewardgoldcoin:45 }
];
