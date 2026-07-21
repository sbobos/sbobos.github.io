/* =========================================================================
   CONFIG — everything a monster designer needs to touch lives below.

   MOVE fields:
     key            unique id
     type           'damage' (hurts the player) or 'debuff' (non-hp effect)
     telegraph      shown BEFORE the move lands (this round) — write it so the
                    wording hints which dodge direction reads correctly
     resolveText    shown WHEN the move actually lands
     dodgeType      'left' | 'right' | 'back' — the correct reaction
     blockable      can Guard reduce it? (false = must be dodged, not blocked)
     baseDamage     damage at neutral (non-enraged) power
     element        'none' | 'fire' | 'ice' — used against armor resistance

   PART fields:
     hitzone        {cut, blunt, fire, ice} 0-100ish — how much of an
                    attack's power actually transfers on a hit to this part
     exposedMultiplier  hitzone multiplier once THIS part is broken
                        (>1 = broken part is now a real weak point, not dead weight)
     requiresBroken     key of another part that must break first, or null
                        (thick plating protecting a softer part underneath)
     lockedMultiplier   hitzone multiplier while requiresBroken is unmet
     postBreakImmune    if true, hits here stop damaging monster.hp once broken
                         (the "one-time payload" pattern — use sparingly)
     disablesMoves      move keys removed from the pool once this part breaks
     unlocksMove        a move key added to the pool once this part breaks
========================================================================= */

const MOVES = {
  boar_ram:       { key:'boar_ram', type:'damage', dodgeType:'left', blockable:true, baseDamage:16, element:'none',
    telegraph:"The boar lowers its tusked snout, scraping its hooves against the dirt as it locks its eyes onto you. It's preparing a full-speed charge!",
    resolveText:"The Boar surges forward like a battering ram! Its tusks spear through your guard and knock you back." },
  boar_headbut:   { key:'boar_headbut', type:'damage', dodgeType:'back', blockable:true, baseDamage:12, element:'none',
    telegraph:"The Boar pulls its heavy, armored skull back, snorting aggressively at close range.",
    resolveText:"The head whips its heavy head upward! The massive impact leaves your head ringing!" },
  boar_kick:      { key:'boar_kick', type:'damage', dodgeType:'right', blockable:false, baseDamage:10, element:'none',
    telegraph:"The Boar suddenly pivots away, bucking its hindquarters toward you while glancing back over its shoulder.",
    resolveText:"The Boar kicks out savagely with its sharp hind hooves, tearing through you!" },
  
  wyrm_bite:      { key:'wyrm_bite', type:'damage', dodgeType:'back', blockable:true, baseDamage:16, element:'none',
    telegraph:"The wyrm lowers its head and lunges its jaw forward — better to fall back than meet it head-on.",
    resolveText:"It snaps forward with a vicious bite!" },
  wyrm_tailwhip:  { key:'wyrm_tailwhip', type:'damage', dodgeType:'left', blockable:true, baseDamage:18, element:'none',
    telegraph:"Its tail curls out wide to the side, building for a sweep.",
    resolveText:"The tail whips through where you were standing!" },
  wyrm_spikeslam: { key:'wyrm_spikeslam', type:'damage', dodgeType:'right', blockable:false, baseDamage:20, element:'none',
    telegraph:"It rears up, spiked back arched — no guard will hold under this, better to step clear.",
    resolveText:"It slams its spiked back down like a hammer!" },
  wyrm_sandcharge:{ key:'wyrm_sandcharge', type:'damage', dodgeType:'right', blockable:true, baseDamage:14, element:'none',
    telegraph:"It digs its claws into the sand, coiling to rush you straight on.",
    resolveText:"It charges through the sand at full speed!" },
  wyrm_sandburst: { key:'wyrm_sandburst', type:'damage', dodgeType:'back', blockable:false, baseDamage:24, element:'fire',
    telegraph:"Its cracked belly glows from within — pressure is building fast, give it room.",
    resolveText:"The wyrm's belly erupts in a spray of superheated sand!" },

  bear_paw:       { key:'bear_paw', type:'damage', dodgeType:'left', blockable:true, baseDamage:15, element:'none',
    telegraph:"It raises a massive paw, claws catching the light.",
    resolveText:"A heavy paw swipe crashes toward you!" },
  bear_charge:    { key:'bear_charge', type:'damage', dodgeType:'right', blockable:true, baseDamage:18, element:'none',
    telegraph:"It plants its forelegs and lowers its head, ready to drive forward.",
    resolveText:"It charges in, head down!" },
  bear_slam:      { key:'bear_slam', type:'damage', dodgeType:'back', blockable:false, baseDamage:20, element:'none',
    telegraph:"Both forelegs rise together, poised to slam the ground — get clear, don't stand your ground.",
    resolveText:"It slams both forelegs down with tremendous force!" },
  bear_roar:      { key:'bear_roar', type:'debuff', dodgeType:'back', blockable:true, baseDamage:0, element:'none',
    telegraph:"It rears back on its hind legs, drawing breath for a roar.",
    resolveText:"A thunderous roar shakes the arena, rattling your nerves!" },
  bear_furybite:  { key:'bear_furybite', type:'damage', dodgeType:'left', blockable:false, baseDamage:26, element:'none',
    telegraph:"Wounded and furious, it lunges wildly with bared teeth — there is no pattern to read here, just move.",
    resolveText:"It lunges with reckless, wounded fury!" }
};

const MONSTERS = {

    boar: {
    id:'boar', name:'Ram Hog', icon:'🐖', arenaKey:'dunes',
    flavor:"Agile, agresive, and large sized dune hog. Hostile toward everything it faces.",
    maxHp:160, defaultMoveKeys:['boar_ram','boar_headbut','boar_kick'],
    parts:[
      { key:'head', name:'Head', maxHp:60, hitzone:{cut:20,blunt:60,fire:15,ice:5},
        exposedMultiplier:1.35, requiresBroken:null, postBreakImmune:false,
        breakBonus:22, breakMsg:"The hardened skull shell shattered!",
        rewards:['Boar Tusk','Large Skull','Large Skull'], disablesMoves:['hog_ram'] },
      { key:'body', name:'Body', maxHp:100, hitzone:{cut:45,blunt:40,fire:10,ice:5},
        exposedMultiplier:1.3, requiresBroken:null, postBreakImmune:false,
        breakBonus:26, breakMsg:'Scars and wound visible!',
        rewards:['Boar Pelt','Boar Pelt','Large Bone'], disablesMoves:['wyrm_spikeslam'] },
    ],
    carveTable:['Large Skull','Boar Pelt','Boar Pelt','Large Bone','Beast Stone'],
    zennyRange:[50,100]
  },
    
  wyrm: {
    id:'wyrm', name:'Duneback Wyrm', icon:'🦎', arenaKey:'dunes',
    flavor:"A sand-armored wyrm that stalks the dunes at dusk. Fast, low, and vicious in a scrap.",
    maxHp:320, defaultMoveKeys:['wyrm_bite','wyrm_tailwhip','wyrm_spikeslam','wyrm_sandcharge'],
    parts:[
      { key:'head', name:'Head', maxHp:80, hitzone:{cut:40,blunt:30,fire:15,ice:5},
        exposedMultiplier:1.35, requiresBroken:null, postBreakImmune:false,
        breakBonus:22, breakMsg:"The wyrm's jaw cracks — its bite loses its edge, and the wound stays raw and open.",
        rewards:['Wyrm Fang','Wyrm Fang','Wyrm Eye'], disablesMoves:['wyrm_bite'] },
      { key:'spikes', name:'Back Spikes', maxHp:100, hitzone:{cut:25,blunt:50,fire:10,ice:5},
        exposedMultiplier:1.3, requiresBroken:null, postBreakImmune:false,
        breakBonus:26, breakMsg:'Spikes shatter and rain into the sand!',
        rewards:['Wyrm Spike','Wyrm Spike','Wyrm Scale'], disablesMoves:['wyrm_spikeslam'] },
      { key:'tail', name:'Tail', maxHp:70, hitzone:{cut:45,blunt:25,fire:10,ice:5},
        exposedMultiplier:1.3, requiresBroken:null, postBreakImmune:false,
        breakBonus:16, breakMsg:'The tail drops — its sweeping strikes are gone for good.',
        rewards:['Wyrm Tail','Wyrm Scale'], disablesMoves:['wyrm_tailwhip'] },
      { key:'belly', name:'Belly', maxHp:90, hitzone:{cut:55,blunt:35,fire:10,ice:25},
        exposedMultiplier:1.2, requiresBroken:'spikes', lockedMultiplier:0.3, postBreakImmune:false,
        breakBonus:30, breakMsg:'The belly plating shatters — something glints beneath the wound!',
        rewards:['Wyrm Core'], unlocksMove:'wyrm_sandburst' }
    ],
    carveTable:['Wyrm Scale','Wyrm Scale','Wyrm Fang','Wyrm Hide','Sand Pearl'],
    zennyRange:[90,150]
  },
  bear: {
    id:'bear', name:'Frost Maul Bear', icon:'🐻', arenaKey:'tundra',
    flavor:"A tundra brute built like a landslide. Slow to anger, unstoppable once roused.",
    maxHp:300, defaultMoveKeys:['bear_paw','bear_charge','bear_slam','bear_roar'],
    parts:[
      { key:'head', name:'Head', maxHp:90, hitzone:{cut:35,blunt:45,fire:10,ice:15},
        exposedMultiplier:1.3, requiresBroken:null, postBreakImmune:false,
        breakBonus:24, breakMsg:"A solid hit staggers the bear — it reels, dazed, wound left raw.",
        rewards:['Bear Fang','Bear Fang'], disablesMoves:[] },
      { key:'forelegs', name:'Forelegs', maxHp:110, hitzone:{cut:30,blunt:55,fire:5,ice:10},
        exposedMultiplier:1.3, requiresBroken:null, postBreakImmune:false,
        breakBonus:26, breakMsg:'A foreleg buckles — it can no longer drive a charge.',
        rewards:['Bear Claw','Bear Claw','Bear Pelt'], disablesMoves:['bear_charge'] },
      { key:'hide', name:'Hide', maxHp:90, hitzone:{cut:20,blunt:35,fire:5,ice:35},
        exposedMultiplier:1.25, requiresBroken:null, postBreakImmune:false,
        breakBonus:18, breakMsg:'Thick hide splits open under the blow.',
        rewards:['Bear Pelt','Bear Pelt'], disablesMoves:[] },
      { key:'belly', name:'Belly', maxHp:80, hitzone:{cut:50,blunt:35,fire:5,ice:10},
        exposedMultiplier:1.2, requiresBroken:'hide', lockedMultiplier:0.3, postBreakImmune:true,
        breakBonus:28, breakMsg:"The bear's guard finally breaks — a decisive wound, though little more can be gained from it.",
        rewards:['Bear Heart'], unlocksMove:'bear_furybite' }
    ],
    carveTable:['Bear Pelt','Bear Claw','Bear Fang','Bear Pelt'],
    zennyRange:[80,140]
  }
};

/* Arena hazards fire on a timer: one round of warning, then the effect. */
const ARENAS = {
  dunes: {
    key:'dunes', name:'The Duneback Wastes',
    desc:'Wind-carved dunes stretch to the horizon, heat shimmering off the sand.',
    hazard:{ every:4,
      warnText:"The wind is rising — grit stings the air.",
      triggerText:"A sandstorm gust rips across the arena, blinding your footing!",
      effect(){ hunt.sandstormActive = true; } }
  },
  tundra: {
    key:'tundra', name:'Frostmaul Hollow',
    desc:'A frozen ravine choked with old ice falls and groaning glaciers.',
    hazard:{ every:5,
      warnText:"Ice creaks somewhere overhead — something's coming loose.",
      triggerText:"Chunks of ice crash down across the arena!",
      effect(){
        if (!hunt.playerGuardedThisRound){
          player.hp = Math.max(0, player.hp - 8);
          logMsg('Falling ice clips you for 8 damage.', 'l-dmg');
        } else {
          logMsg('You shelter against your guard as ice shatters around you.', 'l-good');
        }
      } }
  }
};

const WEAPONS = {
  basic:      { key:'basic',    name:"Hunter's Blade",    atk:10, damageType:'cut',   element:'none', elementPower:0,  tag:'Starter', tree:'starter', special:'balanced', specialDesc:'Balanced: no extra effects.' },
  boarhammer: { key:'boarhammer', name:"Ram Head Slugger",   atk:15, damageType:'blunt',   element:'none', elementPower:0,  tag:'Boar Forge', recipe:{'Large Skull':3,'Boar Tusk':2}, zenny:80, tree:'boar', unlocksFrom:'basic', special:'impact', specialDesc:'Impact: +4 damage against already broken parts.' },
  wyrmfang:   { key:'wyrmfang', name:"Wyrmfang Cleaver",   atk:19, damageType:'cut',   element:'fire', elementPower:8,  tag:'Wyrm Forge', recipe:{'Wyrm Fang':3,'Wyrm Scale':2}, zenny:120, tree:'wyrm', unlocksFrom:'basic', special:'sear', specialDesc:'Sear: crits and fire-weak targets gain +6 damage.' },
  bearclaw:   { key:'bearclaw', name:"Maul Claw Gauntlet", atk:17, damageType:'blunt', element:'none', elementPower:0,  tag:'Bear Forge', recipe:{'Bear Claw':3,'Bear Pelt':1}, zenny:100, tree:'bear', unlocksFrom:'basic', special:'grip', specialDesc:'Grip: guarding restores extra stamina.' },
  dunelord:   { key:'dunelord', name:"Dunelord Greatfang", atk:26, damageType:'cut',   element:'fire', elementPower:14, tag:'Master Forge', recipe:{'Wyrm Fang':4,'Sand Pearl':1,'Bear Claw':2}, zenny:260, tree:'master', unlocksFrom:'wyrmfang', special:'overwhelm', specialDesc:'Overwhelm: 20% chance to add +8 damage.' }
};

const ARMORS = {
  basic:     { key:'basic',     name:"Cloth Vest",          slot:'body', def:3,  resist:{fire:0,ice:0},   tag:'Starter' },
  boarhide:  { key:'boarhide',  name:"Boarhide Cloth",      slot:'body', def:6,  resist:{fire:-5,ice:5},  tag:'Boar Forge', recipe:{'Boar Pelt':3,'Large Bone':2}, zenny:80 },
  wyrmscale: { key:'wyrmscale', name:"Wyrmscale Mail",      slot:'body', def:9,  resist:{fire:20,ice:0},  tag:'Wyrm Forge', recipe:{'Wyrm Scale':4,'Wyrm Hide':1}, zenny:110 },
  frosthide: { key:'frosthide', name:"Frosthide Coat",      slot:'body', def:8,  resist:{fire:0,ice:20},  tag:'Bear Forge', recipe:{'Bear Pelt':3,'Bear Fang':2}, zenny:100 },
  bulwark:   { key:'bulwark',   name:"Bulwark of Ironveil", slot:'body', def:15, resist:{fire:10,ice:10}, tag:'Master Forge', recipe:{'Wyrm Hide':2,'Bear Pelt':2,'Sand Pearl':1}, zenny:240 },
  headband:  { key:'headband',  name:"Hunter's Headband",   slot:'head', def:2,  resist:{ice:5}, tag:'Starter', recipe:{'Large Bone':1}, zenny:30 },
  frostcap:  { key:'frostcap',  name:"Frostcap Hood",       slot:'head', def:4,  resist:{ice:15}, tag:'Bear Forge', recipe:{'Bear Fang':1,'Bear Pelt':1}, zenny:60 },
  sandmask:  { key:'sandmask',  name:"Sandmask Visor",      slot:'head', def:3,  resist:{fire:10}, tag:'Wyrm Forge', recipe:{'Wyrm Scale':2,'Wyrm Eye':1}, zenny:70 }
};

const SHOP_ITEMS = {
  potion: { key:'potion', name:'Potion', price:30, desc:'Adds one potion to your satchel for the next hunt.', effect:(p) => { p.potions += 1; } },
  salve: { key:'salve', name:'Vitality Salve', price:45, desc:'Raises your maximum HP by 10 and restores you to full.', effect:(p) => { p.maxHp += 10; p.hp = p.maxHp; } },
  tonic: { key:'tonic', name:'Stamina Tonic', price:45, desc:'Raises your maximum stamina by 10 and refills it.', effect:(p) => { p.maxStamina += 10; p.stamina = p.maxStamina; } }
};

const STORY_MISSIONS = [
  { key:'intro_boar', title:'The Dune Track', monsterId:'boar', chapter:1, description:'Investigate the boar that has been harassing the outer camps.', flavor:'Main objective' },
  { key:'wyrm_salt', title:'The Sand-Scored Trail', monsterId:'wyrm', chapter:2, description:'Follow the wyrm trail into the deeper dunes before it turns the region feral.', flavor:'Main objective' },
  { key:'bear_ice', title:'The Hollow Below', monsterId:'bear', chapter:3, description:'The cold has worsened, and the old bear has begun prowling the ravine.', flavor:'Main objective' }
];

/* ---------- STATE ---------- */

let player = {
  name:'Hunter',
  maxHp:120, hp:120,
  maxStamina:100, stamina:100,
  weapon:'basic',
  armorSlots:{ head:'headband', body:'basic' },
  ownedWeapons:['basic'],
  ownedArmors:['basic','headband'],
  zenny:60,
  potions:3,
  materials:{},
  stats:{ hunts:0, victories:0, fled:0, defeats:0 },
  trophies:{}
};

let story = {
  chapter:1,
  activeMissionKey:'intro_boar',
  completedMissionKeys:[],
  unlockedMissionKeys:['intro_boar']
};

let hunt = null;
let villageTab = 'quests';
let saveStatusMsg = '';

/* ---------- HELPERS ---------- */

function rand(min,max){ return Math.random()*(max-min)+min; }
function randInt(min,max){ return Math.floor(rand(min,max+1)); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function pct(v,max){ return clamp((v/max)*100,0,100); }
function addMat(name,n){ player.materials[name] = (player.materials[name]||0) + n; }
function currentWeapon(){ return WEAPONS[player.weapon]; }
function currentArmor(){
  return {
    head: ARMORS[player.armorSlots?.head] || ARMORS.basic,
    body: ARMORS[player.armorSlots?.body] || ARMORS.basic
  };
}
function getArmorStats(){
  const armor = currentArmor();
  const resist = { fire: (armor.head.resist?.fire || 0) + (armor.body.resist?.fire || 0), ice: (armor.head.resist?.ice || 0) + (armor.body.resist?.ice || 0) };
  return { def: (armor.head.def || 0) + (armor.body.def || 0), resist };
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- SAVE / LOAD (portable code, no browser storage) ---------- */

const SAVE_TAG = 'IRONVEIL1';

function generateSaveCode(){
  try{
    const payload = JSON.stringify(player);
    return SAVE_TAG + ':' + btoa(encodeURIComponent(payload));
  } catch(e){
    return '';
  }
}

function loadSaveCode(code){
  try{
    code = (code||'').trim();
    if (!code.startsWith(SAVE_TAG+':')) throw new Error('bad tag');
    const payload = decodeURIComponent(atob(code.slice(SAVE_TAG.length+1)));
    const loaded = JSON.parse(payload);
    if (!loaded || typeof loaded !== 'object' || !loaded.materials) throw new Error('bad shape');
    loaded.stats = loaded.stats || { hunts:0, victories:0, fled:0, defeats:0 };
    loaded.trophies = loaded.trophies || {};
    loaded.ownedWeapons = loaded.ownedWeapons || ['basic'];
    loaded.ownedArmors = loaded.ownedArmors || ['basic'];
    loaded.armorSlots = loaded.armorSlots || { head:'headband', body:'basic' };
    if (!loaded.armorSlots.head) loaded.armorSlots.head = 'headband';
    if (!loaded.armorSlots.body) loaded.armorSlots.body = 'basic';
    if (!loaded.ownedWeapons.includes(loaded.weapon)) loaded.ownedWeapons.push(loaded.weapon);
    if (!loaded.ownedArmors.includes(loaded.armorSlots.body)) loaded.ownedArmors.push(loaded.armorSlots.body);
    if (!loaded.ownedArmors.includes(loaded.armorSlots.head)) loaded.ownedArmors.push(loaded.armorSlots.head);
    player = loaded;
    return true;
  } catch(e){
    return false;
  }
}

/* ---------- TOPBAR ---------- */

function renderTopbar(){
  document.getElementById('tb-name').textContent = player.name;
  document.getElementById('tb-zenny').textContent = player.zenny;
  document.getElementById('tb-weapon').textContent = currentWeapon().name;
  const armor = currentArmor();
  document.getElementById('tb-armor').textContent = `${armor.head.name} / ${armor.body.name}`;
}

/* ---------- VILLAGE SCREEN ---------- */

function setVillageTab(tab){
  villageTab = tab;
  renderVillage();
}

function renderVillage(){
  document.getElementById('hunt-screen').classList.add('hidden');
  const v = document.getElementById('village-screen');
  v.classList.remove('hidden');

  const tabs = [
    ['quests','Quest Board'],
    ['forge','Forge'],
    ['shop','Shop'],
    ['inventory','Inventory'],
    ['save','Save / Load']
  ];
  const tabBar = `
    <div class="actions" style="grid-template-columns:repeat(5,1fr); margin-bottom:18px;">
      ${tabs.map(([key,label]) => `<button class="${villageTab===key?'primary':''}" onclick="setVillageTab('${key}')">${label}</button>`).join('')}
    </div>
  `;

  let body = '';
  if (villageTab === 'quests') body = renderQuestsTab();
  else if (villageTab === 'forge') body = renderForgeTab();
  else if (villageTab === 'shop') body = renderShopTab();
  else if (villageTab === 'inventory') body = renderInventoryTab();
  else if (villageTab === 'save') body = renderSaveTab();

  v.innerHTML = tabBar + body;
  renderTopbar();
}

function getActiveStoryMission(){
  return STORY_MISSIONS.find(m => m.key === story.activeMissionKey) || STORY_MISSIONS[0];
}

function getQuestBoardEntries(){
  const activeMission = getActiveStoryMission();
  const entries = [];

  entries.push({
    type:'main',
    mission: activeMission,
    monster: MONSTERS[activeMission.monsterId],
    label:'Main Objective'
  });

  const sidePool = Object.entries(MONSTERS)
    .filter(([id]) => id !== activeMission.monsterId)
    .filter(([id]) => {
      const mission = STORY_MISSIONS.find(item => item.monsterId === id);
      return !mission || mission.chapter <= story.chapter;
    })
    .map(([id, monster]) => ({ id, monster }));

  const shuffled = [...sidePool].sort(() => Math.random() - 0.5);
  const limit = Math.min(2, shuffled.length);
  for (let i = 0; i < limit; i += 1) {
    const { id, monster } = shuffled[i];
    entries.push({
      type:'side',
      mission: STORY_MISSIONS.find(item => item.monsterId === id) || null,
      monster,
      label:'Side Hunt'
    });
  }

  return entries;
}

function renderQuestsTab(){
  const activeMission = getActiveStoryMission();
  const questCards = getQuestBoardEntries().map(entry => {
    const monster = entry.monster;
    const mission = entry.mission;
    const actionLabel = entry.type === 'main' ? 'Take assignment' : 'Accept hunt';
    const subtitle = entry.type === 'main'
      ? `${activeMission.description}`
      : (mission ? mission.description : 'A fresh lead has surfaced nearby.');
    return `
      <div class="quest-card">
        <div><span class="qicon">${monster.icon}</span><span class="qname">${monster.name}</span></div>
        <div class="qflavor">${monster.flavor}</div>
        <div class="qarena">Territory: ${ARENAS[monster.arenaKey].name}</div>
        <div class="story-pill">${entry.label}</div>
        <div class="story-subtitle">${subtitle}</div>
        <button class="primary wide" onclick="startHunt('${monster.id}', '${mission ? mission.key : ''}')">${actionLabel}</button>
      </div>
    `;
  }).join('');

  return `
    <div class="panel">
      <h2>Quest Board</h2>
      <p class="section-copy">Your current assignment is the core of the story. The rest of the board shifts as the region opens up.</p>
      <div class="story-banner">
        <div class="story-title">Story progress</div>
        <div class="story-copy">Chapter ${story.chapter} · ${activeMission.title}</div>
        <div class="story-copy">${activeMission.description}</div>
      </div>
      <div class="quest-grid">${questCards}</div>
    </div>
  `;
}

function renderForgeTab(){
  const weaponCards = Object.values(WEAPONS).map(item => renderCraftCard(item, true)).join('');
  const armorCards = Object.values(ARMORS).map(item => renderCraftCard(item, false)).join('');
  const current = currentWeapon();
  const treeSummary = `
    <div class="stat-row">
      <div class="stat-chip">Weapon: ${current.name}</div>
      <div class="stat-chip">Head: ${currentArmor().head.name}</div>
      <div class="stat-chip">Body: ${currentArmor().body.name}</div>
      <div class="stat-chip">Style: ${current.specialDesc}</div>
    </div>
    <div class="tree-panel">
      <div class="tree-title">Weapon tree</div>
      <div class="tree-copy">The first branch is always available. Later paths open after you prove yourself with their predecessor.</div>
      <div class="tree-list">
        ${Object.values(WEAPONS).filter(item => item.tree === 'starter' || item.tree === 'boar' || item.tree === 'wyrm' || item.tree === 'bear' || item.tree === 'master').map(item => {
          const unlocked = item.key === 'basic' || player.ownedWeapons.includes(item.unlocksFrom || item.key) || player.ownedWeapons.includes(item.key);
          const active = player.weapon === item.key;
          return `<div class="tree-node ${active ? 'active' : ''} ${unlocked ? 'unlocked' : ''}">${item.name}${active ? ' · Equipped' : ''}</div>`;
        }).join('')}
      </div>
    </div>
  `;
  return `
    <div class="panel">
      <h2>Forge</h2>
      <p class="section-copy">Craft reliable tools and armor from the materials you carve from each hunt. Your loadout is the real progression here.</p>
      ${treeSummary}
    </div>
    <div class="panel">
      <h2>Weapons</h2>
      <div class="forge-grid">${weaponCards}</div>
    </div>
    <div class="panel">
      <h2>Armor</h2>
      <div class="forge-grid">${armorCards}</div>
    </div>
  `;
}

function renderShopTab(){
  const cards = Object.values(SHOP_ITEMS).map(item => `
    <div class="shop-card">
      <div class="shop-title">${item.name}</div>
      <div class="shop-desc">${item.desc}</div>
      <div class="shop-actions">
        <span>${item.price} zenny</span>
        <button ${player.zenny < item.price ? 'disabled' : ''} onclick="buyShopItem('${item.key}')">Buy</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="panel">
      <h2>Hunter's Shop</h2>
      <p class="section-copy">Camp supplies and small upgrades keep your hunts alive when the terrain turns hostile.</p>
      <div class="shop-grid">${cards}</div>
    </div>
  `;
}

function buyShopItem(key){
  const item = SHOP_ITEMS[key];
  if (!item || player.zenny < item.price) return;
  player.zenny -= item.price;
  item.effect(player);
  renderVillage();
}

function renderInventoryTab(){
  const weaponCards = player.ownedWeapons.map(key => {
    const item = WEAPONS[key];
    const equipped = player.weapon === key;
    return `
      <div class="inventory-card">
        <div class="shop-title">${item.name}</div>
        <div class="shop-desc">ATK ${item.atk} · ${item.damageType}${item.element !== 'none' ? ' · +' + item.elementPower + ' ' + item.element : ''}</div>
        <div class="shop-actions">
          <span>${equipped ? 'Equipped' : 'Owned'}</span>
          <button ${equipped ? 'disabled' : ''} onclick="equipOwnedItem('${item.key}', true)">${equipped ? 'Ready' : 'Equip'}</button>
        </div>
      </div>
    `;
  }).join('');

  const armorCards = player.ownedArmors.map(key => {
    const item = ARMORS[key];
    const equipped = player.armorSlots[item.slot] === key;
    return `
      <div class="inventory-card">
        <div class="shop-title">${item.name}</div>
        <div class="shop-desc">DEF ${item.def}${(item.resist.fire || item.resist.ice) ? ' · resist ' + Object.entries(item.resist).filter(([,v]) => v > 0).map(([k,v]) => k + ' ' + v + '%').join(', ') : ''}</div>
        <div class="shop-actions">
          <span>${equipped ? 'Equipped' : 'Owned'}</span>
          <button ${equipped ? 'disabled' : ''} onclick="equipOwnedItem('${item.key}', false)">${equipped ? 'Ready' : 'Equip'}</button>
        </div>
      </div>
    `;
  }).join('');

  const materialEntries = Object.entries(player.materials).filter(([,n]) => n > 0);
  const materialHtml = materialEntries.length
    ? `<div class="inv-grid">${materialEntries.map(([name,count]) => `<div class="inv-item"><span>${name}</span><span class="n">x${count}</span></div>`).join('')}</div>`
    : `<div class="inv-empty">No materials yet — every hunt adds more.</div>`;

  const trophyEntries = Object.entries(player.trophies);
  const trophyHtml = trophyEntries.length
    ? `<div class="inv-grid">${trophyEntries.map(([name,count]) => `<div class="inv-item"><span>${name}</span><span class="n">x${count}</span></div>`).join('')}</div>`
    : `<div class="inv-empty">No trophies collected yet.</div>`;

  return `
    <div class="panel">
      <h2>Inventory</h2>
      <p class="section-copy">Track your gear, resources, and the trophies that mark your path across the wilds.</p>
      <div class="inventory-grid">
        <div class="inventory-card wide-card">
          <div class="shop-title">Supplies</div>
          <div class="shop-desc">Potions: ${player.potions} · HP: ${player.hp}/${player.maxHp} · Stamina: ${player.stamina}/${player.maxStamina}</div>
        </div>
        <div class="inventory-card wide-card">
          <div class="shop-title">Equipment</div>
          <div class="shop-desc">Weapon: ${currentWeapon().name} · Head: ${currentArmor().head.name} · Body: ${currentArmor().body.name}</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <h2>Owned Weapons</h2>
      <div class="shop-grid">${weaponCards || '<div class="inv-empty">No weapons unlocked yet.</div>'}</div>
    </div>
    <div class="panel">
      <h2>Owned Armor</h2>
      <div class="shop-grid">${armorCards || '<div class="inv-empty">No armor unlocked yet.</div>'}</div>
    </div>
    <div class="panel">
      <h2>Materials</h2>
      ${materialHtml}
    </div>
    <div class="panel">
      <h2>Trophies</h2>
      ${trophyHtml}
    </div>
  `;
}

function equipOwnedItem(key, isWeapon){
  if (isWeapon){
    if (player.ownedWeapons.includes(key)) player.weapon = key;
  } else if (player.ownedArmors.includes(key)) {
    const item = ARMORS[key];
    if (item) player.armorSlots[item.slot] = key;
  }
  renderVillage();
}

function renderCraftCard(item, isWeapon){
  const owned = isWeapon ? player.ownedWeapons.includes(item.key) : player.ownedArmors.includes(item.key);
  const equipped = isWeapon ? player.weapon === item.key : player.armorSlots[item.slot] === item.key;
  const canUnlock = isWeapon ? (!item.unlocksFrom || player.ownedWeapons.includes(item.unlocksFrom) || player.weapon === item.unlocksFrom) : true;
  const currentItem = isWeapon ? currentWeapon() : (item.slot === 'head' ? currentArmor().head : currentArmor().body);
  const compareText = isWeapon
    ? `vs current: ${item.atk - currentItem.atk >= 0 ? '+' : ''}${item.atk - currentItem.atk} ATK`
    : `vs current: ${item.def - currentItem.def >= 0 ? '+' : ''}${item.def - currentItem.def} DEF`;

  let reqRows = '';
  let allOk = true;
  if (!owned && item.recipe){
    const zennyOk = player.zenny >= item.zenny;
    allOk = zennyOk && Object.entries(item.recipe).every(([mat,need]) => (player.materials[mat]||0) >= need);
    reqRows = `
      <ul class="req-list">
        ${Object.entries(item.recipe).map(([mat,need]) => {
          const have = player.materials[mat] || 0;
          const ok = have >= need;
          return `<li class="${ok?'ok':'bad'}"><span>${mat}</span><span>${have}/${need}</span></li>`;
        }).join('')}
        <li class="${zennyOk?'ok':'bad'}"><span>Zenny</span><span>${player.zenny}/${item.zenny}</span></li>
      </ul>
    `;
  }

  let btnLabel = 'Craft & equip';
  if (equipped) btnLabel = 'Equipped';
  else if (owned) btnLabel = 'Equip';
  const unlockHint = isWeapon && item.unlocksFrom && !canUnlock ? `<div class="tree-copy">Requires ${WEAPONS[item.unlocksFrom].name}</div>` : '';

  return `
    <div class="craft-card">
      <div class="ctag">${item.tag}${owned && !equipped ? ' · Owned' : ''}</div>
      <div class="cname">${item.name}</div>
      <div class="cstat">
        ${isWeapon ? 'ATK '+item.atk+(item.element!=='none' ? ' · +'+item.elementPower+' '+item.element : '') : 'DEF '+item.def+(item.resist && (item.resist.fire||item.resist.ice) ? ' · Resist '+Object.entries(item.resist).filter(([,v])=>v>0).map(([k,v])=>k+' '+v+'%').join(', ') : '')}
        ${!owned && item.recipe ? ' · '+item.zenny+'z' : ''}
      </div>
      <div class="compare-text">${equipped ? 'Current setup' : compareText}</div>
      ${isWeapon ? `<div class="weapon-style">${item.specialDesc}</div>` : ''}
      ${reqRows}
      ${unlockHint}
      <button ${(!owned && !allOk)?'disabled':''} ${equipped?'disabled':''} ${isWeapon && item.unlocksFrom && !canUnlock ? 'disabled' : ''} onclick="craftItem('${item.key}', ${isWeapon})">
        ${btnLabel}
      </button>
    </div>
  `;
}

function craftItem(key, isWeapon){
  const item = isWeapon ? WEAPONS[key] : ARMORS[key];
  if (!item) return;
  if (isWeapon && item.unlocksFrom && !player.ownedWeapons.includes(item.unlocksFrom)) return;
  const ownedList = isWeapon ? player.ownedWeapons : player.ownedArmors;

  if (!ownedList.includes(key)){
    if (!item.recipe) return;
    const canAfford = player.zenny >= item.zenny &&
      Object.entries(item.recipe).every(([mat,need]) => (player.materials[mat]||0) >= need);
    if (!canAfford) return;
    player.zenny -= item.zenny;
    Object.entries(item.recipe).forEach(([mat,need]) => addMat(mat, -need));
    ownedList.push(key);
  }
  if (isWeapon) player.weapon = key; else {
    const slot = item.slot || 'body';
    player.armorSlots[slot] = key;
  }
  renderVillage();
}

function renderStatusTab(){
  const w = currentWeapon();
  const armor = currentArmor();
  const matEntries = Object.entries(player.materials).filter(([,n]) => n > 0);
  const invHtml = matEntries.length
    ? `<div class="inv-grid">${matEntries.map(([n,c]) => `<div class="inv-item"><span>${n}</span><span class="n">x${c}</span></div>`).join('')}</div>`
    : `<div class="inv-empty">No materials yet — go carve something.</div>`;

  const s = player.stats || { hunts:0, victories:0, fled:0, defeats:0 };

  return `
    <div class="panel">
      <h2>Hunter</h2>
      <div class="equip-row">
        <div>Max HP: <b>${player.maxHp}</b></div>
        <div>Max Stamina: <b>${player.maxStamina}</b></div>
        <div>Zenny: <b>${player.zenny}</b></div>
        <div>Potions: <b>${player.potions}</b></div>
      </div>
    </div>
    <div class="panel">
      <h2>Equipped Gear</h2>
      <div class="equip-row" style="flex-direction:column; gap:6px;">
        <div>Weapon: <b>${w.name}</b> — ATK ${w.atk}, ${w.damageType}${w.element!=='none' ? `, +${w.elementPower} ${w.element}` : ''}</div>
        <div>Head: <b>${armor.head.name}</b> — DEF ${armor.head.def}${(armor.head.resist.fire||armor.head.resist.ice) ? ', resist ' + Object.entries(armor.head.resist).filter(([,v])=>v>0).map(([k,v])=>k+' '+v+'%').join(', ') : ''}</div>
        <div>Body: <b>${armor.body.name}</b> — DEF ${armor.body.def}${(armor.body.resist.fire||armor.body.resist.ice) ? ', resist ' + Object.entries(armor.body.resist).filter(([,v])=>v>0).map(([k,v])=>k+' '+v+'%').join(', ') : ''}</div>
      </div>
    </div>
    <div class="panel">
      <h2>Hunt Log</h2>
      <div class="equip-row">
        <div>Hunts: <b>${s.hunts}</b></div>
        <div>Victories: <b>${s.victories}</b></div>
        <div>Fled: <b>${s.fled}</b></div>
        <div>Defeats: <b>${s.defeats}</b></div>
      </div>
    </div>
    <div class="panel">
      <h2>Materials</h2>
      ${invHtml}
    </div>
  `;
}

function renderSaveTab(){
  return `
    <div class="panel">
      <h2>Save game</h2>
      <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">
        Generates a portable save code (your gear, materials, zenny, and stats). Copy it somewhere safe —
        pasting it back below restores that exact state. No browser storage is used, so this works the same
        whether you're playing here or from a saved copy of the file.
      </p>
      <button class="primary" onclick="doGenerateSave()">Generate save code</button>
      <textarea id="save-code-box" readonly rows="4" style="width:100%; margin-top:10px; font-family:var(--font-mono); font-size:11px; background:#0d1210; color:var(--text); border:1px solid var(--border); border-radius:4px; padding:8px;" placeholder="Your save code will appear here."></textarea>
      <div id="save-status" style="font-size:11px; color:var(--moss); margin-top:6px; min-height:14px;"></div>
    </div>
    <div class="panel">
      <h2>Load game</h2>
      <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">Paste a save code below and load it.</p>
      <textarea id="load-code-box" rows="4" style="width:100%; font-family:var(--font-mono); font-size:11px; background:#0d1210; color:var(--text); border:1px solid var(--border); border-radius:4px; padding:8px;" placeholder="Paste your IRONVEIL1:... code here"></textarea>
      <button class="primary" style="margin-top:10px;" onclick="doLoadSave()">Load save code</button>
      <div id="load-status" style="font-size:11px; margin-top:6px; min-height:14px;"></div>
    </div>
    <div class="panel">
      <h2>New game</h2>
      <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">Wipes zenny, gear, and materials back to a fresh Hunter's Blade and Cloth Vest.</p>
      <button onclick="doNewGame()">Start a new hunter</button>
    </div>
  `;
}

function doGenerateSave(){
  const code = generateSaveCode();
  const box = document.getElementById('save-code-box');
  const status = document.getElementById('save-status');
  if (!code){
    status.textContent = 'Could not generate a save code.';
    status.style.color = 'var(--blood)';
    return;
  }
  box.value = code;
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(code).then(() => {
      status.textContent = 'Copied to clipboard.';
      status.style.color = 'var(--moss)';
    }).catch(() => {
      status.textContent = 'Code generated — copy it manually from the box above.';
      status.style.color = 'var(--moss)';
    });
  } else {
    box.select();
    status.textContent = 'Code generated — copy it manually from the box above.';
    status.style.color = 'var(--moss)';
  }
}

function doLoadSave(){
  const code = document.getElementById('load-code-box').value;
  const status = document.getElementById('load-status');
  const ok = loadSaveCode(code);
  if (ok){
    status.textContent = 'Save loaded.';
    status.style.color = 'var(--moss)';
    renderVillage();
  } else {
    status.textContent = "That code didn't load — check you copied it in full.";
    status.style.color = 'var(--blood)';
  }
}

function doNewGame(){
  player = {
    name:'Hunter', maxHp:120, hp:120, maxStamina:100, stamina:100,
    weapon:'basic', armorSlots:{ head:'headband', body:'basic' }, ownedWeapons:['basic'], ownedArmors:['basic','headband'],
    zenny:60, potions:3, materials:{},
    stats:{ hunts:0, victories:0, fled:0, defeats:0 }, trophies:{}
  };
  story = {
    chapter:1,
    activeMissionKey:'intro_boar',
    completedMissionKeys:[],
    unlockedMissionKeys:['intro_boar']
  };
  renderVillage();
}

/* ---------- HUNT SETUP ---------- */

function startHunt(monsterId, missionKey){
  const template = MONSTERS[monsterId];
  const monster = JSON.parse(JSON.stringify(template));
  monster.hp = monster.maxHp;
  monster.enraged = false;
  monster.parts.forEach(p => { p.hp = p.maxHp; p.broken = false; });

  hunt = { monster, pendingMove:null, turnCount:0, sandstormActive:false, playerGuardedThisRound:false, recoveryWindow:false, log:[], over:false, missionKey: missionKey || null };
  player.hp = player.maxHp;
  player.stamina = player.maxStamina;

  const arena = ARENAS[monster.arenaKey];
  logMsg(`You track the ${monster.name} into ${arena.name}. ${arena.desc}`, 'l-sys');
  renderHunt();
}

function endHunt(result){
  hunt.over = true;
  let rewardsHtml = '';

  player.stats.hunts += 1;
  if (hunt.missionKey){
    const mission = STORY_MISSIONS.find(item => item.key === hunt.missionKey);
    if (mission && result === 'victory' && !story.completedMissionKeys.includes(hunt.missionKey)){
      story.completedMissionKeys.push(hunt.missionKey);
      const nextMission = STORY_MISSIONS.find(item => item.chapter === mission.chapter + 1);
      if (nextMission){
        story.unlockedMissionKeys.push(nextMission.key);
        story.activeMissionKey = nextMission.key;
        story.chapter = Math.max(story.chapter, nextMission.chapter);
      }
    }
  }
  if (result === 'victory') player.stats.victories += 1;
  else if (result === 'flee') player.stats.fled += 1;
  else if (result === 'defeat') player.stats.defeats += 1;

  if (result === 'victory'){
    player.trophies[hunt.monster.id] = (player.trophies[hunt.monster.id]||0) + 1;
    const loot = {};
    hunt.monster.parts.forEach(p => {
      if (p.broken){
        const pick = p.rewards[randInt(0, p.rewards.length-1)];
        loot[pick] = (loot[pick]||0) + 1;
      }
    });
    for (let i=0;i<3;i++){
      const pick = hunt.monster.carveTable[randInt(0, hunt.monster.carveTable.length-1)];
      loot[pick] = (loot[pick]||0) + 1;
    }
    const zennyGain = randInt(hunt.monster.zennyRange[0], hunt.monster.zennyRange[1]);
    Object.entries(loot).forEach(([n,c]) => addMat(n,c));
    player.zenny += zennyGain;

    rewardsHtml = `
      <h3>Hunt successful</h3>
      <p style="font-size:13px;color:var(--text-dim);">The ${hunt.monster.name} has been felled. You carve what you can before it's claimed by the terrain.</p>
      <div class="loot-grid">
        ${Object.entries(loot).map(([n,c]) => `<div class="loot-item">${n} <span style="color:var(--gold);float:right;">x${c}</span></div>`).join('')}
        <div class="loot-item">Zenny <span style="color:var(--gold);float:right;">+${zennyGain}</span></div>
      </div>
    `;
  } else if (result === 'defeat'){
    rewardsHtml = `
      <h3>You were carried back to camp</h3>
      <p style="font-size:13px;color:var(--text-dim);">The ${hunt.monster.name} proved too much this time. No materials recovered — rest up and try again.</p>
    `;
  } else {
    rewardsHtml = `
      <h3>You withdrew from the hunt</h3>
      <p style="font-size:13px;color:var(--text-dim);">Sometimes the wiser hunter lives to track another day.</p>
    `;
  }

  player.hp = player.maxHp;
  player.stamina = player.maxStamina;

  const h = document.getElementById('hunt-screen');
  h.innerHTML += `<div class="overlay">${rewardsHtml}<button class="primary" style="margin-top:10px;" onclick="renderVillage()">Return to camp</button></div>`;
}

/* ---------- LOG ---------- */

function logMsg(text, cls){
  hunt.log.push({text, cls: cls || 'l-hit'});
  renderLog();
}

function renderLog(){
  const el = document.getElementById('hunt-log');
  if (!el) return;
  el.innerHTML = hunt.log.map(l => `<div class="${l.cls}">${escapeHtml(l.text)}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

/* ---------- PART / HITZONE HELPERS ---------- */

function partBrokenMap(m){
  const map = {};
  m.parts.forEach(p => { map[p.key] = p.broken; });
  return map;
}

function hitzoneMultiplier(part){
  let mult = 1;
  if (part.requiresBroken && !part.broken){
    const prereq = hunt.monster.parts.find(p => p.key === part.requiresBroken);
    if (!prereq || !prereq.broken) mult *= part.lockedMultiplier;
  }
  if (part.broken) mult *= part.exposedMultiplier;
  return mult;
}

function headBroken(m){ const p = m.parts.find(p => p.key === 'head'); return p && p.broken; }
function tailBroken(m){ const p = m.parts.find(p => p.key === 'tail'); return p && p.broken; }

function hitzoneHints(part){
  const labels = [];
  const physType = part.hitzone.cut >= part.hitzone.blunt ? 'Cut' : 'Blunt';
  const physVal = Math.max(part.hitzone.cut, part.hitzone.blunt);
  if (physVal >= 45) labels.push('Weak: '+physType);
  if (part.hitzone.fire >= 20) labels.push('Weak: Fire');
  if (part.hitzone.ice >= 20) labels.push('Weak: Ice');
  return labels;
}

function availableMoves(m){
  const active = new Set(m.defaultMoveKeys);
  m.parts.forEach(p => {
    if (p.broken){
      (p.disablesMoves||[]).forEach(k => active.delete(k));
      if (p.unlocksMove) active.add(p.unlocksMove);
    }
  });
  return [...active].map(k => MOVES[k]).filter(Boolean);
}

function pickMove(pool, enraged){
  let candidates = pool;
  if (enraged){
    const dmgMoves = pool.filter(mv => mv.type !== 'debuff');
    if (dmgMoves.length && Math.random() < 0.75) candidates = dmgMoves;
  }
  return candidates[randInt(0, candidates.length-1)];
}

/* ---------- PLAYER ACTIONS ---------- */

function playerAction(actionType, payload){
  if (hunt.over) return;
  payload = payload || {};
  hunt.playerGuardedThisRound = (actionType === 'guard');

  if (actionType === 'flee'){
    handleFlee();
    return;
  }

  if (hunt.pendingMove){
    if (actionType === 'attack'){
      logMsg('You seize the opening and strike before the monster can complete its move!', 'l-good');
      doPlayerAttack(payload.partKey);
      hunt.pendingMove = null;
      hunt.sandstormActive = false;
      hunt.pendingMoveWasJustResolved = false;
      if (hunt.over) return;
      if (player.hp <= 0){ endHunt('defeat'); return; }
      hunt.recoveryWindow = true;
      renderHunt();
      return;
    }
    if (!['dodge','guard'].includes(actionType)){
      logMsg('The monster is already committing to its attack — react now!', 'l-sys');
      renderHunt();
      return;
    }
    resolvePendingMove(actionType, payload);
    if (player.hp <= 0){ endHunt('defeat'); return; }
  }

  if (actionType === 'attack'){
    doPlayerAttack(payload.partKey);
    if (hunt.over) return;
    if (player.hp <= 0){ endHunt('defeat'); return; }

    if (!hunt.recoveryWindow){
      hunt.recoveryWindow = true;
      logMsg('The monster recoils from the hit, giving you a brief opening.', 'l-good');
      renderHunt();
      return;
    }

    hunt.recoveryWindow = true;
    logMsg('You keep the pressure on while the monster is still off-balance.', 'l-good');
    renderHunt();
    return;
  } else if (actionType === 'guard') doPlayerGuardSelf();
  else if (actionType === 'item') doPlayerItem();
  else if (actionType === 'dodge' && !hunt.pendingMoveWasJustResolved) doPlayerDodgeSelf();

  hunt.pendingMoveWasJustResolved = false;
  if (hunt.over) return;
  if (player.hp <= 0){ endHunt('defeat'); return; }

  hunt.recoveryWindow = false;
  monsterTelegraphPhase();
  renderHunt();
}

function getWeaponSpecialEffect(weapon, part, dmg, crit){
  let extraDmg = 0;
  let note = '';
  switch (weapon.key){
    case 'boarhammer':
      if (part.broken){ extraDmg = 4; note = 'Impact drives extra force into the exposed wound.'; }
      break;
    case 'wyrmfang':
      if (crit || part.hitzone.fire >= 20){ extraDmg = 6; note = 'The blade sears the weak spot with blazing force.'; }
      break;
    case 'dunelord':
      if (Math.random() < 0.2){ extraDmg = 8; note = 'The greatfang overwhelms the target with a crushing blow.'; }
      break;
  }
  return { extraDmg, note };
}

function doPlayerAttack(partKey){
  const cost = 20;
  if (player.stamina < cost){
    logMsg("You're too winded to swing hard. Wait for stamina to recover.", 'l-sys');
    return;
  }
  player.stamina -= cost;

  const m = hunt.monster;
  const part = m.parts.find(p => p.key === partKey);
  const weapon = currentWeapon();
  const mult = hitzoneMultiplier(part);

  let physical = weapon.atk * (part.hitzone[weapon.damageType]/100) * mult;
  let elemental = 0;
  if (weapon.element !== 'none'){
    elemental = weapon.elementPower * (part.hitzone[weapon.element]/100) * mult;
  }
  let dmg = Math.round((physical + elemental) * rand(0.85,1.2));
  const crit = Math.random() < 0.15;
  if (crit) dmg = Math.round(dmg * 1.5);
  const special = getWeaponSpecialEffect(weapon, part, dmg, crit);
  dmg = Math.max(1, dmg + special.extraDmg);
  dmg = Math.max(1, dmg);

  const wasBrokenAlready = part.broken;
  part.hp = Math.max(0, part.hp - dmg);

  if (!(part.broken && part.postBreakImmune)){
    m.hp = Math.max(0, m.hp - dmg);
  }

  logMsg(`You strike the ${part.name.toLowerCase()} for ${dmg} damage.${crit ? ' A solid hit!' : ''}${special.note ? ' ' + special.note : ''}`, crit ? 'l-crit' : 'l-hit');

  if (part.hp <= 0 && !wasBrokenAlready){
    part.broken = true;
    m.hp = Math.max(0, m.hp - part.breakBonus);
    logMsg(`${part.breakMsg} (+${part.breakBonus} bonus damage)`, 'l-break');
  }

  if (!m.enraged && m.hp <= m.maxHp * 0.3){
    m.enraged = true;
    logMsg(`The ${m.name} is enraged! Its attacks grow fiercer.`, 'l-dmg');
  }

  if (m.hp <= 0){
    logMsg(`The ${m.name} collapses. The hunt is over.`, 'l-break');
    endHunt('victory');
  }
}

function doPlayerGuardSelf(){
  const weapon = currentWeapon();
  let gain = 20;
  let note = '';
  if (weapon.key === 'bearclaw'){
    gain = 28;
    note = ' Your clawed gauntlet keeps your footing firm.';
  }
  player.stamina = Math.min(player.maxStamina, player.stamina + gain);
  if (!hunt.pendingMove){
    logMsg(`You settle into a ready stance, catching your breath.${note}`, 'l-sys');
  }
}

function doPlayerItem(){
  if (player.potions <= 0){
    logMsg('No potions left in your pack.', 'l-sys');
    return;
  }
  player.potions -= 1;
  player.hp = Math.min(player.maxHp, player.hp + 40);
  logMsg('You down a potion, recovering 40 HP.', 'l-sys');
}

function doPlayerDodgeSelf(){
  player.stamina = Math.min(player.maxStamina, player.stamina + 10);
  logMsg('You reposition, staying light on your feet.', 'l-sys');
}

function handleFlee(){
  if (Math.random() < 0.75){
    logMsg('You break away and retreat from the hunting grounds.', 'l-sys');
    hunt.pendingMove = null;
    endHunt('flee');
    return;
  }
  logMsg("You can't find an opening to escape!", 'l-sys');
  if (hunt.pendingMove){
    resolvePendingMove('flee_fail', {});
    if (player.hp <= 0){ endHunt('defeat'); return; }
  }
  monsterTelegraphPhase();
  renderHunt();
}

/* ---------- RESOLVING THE MONSTER'S TELEGRAPHED MOVE ---------- */

function resolvePendingMove(actionType, payload){
  const move = hunt.pendingMove;
  const m = hunt.monster;

  if (headBroken(m) && Math.random() < 0.15){
    logMsg("Dazed from its wound, the attack fizzles before it lands!", 'l-good');
    hunt.pendingMove = null;
    hunt.sandstormActive = false;
    return;
  }

  let outcome;
  if (actionType === 'dodge'){
    outcome = (payload.dir === move.dodgeType)
      ? (hunt.sandstormActive ? 'partial' : 'perfect')
      : 'partial';
  } else if (actionType === 'guard' && move.blockable){
    outcome = 'blocked';
  } else if (actionType === 'guard' && !move.blockable){
    outcome = 'guardFail';
  } else {
    outcome = 'full';
  }

  const dmgMult = { perfect:0, partial:0.5, blocked:0.35, guardFail:0.9, full:1 }[outcome];

  if (move.type === 'debuff'){
    const staminaLoss = Math.round(20 * dmgMult);
    player.stamina = Math.max(0, player.stamina - staminaLoss);
    if (outcome === 'perfect') logMsg('You brace through the roar, unshaken.', 'l-good');
    else logMsg(`${move.resolveText} You lose ${staminaLoss} stamina.`, 'l-dmg');
  } else {
    let dmg = Math.round(move.baseDamage * (m.enraged ? 1.25 : 1) * (tailBroken(m) ? 0.9 : 1) * dmgMult);
    if (move.element !== 'none'){
      const armorStats = getArmorStats();
      const resist = armorStats.resist[move.element] || 0;
      dmg = Math.round(dmg * (1 - resist/100));
    }
    if (dmg > 0){
      const armorStats = getArmorStats();
      dmg = Math.max(1, dmg - Math.round(armorStats.def * 0.5));
      player.hp = Math.max(0, player.hp - dmg);
    }
    if (outcome === 'perfect') logMsg(`${move.resolveText} You read it perfectly and dodge clean.`, 'l-good');
    else if (outcome === 'guardFail') logMsg(`${move.resolveText} Your guard does nothing against this — you take ${dmg} damage.`, 'l-dmg');
    else if (dmg > 0) logMsg(`${move.resolveText} You take ${dmg} damage.`, 'l-dmg');
    else logMsg(`${move.resolveText} You avoid it entirely.`, 'l-good');
  }

  hunt.pendingMove = null;
  hunt.sandstormActive = false;
  hunt.pendingMoveWasJustResolved = true;
}

/* ---------- MONSTER TELEGRAPH + ARENA ---------- */

function monsterTelegraphPhase(){
  const m = hunt.monster;
  const pool = availableMoves(m);
  const chosen = pickMove(pool, m.enraged);
  hunt.pendingMove = chosen;
  hunt.recoveryWindow = false;
  logMsg(chosen.telegraph, 'l-telegraph');

  hunt.turnCount++;
  checkArenaHazard();
}

function checkArenaHazard(){
  const arena = ARENAS[hunt.monster.arenaKey];
  if (!arena || !arena.hazard) return;
  const { every, warnText, triggerText, effect } = arena.hazard;
  const t = hunt.turnCount;
  if (t % every === every - 1){
    logMsg(warnText, 'l-sys');
  } else if (t % every === 0 && t > 0){
    logMsg(triggerText, 'l-sys');
    effect();
  }
}

/* ---------- HUNT SCREEN RENDER ---------- */

function renderHunt(){
  document.getElementById('village-screen').classList.add('hidden');
  const h = document.getElementById('hunt-screen');
  h.classList.remove('hidden');

  const m = hunt.monster;
  const weapon = currentWeapon();
  const arena = ARENAS[m.arenaKey];

  const partsHtml = m.parts.map(p => {
    const locked = p.requiresBroken && !m.parts.find(x => x.key === p.requiresBroken).broken;
    let tag = '';
    if (p.broken && p.postBreakImmune) tag = '<span class="part-tag spent">SPENT</span>';
    else if (p.broken) tag = '<span class="part-tag exposed">EXPOSED</span>';
    else if (locked) tag = '<span class="part-tag armored">ARMORED</span>';
    const hints = hitzoneHints(p).map(hn => `<span class="hint-chip">${hn}</span>`).join('');
    const attackDisabled = '';
    return `
      <div class="part-card ${p.broken?'broken':''}">
        <div class="pname"><span>${p.name}</span>${tag}</div>
        <div class="barwrap" style="margin-top:6px;">
          <div class="barfill ${p.broken?'broken':'part'}" style="width:${pct(p.hp,p.maxHp)}%"></div>
        </div>
        <div class="hint-row">${hints}</div>
        <button class="wide" style="margin-top:8px;" onclick="playerAction('attack',{partKey:'${p.key}'})" ${attackDisabled}>Attack ${p.name.toLowerCase()}</button>
      </div>
    `;
  }).join('');

  const telegraphHtml = hunt.pendingMove ? `
    <div class="telegraph-banner">
      <span class="tt-label">Incoming — ${hunt.pendingMove.blockable ? 'blockable' : 'must be dodged'}</span>
      ${hunt.pendingMove.telegraph}
      <div style="margin-top:6px; color:var(--frost);">React now: ${hunt.pendingMove.blockable ? 'guard or dodge' : 'dodge only'}.</div>
    </div>
  ` : hunt.recoveryWindow ? `
    <div class="telegraph-banner" style="border-color:var(--moss-dim); color:var(--moss);">
      <span class="tt-label">Tempo opening</span>
      The monster is still recovering. Press another attack while the opening lasts.
    </div>
  ` : `
    <div class="telegraph-banner" style="border-color:var(--border); color:var(--text-dim);">
      <span class="tt-label">Reading the field</span>
      No move telegraphed yet — act to see what it does next.
    </div>
  `;

  const loadoutHint = `
    <div class="loadout-note">
      <div class="tactic-pill">Weapon style: ${weapon.specialDesc}</div>
      <div class="tactic-pill">Armor: ${getArmorStats().def} DEF · fire ${getArmorStats().resist.fire}% · ice ${getArmorStats().resist.ice}%</div>
    </div>
  `;

  h.innerHTML = `
    <div class="panel">
      <div class="arena-tag">${arena.name} — ${arena.desc}</div>
      <div class="monster-head">
        <span class="micon">${m.icon}</span>
        <div>
          <span class="mname">${m.name}</span>
          ${m.enraged ? '<span class="mtag">Enraged</span>' : ''}
        </div>
      </div>
      <div class="barlabel"><span>Vitality</span><span>${m.hp} / ${m.maxHp}</span></div>
      <div class="barwrap"><div class="barfill hp" style="width:${pct(m.hp,m.maxHp)}%"></div></div>

      ${telegraphHtml}
      ${loadoutHint}

      <div class="parts-grid">${partsHtml}</div>

      <div class="player-status">
        <div class="col">
          <div class="barlabel"><span>Your HP</span><span>${player.hp} / ${player.maxHp}</span></div>
          <div class="barwrap"><div class="barfill hp" style="width:${pct(player.hp,player.maxHp)}%"></div></div>
        </div>
        <div class="col">
          <div class="barlabel"><span>Stamina</span><span>${player.stamina} / ${player.maxStamina}</span></div>
          <div class="barwrap"><div class="barfill stam" style="width:${pct(player.stamina,player.maxStamina)}%"></div></div>
        </div>
      </div>

      <div class="action-group-label">Attack or react to the telegraph</div>
      <div class="actions">
        <button class="dodge" onclick="playerAction('dodge',{dir:'left'})">Dodge left</button>
        <button class="dodge" onclick="playerAction('dodge',{dir:'right'})">Dodge right</button>
        <button class="dodge" onclick="playerAction('dodge',{dir:'back'})">Dodge back</button>
      </div>

      <div class="action-group-label">Other actions</div>
      <div class="actions">
        <button onclick="playerAction('guard')">Guard</button>
        <button onclick="playerAction('item')" ${player.potions<=0 || hunt.pendingMove ? 'disabled' : ''}>Use potion (${player.potions})</button>
        <button onclick="playerAction('flee')">Flee hunt</button>
      </div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">Weapon: ${weapon.name} (ATK ${weapon.atk}) · attacks cost 20 stamina · dodging ignores your weapon's swing this round</div>

      <div id="hunt-log" class="log"></div>
    </div>
  `;
  renderLog();
  renderTopbar();
}

/* ---------- INIT ---------- */

renderVillage();
window.startHunt = startHunt;
window.playerAction = playerAction;
window.craftItem = craftItem;
window.buyShopItem = buyShopItem;
window.equipOwnedItem = equipOwnedItem;
window.renderVillage = renderVillage;
window.setVillageTab = setVillageTab;
window.doGenerateSave = doGenerateSave;
window.doLoadSave = doLoadSave;
window.doNewGame = doNewGame;