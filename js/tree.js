// A round, leafy cartoon tree. `size` is roughly the canopy radius.
// `far` trees are paler so they sit back on the distant hill.
function drawTree(ctx, x, baseY, size, sway, far) {
  const trunkWidth = size * 0.35;
  const trunkHeight = size * 1.3;
  const canopyY = baseY - trunkHeight - size * 0.4;
  const lean = sway * size * 0.06; // the top of the tree moves a little in the breeze

  // Trunk
  ctx.fillStyle = far ? '#8a6a4a' : '#6d4526';
  ctx.beginPath();
  ctx.moveTo(x - trunkWidth / 2, baseY + 4);
  ctx.lineTo(x - trunkWidth * 0.35 + lean, baseY - trunkHeight);
  ctx.lineTo(x + trunkWidth * 0.35 + lean, baseY - trunkHeight);
  ctx.lineTo(x + trunkWidth / 2, baseY + 4);
  ctx.closePath();
  ctx.fill();

  // Canopy: overlapping leafy blobs, darker underneath and lighter on top
  const dark = far ? '#5aa85a' : '#2e7d32';
  const mid = far ? '#6fbf68' : '#43a047';
  const light = far ? '#8fd487' : '#66bb6a';
  const cx = x + lean * 1.5;

  const blobs = [
    [-0.6, 0.2, 0.7, dark],
    [0.6, 0.2, 0.7, dark],
    [0, 0.3, 0.8, dark],
    [-0.45, -0.25, 0.7, mid],
    [0.45, -0.25, 0.7, mid],
    [0, -0.55, 0.75, mid],
    [-0.2, -0.45, 0.4, light],
    [0.25, -0.15, 0.3, light],
  ];
  for (const [dx, dy, r, color] of blobs) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + dx * size, canopyY + dy * size, r * size, 0, Math.PI * 2);
    ctx.fill();
  }
}
