// Shop overlay. Uses the game's globals (pops, knivesOwned) defined in game.js.
const KNIFE_PRICE = 15;
const KNIFE_DURATION = 5; // seconds

const Shop = {
  isOpen: false,

  init() {
    this.overlay = document.getElementById('shop');
    this.popsLabel = document.getElementById('shop-pops');
    this.buyKnifeBtn = document.getElementById('buy-knife');
    this.shopBtn = document.getElementById('shop-btn');
    this.useKnifeBtn = document.getElementById('use-knife-btn');

    this.shopBtn.addEventListener('click', () => this.open());
    document.getElementById('close-shop').addEventListener('click', () => this.close());
    this.buyKnifeBtn.addEventListener('click', () => this.buyKnife());
    this.useKnifeBtn.addEventListener('click', () => useKnife());
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

  buyKnife() {
    if (pops < KNIFE_PRICE) return;
    pops -= KNIFE_PRICE;
    knivesOwned++;
    this.refresh();
  },

  // Keep button labels and disabled states in sync with the game state
  refresh() {
    this.popsLabel.textContent = pops;
    this.buyKnifeBtn.disabled = pops < KNIFE_PRICE;
    this.useKnifeBtn.textContent = `🔪 Use knife (${knivesOwned})`;
    this.useKnifeBtn.disabled = knivesOwned === 0;
  },
};
