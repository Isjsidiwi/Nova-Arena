import { $ } from './dom.js';

const canvas = $('#fx');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  const rect = $('#st').getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

/** Partikel ambien (bintang naik pelan di latar). */
function spawnAmbient() {
  for (let i = 0; i < 26; i++) {
    particles.push({
      x: Math.random() * 500,
      y: Math.random() * 900,
      vx: -.2 + Math.random() * .4,
      vy: -.5 + Math.random() * .4,
      life: 9,
      color: '#ffffff',
      size: 1 + Math.random() * 1.5,
      ambient: true,
    });
  }
}

export function initParticles() {
  resize();
  addEventListener('resize', resize);
  spawnAmbient();
  requestAnimationFrame(loop);
}

/** Ledakan partikel pada koordinat layar (clientX/clientY). */
export function burst(x, y, color, count = 20, spread = 5) {
  const rect = canvas.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * (spread - 1);
    particles.push({
      x: x - rect.left,
      y: y - rect.top,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

/** Tambah partikel mentah (koordinat kanvas), mis. hujan emas saat SSR. */
export function spawnParticle(particle) {
  particles.push({ ...particle, ambient: false });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.ambient) {
      if (p.y < -5) {
        p.y = canvas.height + 5;
        p.x = Math.random() * canvas.width;
      }
      ctx.globalAlpha = .35;
    } else {
      p.vy += .08;
      p.life -= .025;
      ctx.globalAlpha = Math.max(p.life, 0);
    }
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    return p.ambient || p.life > 0;
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
