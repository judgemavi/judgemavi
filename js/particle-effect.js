const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let nebulas = [];
const particleCount = 300;
const nebulaCount = 10;
let mouse = { x: null, y: null };

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.z = Math.random() * 1000;
    this.radius = Math.random() * 2 + 0.5;
    this.baseSpeed = Math.random() * 0.5 + 0.2;
    this.speedX = 0;
    this.speedY = 0;
    this.color = this.getRandomColor();
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  }

  update() {
    this.speedX = this.baseSpeed * (1000 / (1000 + this.z));
    this.speedY = this.baseSpeed * (1000 / (1000 + this.z));

    this.x += this.speedX;
    this.y += this.speedY;
    this.z += (Math.random() - 0.5) * 2;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
    if (this.z < 0) this.z = 1000;
    if (this.z > 1000) this.z = 0;

    if (mouse.x != null && mouse.y != null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        this.x -= dx * 0.02 * (1000 / (1000 + this.z));
        this.y -= dy * 0.02 * (1000 / (1000 + this.z));
      }
    }
  }

  draw() {
    const depth = 1000 / (1000 + this.z);
    const size = this.radius * depth * 2;

    ctx.beginPath();
    ctx.arc(this.x, this.y + size / 4, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * depth})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = depth;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class Nebula {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 100 + 50;
    this.color = this.getRandomColor();
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 200 + 55);
    const g = Math.floor(Math.random() * 200 + 55);
    const b = Math.floor(Math.random() * 200 + 55);
    return `rgba(${r},${g},${b},0.1)`;
  }

  draw() {
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function init() {
  particles = [];
  nebulas = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  for (let i = 0; i < nebulaCount; i++) {
    nebulas.push(new Nebula());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  nebulas.forEach((nebula) => nebula.draw());

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

function init() {
  particles = [];
  nebulas = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  for (let i = 0; i < nebulaCount; i++) {
    nebulas.push(new Nebula());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  nebulas.forEach((nebula) => nebula.draw());

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

init();
animate();
