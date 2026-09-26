// A small droplet that flies out when a bubble pops.
class Particle {
  constructor(x, y, hue) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 160;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.hue = hue;
    this.size = 2 + Math.random() * 3;
    this.life = 0.5 + Math.random() * 0.3; // seconds
    this.maxLife = this.life;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 300 * dt; // gravity
    this.life -= dt;
  }

  isDead() {
    return this.life <= 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 90%, 80%, ${alpha})`;
    ctx.fill();
  }
}
