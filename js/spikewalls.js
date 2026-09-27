// Two spiked walls that slam in from the sides, pop every bubble they touch, then pull back.
const SPIKE_LENGTH = 40;  // how far each spike sticks out from its wall
const SPIKE_HEIGHT = 60;  // vertical size of each spike
const CLOSE_TIME = 1.2;   // seconds to close in
const HOLD_TIME = 0.4;    // seconds the walls stay shut
const OPEN_TIME = 0.8;    // seconds to pull back

class SpikeWalls {
  constructor() {
    this.time = 0;
    this.closed = 0; // 0 = fully open (off screen), 1 = spike tips meet in the middle
  }

  isDone() {
    return this.time >= CLOSE_TIME + HOLD_TIME + OPEN_TIME;
  }

  update(dt) {
    this.time += dt;
    if (this.time < CLOSE_TIME) {
      const t = this.time / CLOSE_TIME;
      this.closed = t * t; // speed up as they close, like a slam
    } else if (this.time < CLOSE_TIME + HOLD_TIME) {
      this.closed = 1;
    } else {
      const t = Math.min(1, (this.time - CLOSE_TIME - HOLD_TIME) / OPEN_TIME);
      this.closed = 1 - t;
    }
  }

  // x positions of the spike tips on each wall
  leftTip(width) {
    return this.closed * width / 2;
  }

  rightTip(width) {
    return width - this.closed * width / 2;
  }

  touches(bubble, width, height) {
    // Bubbles still below the screen are safe
    if (bubble.y - bubble.radius > height) return false;
    return bubble.x - bubble.radius < this.leftTip(width) ||
           bubble.x + bubble.radius > this.rightTip(width);
  }

  draw(ctx, width, height) {
    this.drawWall(ctx, this.leftTip(width), 1, width, height);
    this.drawWall(ctx, this.rightTip(width), -1, width, height);
  }

  // dir is 1 for the left wall (spikes point right) and -1 for the right wall
  drawWall(ctx, tipX, dir, width, height) {
    const baseX = tipX - dir * SPIKE_LENGTH;

    // Wall body, from the spike bases out past the edge of the screen
    const bodyLeft = dir === 1 ? -SPIKE_LENGTH : baseX;
    const bodyRight = dir === 1 ? baseX : width + SPIKE_LENGTH;
    ctx.fillStyle = '#6f7780';
    ctx.fillRect(bodyLeft, 0, bodyRight - bodyLeft, height);
    ctx.fillStyle = '#5a6168';
    ctx.fillRect(baseX - dir * 6, 0, dir * 6, height); // darker edge strip

    // Both walls use the same spike rows so the tips line up when they meet
    const count = Math.ceil(height / SPIKE_HEIGHT);
    for (let i = 0; i < count; i++) {
      const top = i * SPIKE_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(baseX, top);
      ctx.lineTo(tipX, top + SPIKE_HEIGHT / 2);
      ctx.lineTo(baseX, top + SPIKE_HEIGHT);
      ctx.closePath();
      ctx.fillStyle = '#c9ced4';
      ctx.fill();
      ctx.strokeStyle = '#8b939c';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
