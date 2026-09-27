// A single floating bubble. Rainbow bubbles are rare and worth more pops.
class Bubble {
  constructor(x, y, radius, rainbow = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.rainbow = rainbow;
    this.value = rainbow ? 3 : 1; // pops you get for popping it
    this.vx = (Math.random() - 0.5) * 40;   // pixels per second
    this.vy = -(30 + Math.random() * 50);   // drift upward
    this.hue = Math.floor(Math.random() * 360);
    this.wobble = Math.random() * Math.PI * 2;
  }

  update(dt, width, height) {
    this.wobble += dt * 2;
    if (this.rainbow) {
      this.hue = (this.hue + dt * 120) % 360; // colors swirl around
    }
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

    if (this.rainbow) {
      this.drawRainbowRim(ctx);
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsla(${this.hue}, 90%, 85%, 0.7)`;
      ctx.stroke();
    }

    // Shine highlight
    ctx.beginPath();
    ctx.ellipse(this.x - r * 0.35, this.y - r * 0.4, r * 0.25, r * 0.12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  }

  // A thick ring made of every color of the rainbow, spinning as the hue changes
  drawRainbowRim(ctx) {
    const segments = 24;
    const step = (Math.PI * 2) / segments;
    ctx.save();
    ctx.lineWidth = 5;
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 10;
    for (let i = 0; i < segments; i++) {
      const hue = (this.hue + (i * 360) / segments) % 360;
      ctx.beginPath();
      // Overlap each piece slightly so there are no gaps between colors
      ctx.arc(this.x, this.y, this.radius - 2, i * step, (i + 1) * step + 0.02);
      ctx.strokeStyle = `hsl(${hue}, 95%, 60%)`;
      ctx.stroke();
    }
    ctx.restore();
  }
}
