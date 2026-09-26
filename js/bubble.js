// A single floating bubble.
class Bubble {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = (Math.random() - 0.5) * 40;   // pixels per second
    this.vy = -(30 + Math.random() * 50);   // drift upward
    this.hue = Math.floor(Math.random() * 360);
    this.wobble = Math.random() * Math.PI * 2;
  }

  update(dt, width, height) {
    this.wobble += dt * 2;
    this.x += (this.vx + Math.sin(this.wobble) * 15) * dt;
    this.y += this.vy * dt;

    // Bounce off the side walls
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx = -Math.abs(this.vx);
    }

    // Wrap back to the bottom after floating off the top
    if (this.y + this.radius < 0) {
      this.y = height + this.radius;
    }
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  draw(ctx) {
    const r = this.radius;

    // Translucent body
    const body = ctx.createRadialGradient(
      this.x - r * 0.3, this.y - r * 0.3, r * 0.1,
      this.x, this.y, r
    );
    body.addColorStop(0, `hsla(${this.hue}, 90%, 85%, 0.15)`);
    body.addColorStop(0.8, `hsla(${this.hue}, 90%, 65%, 0.25)`);
    body.addColorStop(1, `hsla(${this.hue}, 90%, 75%, 0.6)`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    // Rim
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${this.hue}, 90%, 85%, 0.7)`;
    ctx.stroke();

    // Shine highlight
    ctx.beginPath();
    ctx.ellipse(this.x - r * 0.35, this.y - r * 0.4, r * 0.25, r * 0.12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  }
}
