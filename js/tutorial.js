// Step-by-step tutorial shown at the start of a game when the title screen toggle is ON.
// A step with `until` waits for the player to do something; otherwise it shows a button.
const TUTORIAL_STEPS = [
  {
    text: '👆 Click a bubble to pop it!',
    until: () => totalPopped >= 1,
  },
  {
    text: '🎉 Nice! Every bubble you pop gives you 1 pop to spend. Pop 4 more!',
    until: () => totalPopped >= 5,
  },
  {
    text: '🛒 You can spend pops in the Shop. Click the Shop button in the top right (or press S)!',
    until: () => Shop.isOpen,
  },
  {
    text: '🔪 This is the shop! When you have enough pops, buy knives, spike walls and more. Close the shop to keep popping.',
    until: () => !Shop.isOpen,
  },
  {
    text: '⭐ Every 20 pops you go up a level and more bubbles come. Every 5 levels they move faster too!',
    button: 'Got it!',
  },
  {
    text: '😊 Click the smiley face for music, and press P to pause. Have fun popping!',
    button: "Let's pop!",
  },
];

const Tutorial = {
  enabled: true,
  active: false,
  step: 0,

  init() {
    this.box = document.getElementById('tutorial');
    this.textEl = document.getElementById('tutorial-text');
    this.nextBtn = document.getElementById('tutorial-next');
    this.toggleBtn = document.getElementById('tutorial-toggle');

    // Remember the player's choice between visits (if the browser allows it)
    try {
      this.enabled = localStorage.getItem('tutorial') !== 'off';
    } catch (e) { /* storage blocked: keep the default */ }

    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.nextBtn.addEventListener('click', () => this.next());
    document.getElementById('tutorial-skip').addEventListener('click', () => this.end());
    this.refreshToggle();
  },

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('tutorial', this.enabled ? 'on' : 'off');
    } catch (e) { /* storage blocked: the choice just won't be remembered */ }
    this.refreshToggle();
  },

  refreshToggle() {
    this.toggleBtn.textContent = `TUTORIAL: ${this.enabled ? 'ON' : 'OFF'}`;
    this.toggleBtn.classList.toggle('off', !this.enabled);
  },

  // Called when Play is clicked
  start() {
    if (!this.enabled) return;
    this.active = true;
    this.step = 0;
    this.box.hidden = false;
    this.show();
  },

  show() {
    const step = TUTORIAL_STEPS[this.step];
    this.textEl.textContent = step.text;
    this.nextBtn.hidden = !step.button;
    if (step.button) this.nextBtn.textContent = step.button;
  },

  next() {
    this.step++;
    if (this.step >= TUTORIAL_STEPS.length) {
      this.end();
    } else {
      this.show();
    }
  },

  end() {
    this.active = false;
    this.box.hidden = true;
  },

  // Called every frame: moves on once the player has done what the step asks
  update() {
    if (!this.active) return;
    const step = TUTORIAL_STEPS[this.step];
    if (step.until && step.until()) this.next();
  },
};
