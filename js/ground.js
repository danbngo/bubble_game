// Rolling green hills along the bottom of the screen, with grass that sways in the breeze.
const GROUND_HEIGHT = 110; // how tall the front hill is at its highest
const GRASS_SPACING = 12;  // pixels between grass blades

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

    // Front hill
    this.fillHill(ctx, width, height, x => this.frontHillY(x, height), '#4caf50', '#2e7d32');

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
