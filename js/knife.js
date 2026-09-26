// A flying knife that hunts down and pops bubbles on its own for a few seconds.
class Knife {
  constructor(x, y, duration) {
    this.x = x;
    this.y = y;
    this.angle = -Math.PI / 2;
    this.speed = 900; // pixels per second
    this.timeLeft = duration;
    this.spin = 0;
  }

  isDone() {
    return this.timeLeft <= 0;
  }

  // Moves toward the nearest visible bubble. Returns the bubble it hit, or null.
  update(dt, bubbles, width, height) {
    this.timeLeft -= dt;

    const target = this.findNearest(bubbles, width, height);
    if (!target) {
      // Nothing to chase: spin in place
      this.spin += dt * 10;
      return null;
    }
    this.spin = 0;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);

    const step = this.speed * dt;
    if (dist <= target.radius || dist <= step) {
      this.x = target.x;
      this.y = target.y;
      return target;
    }
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return null;
  }

  findNearest(bubbles, width, height) {
    let best = null;
    let bestDist = Infinity;
    for (const b of bubbles) {
      // Skip bubbles that haven't floated onto the screen yet
      if (b.y - b.radius > height || b.x < 0 || b.x > width) continue;
      const d = Math.hypot(b.x - this.x, b.y - this.y);
      if (d < bestDist) {
        bestDist = d;
        best = b;
      }
    }
    return best;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + this.spin);

    // Fade out during the last half second
    ctx.globalAlpha = Math.min(1, this.timeLeft * 2);

    // Handle
    ctx.fillStyle = '#6b3e1f';
    ctx.fillRect(-30, -5, 22, 10);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(-9, -9, 4, 18); // guard

    // Blade (points in the direction of travel)
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo(22, -6);
    ctx.lineTo(34, 0);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fillStyle = '#dfe6ee';
    ctx.fill();
    ctx.strokeStyle = '#8a97a6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
