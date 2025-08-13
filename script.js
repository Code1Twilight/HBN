const startBtn = document.getElementById("start");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const photo = document.getElementById("photo");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let placedLetters = [];
let grandExploded = false;
let totalTargets = 0; // <-- dynamic target count (fixes the 21 bug)

function randomColor() {
  // bro/homie palette: cyan, deep blue, light cyan, aqua, gold
  const colors = ["#00b4d8", "#0077b6", "#90e0ef", "#48cae4", "#ffdd00"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function setupLetterPositions() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const spacing = 50;
  const lineHeight = 100;
  // no emojis (they can split differently on devices)
  const lines = ["HAPPY", "BIRTHDAY", "NOLIE"];
  const positions = [];

  lines.forEach((word, lineIndex) => {
    const letters = word.split("");
    const totalWidth = letters.length * spacing;
    const startX = centerX - totalWidth / 2 + 28;
    const y = centerY - (lineHeight * ((lines.length - 1) / 2)) + lineIndex * lineHeight;

    letters.forEach((letter, i) => {
      positions.push({ letter, x: startX + i * spacing, y });
    });
  });

  return positions;
}

function launchFirework(target) {
  const startX = Math.random() * canvas.width;
  fireworks.push({
    x: startX,
    y: canvas.height + 10,
    tx: target.x,
    ty: target.y,
    color: randomColor(),
    exploded: false,
    letter: target.letter
  });
}

function updateFireworks() {
  // subtle dark fade so trails look smooth over the gradient
  ctx.fillStyle = "rgba(10, 15, 25, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fireworks.forEach((f, i) => {
    if (!f.exploded) {
      f.x += (f.tx - f.x) * 0.1;
      f.y += (f.ty - f.y) * 0.1;

      ctx.beginPath();
      ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.fill();

      if (Math.abs(f.x - f.tx) < 2 && Math.abs(f.y - f.ty) < 2) {
        f.exploded = true;
        placedLetters.push({
          x: f.tx,
          y: f.ty,
          color: f.color,
          letter: f.letter,
          alpha: 0,
          size: 44
        });
        fireworks.splice(i, 1);
      }
    }
  });

  placedLetters.forEach(l => {
    if (l.alpha < 1) l.alpha += 0.02;
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    ctx.font = `bold ${l.size}px Impact, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(l.letter, l.x, l.y);
    ctx.globalAlpha = 1;
  });

  // ✅ dynamic finale trigger (no more hardcoded 21)
  if (placedLetters.length >= totalTargets && !grandExploded) {
    grandExploded = true;
    launchGrandExplosion();
    showPhoto();
    dropConfetti();
    releaseBalloons();
  }
}

function animate() {
  updateFireworks();
  requestAnimationFrame(animate);
}

function launchSequence(positions, i = 0) {
  if (i < positions.length) {
    launchFirework(positions[i]);
    setTimeout(() => launchSequence(positions, i + 1), 500);
  }
}

function launchGrandExplosion() {
  for (let i = 0; i < 50; i++) {
    fireworks.push({
      x: canvas.width / 2,
      y: canvas.height,
      tx: canvas.width / 2 + (Math.random() - 0.5) * 300,
      ty: canvas.height / 2 + 120 + (Math.random() - 0.5) * 100,
      color: randomColor(),
      exploded: false,
      letter: ""
    });
  }
}

function showPhoto() {
  // make sure the element is visible and animate in
  photo.style.display = "block";
  // re-trigger CSS animation (in case it's cached)
  photo.style.animation = "none";
  // next frame
  requestAnimationFrame(() => {
    photo.style.animation = "fadeIn 1.5s ease forwards";
  });
}

function dropConfetti() {
  const colors = ["#00b4d8", "#0077b6", "#90e0ef", "#48cae4", "#ffdd00"];
  for (let i = 0; i < 200; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "absolute";
    confetti.style.width = "6px";
    confetti.style.height = "6px";
    confetti.style.borderRadius = "50%";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-10px";
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear infinite`;
    confetti.style.opacity = Math.random();
    confetti.style.zIndex = 1; // under the photo
    document.body.appendChild(confetti);
  }

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fall {
      to { transform: translateY(110vh) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function releaseBalloons() {
  const colors = ["#00b4d8", "#0077b6", "#90e0ef", "#48cae4", "#ffdd00"];
  for (let i = 0; i < 10; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.left = Math.random() * (window.innerWidth - 30) + "px";
    b.style.background = colors[Math.floor(Math.random() * colors.length)];
    b.style.animationDuration = `${Math.random() * 4 + 4}s`;
    b.style.zIndex = 1; // under the photo
    document.body.appendChild(b);
  }
}

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  const positions = setupLetterPositions();
  totalTargets = positions.length; // <-- set dynamic target count
  animate();
  launchSequence(positions);
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});