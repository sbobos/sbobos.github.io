# Context & Guidelines for AI Assistant: Project IRONVEIL

I am building a browser-based, dark fantasy RPG hunting game called **IRONVEIL** using vanilla HTML5, CSS3, and ES6 JavaScript Modules.

## 🎯 Core Game Concept & Philosophy
- Inspired by classic hunting RPGs (e.g., Monster Hunter).
- Progression is strictly **gear-based and player skill-based** (NO character levels or EXP).
- Gameplay loop: **Village Hub (Prep/Forge/Quests) ⇄ Hunt/Expedition (Tactical Combat/Gathering)**.

---

## 🛠️ Tech Stack & Code Architecture
- **Vanilla ES6 Modules** (`import` / `export`). State uses live bindings (`state.js`).
- **UI Architecture**: Modular CSS breakdown (`base`, `layout`, `components`, `forge`, `inventory`, `combat`).
- **Data vs Logic vs UI Separation**:
  - `js/data/`: Pure data objects/arrays (monsters, gear, trades, sidequests).
  - `js/hunt/`: Combat mechanics, turn resolution, move calculations.
  - `js/ui/`: DOM rendering and event handlers (`village.js`, `hunt.js`, `topbar.js`).

---

## 🚩 Current Project State & Known Tech Debt
- **Playable Base**: Combat and basic village loops function, but minor visual/display bugs exist.
- **Bloated Files**: `village.js` is currently oversized and unorganized; needs decomposition into smaller modular UI components.
- **Dead Code / Tech Debt**: Unused `.js` files in `js/data/` and orphaned/uncalled functions exist that need pruning.

---

## 🗺️ Long-Term Feature Roadmap (Planned Steps)
1. **Day & Time System**:
   - Hunts/Expeditions take 1 full day to complete upon return.
   - Enables passive features (farm/herb growth timers, daily shop deals, weather/special events).
2. **5-Slot Armor & MH-style Skill System**:
   - Expand gear slots: Head, Chest, Arms, Waist, Legs.
   - Cumulative skill points from gear activation (threshold-based perk system).
3. **4-Part Modular Weapon Crafting**:
   - Weapons built from 4 modular parts: **Head, Handle, Core, Mechanism**.
   - The **Mechanism** part determines available player movesets during combat.
4. **Forge Upgrade Progression**:
   - Forge requires material investment to upgrade tiers, locking higher crafting items behind village progression.
5. **Enhanced Tactical Combat**:
   - Multi-move selection (e.g., Light Slash, Heavy Overhead, Guard/Dodge) combined with Monster Part targeting.
6. **Visuals & Audio** *(Far Future)*: Sprites, UI animations, ambient BGM, sound FX.

---

## 🤖 Strict Coding Rules for the AI
1. **Incremental Steps First**: NEVER generate monolithic changes. Focus on one modular, self-contained refactoring or feature at a time.
2. **Keep Code Modular & Clean**:
   - Do NOT add huge UI logic into single files. Separate into dedicated module files under `js/ui/` or `js/data/`.
   - Keep UI rendering separate from core game logic.
3. **Preserve State Integrity**: Keep live bindings in `js/state.js` unbroken (`import { player, story, hunt } from './state.js'`).
4. **Clean Tech Debt**: When modifying existing features, highlight and prune dead functions or unused data references safely.
5. **No External Frameworks**: Stick strictly to standard Web APIs (DOM, ES Modules, standard CSS variables).

---

## 💬 Current Task / Topic for This Session:
[ INSERT YOUR CURRENT FOCUS OR QUESTION HERE ]