const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const POPS_PER_LEVEL = 20;
const BASE_MAX_BUBBLES = 15;
const BASE_SPAWN_INTERVAL = 0.8; // seconds between new bubbles at level 1
const MIN_SPAWN_INTERVAL = 0.1;

let bubbles = [];
let particles = [];
let score = 0;
let level = 1;
let levelUpTimer = 0; // seconds left to show the "Level up!" banner
let spawnTimer = 0;
let lastTime = performance.now();

// Each level spawns bubbles 25% faster and allows 5 more on screen
function spawnInterval() {
  return Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL * Math.pow(0.75, level - 1));
}

function maxBubbles() {
  return BASE_MAX_BUBBLES + (level - 1) * 5;
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
  bubbles.splice(index, 1);
  score++;

  if (score % POPS_PER_LEVEL === 0) {
    level++;
    levelUpTimer = 1.5;
  }
}

function handleClick(event) {
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

function update(dt) {
  spawnTimer += dt;
  if (spawnTimer >= spawnInterval() && bubbles.length < maxBubbles()) {
    spawnBubble();
    spawnTimer = 0;
  }

  if (levelUpTimer > 0) {
    levelUpTimer -= dt;
  }

  for (const b of bubbles) {
    b.update(dt, canvas.width, canvas.height);
  }

  for (const p of particles) {
    p.update(dt);
  }
  particles = particles.filter(p => !p.isDead());
}

function draw() {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#0b2a4a');
  bg.addColorStop(1, '#1d6fa5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const b of bubbles) {
    b.draw(ctx);
  }
  for (const p of particles) {
    p.draw(ctx);
  }

  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Popped: ' + score, 20, 20);
  ctx.fillText('Level: ' + level, 20, 56);

  if (levelUpTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, levelUpTimer);
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Level ' + level + '!', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt so tab-switching doesn't cause jumps
  lastTime = now;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', resize);
canvas.addEventListener('pointerdown', handleClick);

resize();
// Start with a few bubbles already on screen
for (let i = 0; i < 5; i++) {
  spawnBubble();
  bubbles[i].y = Math.random() * canvas.height;
}
requestAnimationFrame(loop);
