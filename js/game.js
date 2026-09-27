const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const POPS_PER_LEVEL = 20;
const BASE_MAX_BUBBLES = 15;
const BASE_SPAWN_INTERVAL = 0.8; // seconds between new bubbles at level 1
const MIN_SPAWN_INTERVAL = 0.1;
const LEVELS_PER_SPEEDUP = 5;
const SPEEDUP_AMOUNT = 0.4; // each speed-up makes bubbles move 40% of their base speed faster
const SLOW_FACTOR = 0.35;   // anti-accelerator slows bubbles to 35% speed

const sun = new Sun();
const ground = new Ground();
// x, y, size, speed. Different speeds so they drift past each other (and in front of the sun)
const clouds = [
  new Cloud(150, 130, 40, 12),
  new Cloud(600, 220, 30, 8),
  new Cloud(1000, 90, 50, 16),
];

let bubbles = [];
let particles = [];
let knives = [];      // knives currently flying around
let spikeWalls = null; // the spike walls while they're closing in
let totalPopped = 0;  // all-time pops, drives the level
let pops = 0;         // pops you can spend in the shop
let inventory = {};   // shop item id -> how many you own
let started = false;  // false while the title screen is showing
let paused = false;
let level = 1;
let levelUpTimer = 0; // seconds left to show the "Level up!" banner
let slowTimer = 0;    // seconds left on the anti-accelerator
let spawnTimer = 0;
let lastTime = performance.now();

// Each level spawns bubbles 25% faster and allows 5 more on screen
function spawnInterval() {
  return Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL * Math.pow(0.75, level - 1));
}

function maxBubbles() {
  return BASE_MAX_BUBBLES + (level - 1) * 5;
}

// Bubbles speed up at levels 5, 10, 15, ... unless the anti-accelerator is running
function bubbleSpeed() {
  const speed = 1 + SPEEDUP_AMOUNT * Math.floor(level / LEVELS_PER_SPEEDUP);
  return slowTimer > 0 ? speed * SLOW_FACTOR : speed;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function spawnBubble() {
  const radius = 20 + Math.random() * 40;
  const x = radius + Math.random() * (canvas.width - radius * 2);
  const y = canvas.height + radius;
  bubbles.push(new Bubble(x, y, radius));
}

function popBubble(index) {
  const b = bubbles[index];
  for (let i = 0; i < 12; i++) {
    particles.push(new Particle(b.x, b.y, b.hue));
  }
  Sound.pop(b.radius);
  bubbles.splice(index, 1);
  totalPopped++;
  pops++;

  if (totalPopped % POPS_PER_LEVEL === 0) {
    level++;
    levelUpTimer = level % LEVELS_PER_SPEEDUP === 0 ? 2.5 : 1.5; // linger longer on speed-ups
  }
  Shop.refresh();
}

function useKnife() {
  if (inventory.knife === 0) return;
  inventory.knife--;
  knives.push(new Knife(canvas.width / 2, canvas.height / 2, KNIFE_DURATION));
  Shop.refresh();
}

function useSpikeWalls() {
  // Only one set of walls at a time; don't use one up while they're already closing
  if (inventory.walls === 0 || spikeWalls) return;
  inventory.walls--;
  spikeWalls = new SpikeWalls();
  Shop.refresh();
}

function useAntiAccelerator() {
  const item = SHOP_ITEMS.find(i => i.id === 'slow');
  // Don't use one up while bubbles are already slowed
  if (inventory.slow === 0 || !isUnlocked(item) || slowTimer > 0) return;
  inventory.slow--;
  slowTimer = SLOW_DURATION;
  Shop.refresh();
}

// Wipes all progress and puts a few bubbles back on screen
function resetGame() {
  bubbles = [];
  particles = [];
  knives = [];
  spikeWalls = null;
  totalPopped = 0;
  pops = 0;
  inventory = {};
  for (const item of SHOP_ITEMS) {
    inventory[item.id] = 0;
  }
  level = 1;
  levelUpTimer = 0;
  slowTimer = 0;
  spawnTimer = 0;
  Shop.refresh();

  for (let i = 0; i < 5; i++) {
    spawnBubble();
    bubbles[i].y = Math.random() * canvas.height;
  }
}

function startGame() {
  started = true;
  Sound.startAmbience();
  document.getElementById('title-screen').hidden = true;
  document.getElementById('hud-buttons').hidden = false;
}

function goToTitle() {
  paused = false;
  started = false;
  Sound.startAmbience(); // was stopped by the pause; keep the birds going on the title screen
  document.getElementById('pause-screen').hidden = true;
  document.getElementById('hud-buttons').hidden = true;
  document.getElementById('title-screen').hidden = false;
  resetGame();
}

function setPaused(value) {
  // The shop already pauses the game, so don't stack a pause on top of it
  if (!started || Shop.isOpen) return;
  paused = value;
  document.getElementById('pause-screen').hidden = !paused;
  if (paused) Sound.stopAmbience();
  else Sound.startAmbience();
}

function handleClick(event) {
  if (!started || paused) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check from the top-most (last drawn) bubble down
  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].containsPoint(x, y)) {
      popBubble(i);
      return;
    }
  }
}

function handleKey(event) {
  if (!started) {
    if (event.key === 'Enter' || event.key === ' ') startGame();
    return;
  }
  if (event.key === 'p' || event.key === 'P') {
    setPaused(!paused);
    return;
  }
  if (event.key === 'Escape') {
    if (Shop.isOpen) Shop.close();
    else setPaused(!paused);
    return;
  }
  if (paused) return;
  if (event.key === 's' || event.key === 'S') Shop.toggle();
  for (const item of SHOP_ITEMS) {
    if (event.key.toLowerCase() === item.key) item.use();
  }
}

function update(dt) {
  spawnTimer += dt;
  if (spawnTimer >= spawnInterval() && bubbles.length < maxBubbles()) {
    spawnBubble();
    spawnTimer = 0;
  }

  if (levelUpTimer > 0) {
    levelUpTimer -= dt;
  }
  if (slowTimer > 0) {
    slowTimer -= dt;
  }

  sun.update(dt);
  ground.update(dt);
  for (const c of clouds) {
    c.update(dt, canvas.width);
  }

  // Speeding up time for the bubbles makes them drift and wobble faster
  const bubbleDt = dt * bubbleSpeed();
  for (const b of bubbles) {
    b.update(bubbleDt, canvas.width, canvas.height);
  }

  for (const k of knives) {
    const hit = k.update(dt, bubbles, canvas.width, canvas.height);
    const index = bubbles.indexOf(hit);
    // Two knives can reach the same bubble in one frame; only the first pops it
    if (index !== -1) {
      popBubble(index);
    }
  }
  knives = knives.filter(k => !k.isDone());

  if (spikeWalls) {
    spikeWalls.update(dt);
    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (spikeWalls.touches(bubbles[i], canvas.width, canvas.height)) {
        popBubble(i);
      }
    }
    if (spikeWalls.isDone()) spikeWalls = null;
  }

  for (const p of particles) {
    p.update(dt);
  }
  particles = particles.filter(p => !p.isDead());
}

function draw() {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#3a9be0');
  bg.addColorStop(1, '#0f4f86');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  sun.draw(ctx, canvas.width);
  for (const c of clouds) {
    c.draw(ctx);
  }
  ground.draw(ctx, canvas.width, canvas.height);

  for (const b of bubbles) {
    b.draw(ctx);
  }
  for (const p of particles) {
    p.draw(ctx);
  }
  for (const k of knives) {
    k.draw(ctx);
  }
  if (spikeWalls) {
    spikeWalls.draw(ctx, canvas.width, canvas.height);
  }

  // The title screen shows only the floating bubbles
  if (!started) return;

  ctx.save();
  // Dark shadow keeps the white text readable when a cloud drifts behind it
  ctx.shadowColor = 'rgba(0, 30, 60, 0.8)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Pops: ' + pops, 20, 20);
  ctx.fillText('Level: ' + level, 20, 56);

  // Countdowns for active items, stacked under the level
  let timerY = 92;
  if (knives.length > 0) {
    const longest = Math.max(...knives.map(k => k.timeLeft));
    ctx.fillText('🔪 ' + longest.toFixed(1) + 's', 20, timerY);
    timerY += 36;
  }
  if (slowTimer > 0) {
    ctx.fillText('🐢 ' + slowTimer.toFixed(1) + 's', 20, timerY);
  }

  if (levelUpTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, levelUpTimer);
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Level ' + level + '!', canvas.width / 2, canvas.height / 2);
    if (level % LEVELS_PER_SPEEDUP === 0) {
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Bubbles speed up!', canvas.width / 2, canvas.height / 2 + 56);
      if (level === 10) {
        ctx.fillText('🐢 Anti-Accelerator unlocked in the shop', canvas.width / 2, canvas.height / 2 + 96);
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt so tab-switching doesn't cause jumps
  lastTime = now;

  // The game also pauses while the shop is open
  if (!paused && !Shop.isOpen) {
    update(dt);
  }
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', handleKey);
canvas.addEventListener('pointerdown', handleClick);
document.getElementById('play-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', () => setPaused(true));
document.getElementById('resume-btn').addEventListener('click', () => setPaused(false));
document.getElementById('title-btn').addEventListener('click', goToTitle);
// Pause automatically when switching to another tab or window
document.addEventListener('visibilitychange', () => {
  if (document.hidden) setPaused(true);
});

resize();
Sound.init();
Shop.init();
resetGame();
requestAnimationFrame(loop);
