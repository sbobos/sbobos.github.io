export const WEAPONS = {
  basic:      { key:'basic',    name:"Hunter's Blade",    atk:10, damageType:'cut',   element:'none', elementPower:0,  tag:'Starter', tree:'starter', special:'balanced', specialDesc:'Balanced: no extra effects.' },
  boarhammer: { key:'boarhammer', name:"Ram Head Slugger",   atk:15, damageType:'blunt',   element:'none', elementPower:0,  tag:'Boar Forge', recipe:{'Large Skull':3,'Boar Tusk':2}, zenny:80, tree:'boar', unlocksFrom:'basic', special:'impact', specialDesc:'Impact: +4 damage against already broken parts.' },
  wyrmfang:   { key:'wyrmfang', name:"Wyrmfang Cleaver",   atk:19, damageType:'cut',   element:'fire', elementPower:8,  tag:'Wyrm Forge', recipe:{'Wyrm Fang':3,'Wyrm Scale':2}, zenny:120, tree:'wyrm', unlocksFrom:'basic', special:'sear', specialDesc:'Sear: crits and fire-weak targets gain +6 damage.' },
  bearclaw:   { key:'bearclaw', name:"Maul Claw Gauntlet", atk:17, damageType:'blunt', element:'none', elementPower:0,  tag:'Bear Forge', recipe:{'Bear Claw':3,'Bear Pelt':1}, zenny:100, tree:'bear', unlocksFrom:'basic', special:'grip', specialDesc:'Grip: guarding restores extra stamina.' },
  dunelord:   { key:'dunelord', name:"Dunelord Greatfang", atk:26, damageType:'cut',   element:'fire', elementPower:14, tag:'Master Forge', recipe:{'Wyrm Fang':4,'Sand Pearl':1,'Bear Claw':2}, zenny:260, tree:'master', unlocksFrom:'wyrmfang', special:'overwhelm', specialDesc:'Overwhelm: 20% chance to add +8 damage.' }
};

export const ARMORS = {
  basic:     { key:'basic',     name:"Cloth Vest",          slot:'body', def:3,  resist:{fire:0,ice:0},   tag:'Starter' },
  boarhide:  { key:'boarhide',  name:"Boarhide Cloth",      slot:'body', def:6,  resist:{fire:-5,ice:5},  tag:'Boar Forge', recipe:{'Boar Pelt':3,'Large Bone':2}, zenny:80 },
  wyrmscale: { key:'wyrmscale', name:"Wyrmscale Mail",      slot:'body', def:9,  resist:{fire:20,ice:0},  tag:'Wyrm Forge', recipe:{'Wyrm Scale':4,'Wyrm Hide':1}, zenny:110 },
  frosthide: { key:'frosthide', name:"Frosthide Coat",      slot:'body', def:8,  resist:{fire:0,ice:20},  tag:'Bear Forge', recipe:{'Bear Pelt':3,'Bear Fang':2}, zenny:100 },
  bulwark:   { key:'bulwark',   name:"Bulwark of Ironveil", slot:'body', def:15, resist:{fire:10,ice:10}, tag:'Master Forge', recipe:{'Wyrm Hide':2,'Bear Pelt':2,'Sand Pearl':1}, zenny:240 },
  headband:  { key:'headband',  name:"Hunter's Headband",   slot:'head', def:2,  resist:{ice:5}, tag:'Starter', recipe:{'Large Bone':1}, zenny:30 },
  frostcap:  { key:'frostcap',  name:"Frostcap Hood",       slot:'head', def:4,  resist:{ice:15}, tag:'Bear Forge', recipe:{'Bear Fang':1,'Bear Pelt':1}, zenny:60 },
  sandmask:  { key:'sandmask',  name:"Sandmask Visor",      slot:'head', def:3,  resist:{fire:10}, tag:'Wyrm Forge', recipe:{'Wyrm Scale':2,'Wyrm Eye':1}, zenny:70 }
};

export const SHOP_ITEMS = {
  potion: { key:'potion', name:'Potion', price:30, desc:'Adds one potion to your satchel for the next hunt.', effect:(p) => { p.potions += 1; } },
  salve: { key:'salve', name:'Vitality Salve', price:45, desc:'Raises your maximum HP by 10 and restores you to full.', effect:(p) => { p.maxHp += 10; p.hp = p.maxHp; } },
  tonic: { key:'tonic', name:'Stamina Tonic', price:45, desc:'Raises your maximum stamina by 10 and refills it.', effect:(p) => { p.maxStamina += 10; p.stamina = p.maxStamina; } }
};
