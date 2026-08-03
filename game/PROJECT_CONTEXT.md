IRONVEIL — Session Handoff (Architecture Shift)
Project overview

Ironveil is a browser-based dark fantasy hunting RPG inspired by Monster Hunter's preparation loop but aiming for its own identity rather than recreating Monster Hunter's interface.

Current technology:

Vanilla HTML5
Vanilla CSS3
ES6 Modules
No frameworks
No canvas/WebGL
DOM-rendered UI

Progression is equipment-driven (no levels or EXP).

Core gameplay loop:

Town Hub
↓
Quest / Expedition
↓
Hunt
↓
Rewards
↓
Forge / Inventory
↓
Repeat
Current project architecture

The codebase is already heavily modular.

js/

data/
hunt/
ui/

state.js
save.js
main.js

Game logic is generally separated from UI rendering.

main.js primarily exposes module functions globally and starts the initial render.

Current render flow is approximately

renderVillage()

↓

User interaction

↓

startHunt()

↓

Combat

↓

renderVillage()

This architecture is functional and should not be rewritten from scratch.

Major realization from this session

The biggest bottleneck is not mechanics anymore.

It is engine architecture.

The project still behaves like a website.

Pages grow vertically.

New content is appended underneath existing content.

Screens are treated as independent HTML sections.

The desired direction is to make Ironveil behave like a game engine rather than a website.

New long-term direction

Move toward a lightweight browser game engine while remaining 100% HTML/CSS/JavaScript.

Do not introduce React, Vue, Angular, Phaser, Pixi, or other frameworks.

The goal is to understand and build the engine manually.

The engine should eventually contain concepts similar to:

Engine

Camera
Scene Manager
Overlay Manager
Input Manager
Audio Manager

These systems should remain independent from combat, quests, inventory, and save logic.

Scene philosophy

Current mindset:

Village Screen

↓

Hunt Screen

↓

Victory Screen

Desired mindset:

World

Town
Forge
Guild
Camp
Hunt

-

Overlay Layer

Victory
Inventory
Dialogue
Pause
Settings

The victory screen should not replace combat.

It should appear above combat.

Combat remains alive underneath until dismissed.

Camera philosophy

Instead of replacing HTML,

the camera should move through a persistent world.

Conceptually:

WORLD

---

Town

Forge

Guild

Camp

Hunt

---

The viewport simply changes its position.

This opens the possibility for:

horizontal camera pans
zoom transitions
room-to-room navigation
parallax backgrounds
animated building entrances

without changing pages.

Village redesign direction

The current "Village" screen should evolve into a physical location.

Instead of:

Village

Forge Tab

Quest Tab

Inventory Tab

The desired interaction is:

Town

Forge Building

Guild Hall

Storage

Camp

Expedition Gate

Buildings become interactable world objects rather than menu buttons.

Clicking a building moves the camera into that room.

Example:

Town

↓

Camera pans

↓

Forge Interior

The player should feel like they are walking through a place rather than navigating menus.

UI identity direction

Avoid becoming "Monster Hunter in HTML."

Instead, establish Ironveil's own identity.

Current palette is already strong:

dark slate
oxidized bronze
moss green
dried blood
muted steel blue

Continue leaning toward:

blacksmith craftsmanship
carved metal
engraved frames
forged iron
cathedral architecture

Avoid:

generic fantasy blue windows
pixel art (unless the entire project pivots)
excessive parchment imitation

The UI should eventually feel closer to handcrafted metalwork than paperwork.

Art direction

The user is learning sprite creation.

Priority is UI artwork rather than character illustration.

Likely first assets:

panel frames
decorative corners
dividers
icons
building sprites
forge decorations

Consistency is more important than complexity.

Current HTML state

Current structure is:

#app

Header

Viewport

Village Screen

Hunt Screen

Footer

Future architecture will likely become

#app

HUD

Camera

World

Town

Forge

Guild

Camp

Hunt

Overlay

Footer

The world remains persistent.

Only the camera and overlays change.

Current JavaScript quality

The project is healthier than expected.

Folders are already separated into:

data
hunt logic
UI
shared components

Avoid large rewrites.

Prefer incremental evolution.

Immediate goals

Rather than adding more mechanics,

the next architectural milestone should be:

Build a lightweight Camera system.
Add an Overlay layer for victory/dialogues/modals.
Replace page-style navigation with room-style navigation.
Transition from scrolling layouts to a fixed game viewport (likely 1280×720).

These systems should be added around the existing codebase rather than replacing it.

Development mindset

One important realization from this session:

The project should no longer be thought of as an "HTML website."

It should be thought of as

a custom 2D game engine rendered with HTML.

That mental model better matches the user's engineering background and the long-term direction of the project.
