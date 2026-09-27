// A glowing sun in the sky with slowly turning rays.
const SUN_RADIUS = 60;
const SUN_RAYS = 12;

class Sun {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx, width) {
    // Upper right, below the HUD buttons
    const x = width - 160;
    const y = 170;
    const pulse = 1 + Math.sin(this.time * 2) * 0.05;

    ctx.save();

    // Soft glow lighting up the sky around the sun
    const glow = ctx.createRadialGradient(x, y, SUN_RADIUS * 0.5, x, y, SUN_RADIUS * 4 * pulse);
    glow.addColorStop(0, 'rgba(255, 236, 150, 0.55)');
    glow.addColorStop(0.4, 'rgba(255, 210, 90, 0.18)');
    glow.addColorStop(1, 'rgba(255, 200, 80, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, SUN_RADIUS * 4 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Rays: long and short ones alternating, turning slowly
    ctx.translate(x, y);
    ctx.rotate(this.time * 0.15);
    ctx.fillStyle = 'rgba(255, 220, 110, 0.7)';
    for (let i = 0; i < SUN_RAYS; i++) {
      const length = (i % 2 === 0 ? 55 : 35) * pulse;
      ctx.beginPath();
      ctx.moveTo(SUN_RADIUS + 8, -8);
      ctx.lineTo(SUN_RADIUS + 8 + length, 0);
      ctx.lineTo(SUN_RADIUS + 8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.rotate((Math.PI * 2) / SUN_RAYS);
    }

    // Sun body
    const body = ctx.createRadialGradient(-SUN_RADIUS * 0.3, -SUN_RADIUS * 0.3, 5, 0, 0, SUN_RADIUS);
    body.addColorStop(0, '#fffbe0');
    body.addColorStop(0.6, '#ffe066');
    body.addColorStop(1, '#ffb830');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(0, 0, SUN_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
