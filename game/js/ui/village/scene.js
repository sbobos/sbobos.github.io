export function renderVillageScene() {
  return `
    <div class="village-scene">
    <button class="building" data-building="quests">
        Quest Board
    </button>

    <button class="building" data-building="forge">
        Forge
    </button>

    <button class="building" data-building="camp">
      Camp
    </button>

    <button class="building" data-building="inventory">
      Inventory
    </button>
    
    <button class="building" data-building="save">
        Save / Load
    </button>
    </div>
  `;
}
