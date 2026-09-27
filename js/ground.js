// Rolling green hills along the bottom of the screen, with grass that sways in the breeze.
const GROUND_HEIGHT = 110; // how tall the front hill is at its highest
const GRASS_SPACING = 12;  // pixels between grass blades

// Tree spots as a fraction of screen width, so they spread out on any screen size
const BACK_TREES = [
  { at: 0.05, size: 26 },
  { at: 0.3, size: 30 },
  { at: 0.36, size: 22 },
  { at: 0.62, size: 28 },
  { at: 0.95, size: 24 },
];
const FRONT_TREES = [
  { at: 0.14, size: 42 },
  { at: 0.5, size: 36 },
  { at: 0.8, size: 46 },
];

class Ground {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  // Height of the hill's top edge at x, built from a couple of gentle waves
  frontHillY(x, height) {
    return height - GROUND_HEIGHT + Math.sin(x * 0.006) * 18 + Math.sin(x * 0.017 + 1) * 8;
  }

  backHillY(x, height) {
    return height - GROUND_HEIGHT - 40 + Math.sin(x * 0.004 + 2) * 30;
  }

  draw(ctx, width, height) {
    // Back hill: lighter so it looks farther away
    this.fillHill(ctx, width, height, x => this.backHillY(x, height), '#7ccf6a', '#5fb257');
    for (const t of BACK_TREES) {
      const x = t.at * width;
      drawTree(ctx, x, this.backHillY(x, height) + 6, t.size, this.treeSway(x), true);
    }

    // Front hill
    this.fillHill(ctx, width, height, x => this.frontHillY(x, height), '#4caf50', '#2e7d32');
    for (const t of FRONT_TREES) {
      const x = t.at * width;
      drawTree(ctx, x, this.frontHillY(x, height) + 8, t.size, this.treeSway(x), false);
    }

    // Grass blades along the front hill's edge
    ctx.strokeStyle = '#3d9a40';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 0; x <= width; x += GRASS_SPACING) {
      const baseY = this.frontHillY(x, height) + 2;
      const bladeHeight = 8 + ((x * 7) % 9); // varied but stays the same every frame
      const sway = Math.sin(this.time * 2 + x * 0.05) * 3;
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + sway, baseY - bladeHeight);
    }
    ctx.stroke();
  }

  // Slow side-to-side sway, offset by position so trees don't move in lockstep
  treeSway(x) {
    return Math.sin(this.time * 1.2 + x * 0.01);
  }

  fillHill(ctx, width, height, topY, topColor, bottomColor) {
    const top = height - GROUND_HEIGHT - 80;
    const grad = ctx.createLinearGradient(0, top, 0, height);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width + 10; x += 10) {
      ctx.lineTo(x, topY(x));
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
}
