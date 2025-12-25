const follow = document.getElementById("follow");
const follower = document.getElementById("follower");

const canvas = document.getElementById("canvas-main");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
  x: null,
  y: null,
  radius: (canvas.height / 120) * (canvas.width / 120),
};

// Event Listener to track mouse position
document.addEventListener("mousemove", (e) => {
  let mouseX = e.clientX;
  let mouseY = e.clientY;
  mouse.x = e.pageX;
  mouse.y = e.pageY;

  follow.style.transform = `translate3d(${mouseX - 16}px, ${mouseY - 16}px, 0)`;
  follower.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0)`;
});

// creating a particle
class Particle {
  constructor(x, y, size, directionX, directionY) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.directionX = directionX;
    this.directionY = directionY;
    this.density = Math.random() * 10 + 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 13, false);
    ctx.fillStyle = "#4255A0";
    ctx.fill();
  }
  update() {
    if (this.x > canvas.width || this.x < 0) {
      this.directionX = -this.directionX;
    }
    if (this.y > canvas.height || this.y < 0) {
      this.directionY = -this.directionY;
    }
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius + this.size) {
      if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
        this.x += 10;
      }
      if (mouse.x > this.x && this.x > this.size * 10) {
        this.x -= 10;
      }
      if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
        this.y += 10;
      }
      if (mouse.y > this.y && this.y > this.size * 10) {
        this.y -= 10;
      }
    }
    this.x += this.directionX;
    this.y += this.directionY;
    this.draw();
  }
}
function init() {
  particleArray = [];
  let numberOfParticles = (canvas.height * canvas.width) / 10000;
  for (let i = 0; i < numberOfParticles * 2; i++) {
    let size = Math.random() * 3;
    let x = Math.random() * (canvas.width - size * 2 - size * 2) + size * 2;
    let y = Math.random() * (canvas.height - size * 2 - size * 2) + size * 2;
    let directionX = Math.random() * 5 - 2.5;
    let directionY = Math.random() * 5 - 2.5;
    let color = "white";
    particleArray.push(new Particle(x, y, size, directionX, directionY));
  }
}
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particleArray.length; i++) {
    particleArray[i].update();
  }
  connect();
}

function connect() {
  let opacityValue = 1;
  for (let a = 0; a < particleArray.length; a++) {
    for (let b = a + 1; b < particleArray.length; b++) {
      let dx = particleArray[a].x - particleArray[b].x;
      let dy = particleArray[a].y - particleArray[b].y;
      let distance = dx * dx + dy * dy;

      let maxDistance = 120; // adjust this for more/fewer connections

      if (distance < maxDistance * maxDistance) {
        opacityValue = 1 - distance / 20000;
        ctx.strokeStyle = "rgba(209, 200, 214, 0.1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particleArray[a].x, particleArray[a].y);
        ctx.lineTo(particleArray[b].x, particleArray[b].y);
        ctx.stroke();
      }
    }
  }
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  mouse.radius = (canvas.height / 120) * (canvas.width / 120);
  init();
});

init();
animate();

// Skill Tab Logic
const tabs = [
  document.getElementById("tab-1"),
  document.getElementById("tab-2"),
  document.getElementById("tab-3"),
];
const contents = [
  document.getElementById("item_1"),
  document.getElementById("item_2"),
  document.getElementById("item_3"),
];

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) =>
      t.classList.replace("border-blue-600", "border-gray-500")
    );
    tab.classList.replace("border-gray-500", "border-blue-600");
    contents.forEach((content, i) => {
      if (i === index) {
        content.style.left = "0";
      } else if (i < index) {
        content.style.left = "-100%";
      } else {
        content.style.left = "100%";
      }
    });
  });
});
