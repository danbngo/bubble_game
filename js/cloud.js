// A fluffy cloud that drifts slowly across the sky and comes back around.
class Cloud {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;   // roughly the radius of the biggest puff
    this.speed = speed; // pixels per second, drifting right
  }

  update(dt, width) {
    this.x += this.speed * dt;
    // Once fully off the right edge, come back in from the left
    if (this.x - this.size * 2 > width) {
      this.x = -this.size * 2;
    }
  }

  draw(ctx) {
    const s = this.size;
    // Puffs: [x offset, y offset, radius], all relative to size
    const puffs = [
      [-1.1, 0.2, 0.55],
      [-0.5, -0.2, 0.75],
      [0.2, -0.45, 0.9],
      [0.9, -0.1, 0.7],
      [1.4, 0.25, 0.5],
      [0, 0.25, 0.7],
    ];

    // Soft gray shadow underneath so the cloud looks puffy
    ctx.fillStyle = 'rgba(180, 200, 220, 0.9)';
    for (const [dx, dy, r] of puffs) {
      ctx.beginPath();
      ctx.arc(this.x + dx * s, this.y + dy * s + s * 0.12, r * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (const [dx, dy, r] of puffs) {
      ctx.beginPath();
      ctx.arc(this.x + dx * s, this.y + dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
