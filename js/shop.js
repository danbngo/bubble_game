// Shop overlay. Uses the game's globals (pops, inventory, timesBought) and item functions from game.js.
const KNIFE_DURATION = 5; // seconds
const SLOW_DURATION = 10; // seconds the anti-accelerator lasts
const PRICE_GROWTH = 1.5; // each purchase makes that item cost 50% more

// Everything the shop sells. To add an item, add an entry here and a use function in game.js.
const SHOP_ITEMS = [
  {
    id: 'knife',
    name: 'Knife',
    icon: '🔪',
    price: 15,
    key: 'k',
    description: 'Flies around popping bubbles for you for 5 seconds.',
    use: () => useKnife(),
  },
  {
    id: 'walls',
    name: 'Spike Walls',
    icon: '🧱',
    price: 30,
    key: 'w',
    description: 'Two spiked walls close in and pop every bubble on screen.',
    use: () => useSpikeWalls(),
  },
  {
    id: 'slow',
    name: 'Anti-Accelerator',
    icon: '🐢',
    price: 50,
    key: 'a',
    minLevel: 10, // can't be bought or used before this level
    description: 'Slows all bubbles way down for 10 seconds.',
    use: () => useAntiAccelerator(),
  },
];

function isUnlocked(item) {
  return level >= (item.minLevel || 1);
}

// `price` in SHOP_ITEMS is the starting price; it grows every time you buy that item
function currentPrice(item) {
  return Math.round(item.price * Math.pow(PRICE_GROWTH, timesBought[item.id]));
}

const Shop = {
  isOpen: false,
  buyButtons: {},
  useButtons: {},

  init() {
    this.overlay = document.getElementById('shop');
    this.popsLabel = document.getElementById('shop-pops');

    const itemList = document.getElementById('shop-items');
    const hud = document.getElementById('hud-buttons');
    const shopBtn = document.getElementById('shop-btn');

    for (const item of SHOP_ITEMS) {
      // Row in the shop
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-info">
          <strong>${item.name}</strong>
          <span>${item.description}</span>
        </div>`;
      const buyBtn = document.createElement('button');
      buyBtn.addEventListener('click', () => this.buy(item));
      row.appendChild(buyBtn);
      itemList.appendChild(row);
      this.buyButtons[item.id] = buyBtn;

      // "Use" button in the HUD, placed before the Shop button
      const useBtn = document.createElement('button');
      useBtn.title = `Press ${item.key.toUpperCase()}`;
      useBtn.addEventListener('click', item.use);
      hud.insertBefore(useBtn, shopBtn);
      this.useButtons[item.id] = useBtn;
    }

    shopBtn.addEventListener('click', () => this.open());
    document.getElementById('close-shop').addEventListener('click', () => this.close());
  },

  open() {
    this.isOpen = true;
    this.overlay.hidden = false;
    this.refresh();
  },

  close() {
    this.isOpen = false;
    this.overlay.hidden = true;
  },

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  },

  buy(item) {
    const price = currentPrice(item);
    if (pops < price || !isUnlocked(item)) return;
    pops -= price;
    inventory[item.id]++;
    timesBought[item.id]++;
    this.refresh();
  },

  // Keep button labels and disabled states in sync with the game state
  refresh() {
    this.popsLabel.textContent = pops;
    for (const item of SHOP_ITEMS) {
      const owned = inventory[item.id];
      const unlocked = isUnlocked(item);
      const buyBtn = this.buyButtons[item.id];
      const price = currentPrice(item);
      buyBtn.textContent = unlocked ? `Buy · ${price} pops` : `🔒 Level ${item.minLevel}`;
      buyBtn.disabled = !unlocked || pops < price;
      this.useButtons[item.id].textContent = `${item.icon} ${item.name} (${owned})`;
      this.useButtons[item.id].disabled = owned === 0 || !unlocked;
    }
  },
};
