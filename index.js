const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const global = {
  gameStarted: false,
  turds: [],
  ripples: [],
  particles: [],
  particlesCreated: false,
  gameSpeed: 1,
  lastKeyPressed: null,
  inWater: false,
  score: 0,
  drown: new Audio("./audio/drown.mp4"),
  theme: new Audio("./audio/theme.mp4"),
  success: new Audio("./audio/success.mp4"),
  ugh: new Audio("./audio/ugh.wav"),
};

const createScoreBoard = () => {
  ctx.fillStyle = "black    ";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${global.score}`, 10, 30);
  ctx.fillText(`Game Speed: ${global.gameSpeed}`, 10, 60);
};

const detectCollision = (rect1, rect2) => {
  return !(
    rect1.x > rect2.x + rect2.width - 15 ||
    rect1.x - 15 + rect1.width < rect2.x ||
    rect1.y > rect2.y + rect2.height ||
    rect1.y + rect1.height < rect2.y
  );
};

window.addEventListener("keydown", (e) => {
  let keyPressed = e.code;
  if (global.inWater === false) {
    global.particlesCreated = false;
  }

  if (keyPressed === "ArrowLeft" && global.gameStarted) {
    global.lastKeyPressed = keyPressed;
    fly.x -= fly.jumpDistance;
  } else if (keyPressed === "ArrowRight" && global.gameStarted) {
    global.lastKeyPressed = keyPressed;
    fly.x += fly.jumpDistance;
  } else if (keyPressed === "ArrowUp" && global.gameStarted) {
    global.lastKeyPressed = keyPressed;
    fly.y -= fly.jumpDistance;
  } else if (
    keyPressed === "ArrowDown" &&
    fly.y < canvas.height - fly.jumpDistance - 25 &&
    global.gameStarted
  ) {
    global.lastKeyPressed = keyPressed;
    fly.y += fly.jumpDistance;
  }
});

class Fly {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.jumpDistance = 50;
  }

  draw() {
    let fly = new Image();

    if (global.lastKeyPressed === null || global.lastKeyPressed === "ArrowUp") {
      fly.src = "./images/fly-up.png";
    } else if (global.lastKeyPressed === "ArrowDown") {
      fly.src = "./images/fly-down.png";
    } else if (global.lastKeyPressed === "ArrowLeft") {
      fly.src = "./images/fly-left.png";
    } else if (global.lastKeyPressed === "ArrowRight") {
      fly.src = "./images/fly-right.png";
    }

    ctx.drawImage(fly, this.x, this.y);
  }

  detectFlyOutOfBounds() {
    if (fly.x < 0 - fly.width / 2 || fly.x > canvas.width - fly.width / 2) {
      global.ugh.play();
      respawnFly();
    }
  }
}

class Turd {
  constructor(x, y, width, height, direction, spacing) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = direction;
    this.spacing = spacing;
  }

  draw() {
    const turd = new Image();
    ctx.fillStyle = "transparent";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    if (this.width === 100) {
      turd.src = "./images/turd100.png";
    }

    if (this.width === 150) {
      turd.src = "./images/turd150.png";
    }

    if (this.width === 200) {
      turd.src = "./images/turd200.png";
    }

    if (this.width === 450) {
      turd.src = "./images/turd450.png";
    }

    ctx.drawImage(turd, this.x, this.y);
  }

  move() {
    if (this.direction === "right") {
      this.x += global.gameSpeed;
    }
    if (this.direction === "left") {
      this.x -= global.gameSpeed;
    }

    if (this.x > canvas.width && this.direction === "right") {
      this.x = 0 - this.spacing;
    } else if (this.x < 0 - this.width && this.direction === "left") {
      this.x = canvas.width + this.spacing;
    }
  }

  detectFlyTouchingTurd() {
    if (detectCollision(this, fly)) {
      if (this.direction === "right") {
        fly.x += global.gameSpeed;
      } else if (this.direction === "left") {
        fly.x -= global.gameSpeed;
      }
      if (global.particlesCreated === false) {
        createParticleEffect();
      }
    }
  }
}

class Ripple {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.opacity = 0.6;
  }

  draw() {
    ctx.strokeStyle = `rgba(0, 12, 205, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  move() {
    this.radius += 0.5;
    this.opacity -= 0.01;
  }
}

class Particle {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.opacity = 0.7;
  }

  draw() {
    ctx.fillStyle = `rgba(131, 90, 0, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  move() {
    this.radius += 0.1;
    this.opacity -= 0.01;
  }
}

const createLanes = () => {
  // lane 1
  for (let i = 1; i <= 3; i++) {
    let x = 200 * i;
    global.turds.push(new Turd(x, canvas.height - 200, 100, 100, "right", 200));
  }
  // lane 2
  for (let i = 1; i <= 3; i++) {
    let x = i * 350;
    global.turds.push(new Turd(x, canvas.height - 300, 150, 100, "left", 300));
  }
  // lane 3
  for (let i = 1; i <= 2; i++) {
    let x = 300 * i;
    global.turds.push(new Turd(x, canvas.height - 400, 150, 100, "right", 150));
  }
  // lane 4
  for (let i = 1; i <= 1; i++) {
    let x = 300 * i;
    global.turds.push(new Turd(x, canvas.height - 500, 450, 100, "left", 150));
  }
  // lane 5
  for (let i = 1; i <= 3; i++) {
    let x = 250 * i;
    global.turds.push(new Turd(x, canvas.height - 600, 100, 100, "right", 250));
  }
  // lane 6
  for (let i = 1; i <= 2; i++) {
    let x = 400 * i;
    global.turds.push(new Turd(x, canvas.height - 700, 200, 100, "left", 300));
  }
};

const incrementScore = () => {
  if (fly.y < 0 - fly.height) {
    global.score += 1;
    global.gameSpeed += 0.5;
    global.success.play();
    respawnFly();
  }
};

const detectFlyDrowning = () => {
  const turds = global.turds;
  let alive = false;

  for (let i = 0; i < turds.length; i++) {
    if (detectCollision(turds[i], fly)) {
      alive = true;
    }
  }

  if (alive === false && fly.y < canvas.height - 100) {
    if (global.lastKeyPressed === "ArrowLeft") {
      createRippleEffect(25, 25);
    } else if (global.lastKeyPressed === "ArrowRight") {
      createRippleEffect(25, 25);
    } else if (global.lastKeyPressed === "ArrowUp") {
      createRippleEffect(25, 25);
    } else if (global.lastKeyPressed === "ArrowDown") {
      createRippleEffect(25, 25);
    }
    global.drown.currentTime = 0;
    global.drown.play();
    respawnFly();
  }
};

const createRippleEffect = (x, y) => {
  for (let i = 0; i < 3; i++) {
    if (i === 0) {
      global.ripples.push(new Ripple(fly.x + x, fly.y + y, 10));
    }
    if (i === 1) {
      global.ripples.push(new Ripple(fly.x + x, fly.y + y, 20));
    }
    if (i === 2) {
      global.ripples.push(new Ripple(fly.x + x, fly.y + y, 30));
    }
  }
};

const createParticleEffect = () => {
  global.particlesCreated = true;
  for (let i = 0; i < 3; i++) {
    if (i === 0) {
      const ranNum1 =
        Math.ceil(Math.random() * 5) * (Math.round(Math.random()) ? 1 : -5);
      global.particles.push(
        new Particle(fly.x + 25 + ranNum1, fly.y + 25 + ranNum1, 1)
      );
    }
    if (i === 1) {
      const ranNum2 =
        Math.ceil(Math.random() * 5) * (Math.round(Math.random()) ? 1 : -5);
      global.particles.push(
        new Particle(fly.x + 25 + ranNum2, fly.y + 25 + ranNum2, 2)
      );
    }
    if (i === 2) {
      const ranNum3 =
        Math.ceil(Math.random() * 5) * (Math.round(Math.random()) ? 1 : -5);
      global.particles.push(
        new Particle(fly.x + 25 + ranNum3, fly.y + 25 + ranNum3, 3)
      );
    }
  }
};

const deleteExcessRipples = () => {
  if (global.ripples.length > 100) {
    for (let i = 0; i < global.ripples.length; i++) {
      global.ripples.pop();
    }
  }
};

const deleteExcessParticles = () => {
  if (global.particles.length > 100) {
    for (let i = 0; i < global.ripples.length; i++) {
      global.particles.pop();
    }
  }
};

const respawnFly = () => {
  fly.x = canvas.width / 2 - 25;
  fly.y = canvas.height - 75;
  global.lastKeyPressed = null;
};

const fly = new Fly(canvas.width / 2 - 25, canvas.height - 75, 50, 50);

createLanes();

const createSplashPage = () => {
  const wrapper = document.querySelector(".wrapper");

  const titleContent = document.createElement("div");
  titleContent.classList.add("title-content");

  const startGameButton = document.createElement("button");
  startGameButton.classList.add("start-game-button");
  startGameButton.innerText = "Start Game";
  titleContent.appendChild(startGameButton);

  wrapper.appendChild(titleContent);

  startGameButton.addEventListener("click", () => {
    global.gameStarted = true;
    titleContent.remove();
    global.theme.play();
    global.theme.loop = "true";
  });
};

window.onload = () => {
  let screenCanPlay = true;
  if (window.innerHeight < 800 || window.innerWidth < 800) {
    alert("This is a browser only game Sorry ;P");
    screenCanPlay = false;
    canvas.style.border = "none";
  }
  if (screenCanPlay) {
    animate();
    createSplashPage();
  }
  return;
};

// where all the functions are called in continous loop
const animate = () => {
  const water = new Image();
  water.src = "./images/water.png";
  ctx.drawImage(water, 0, 0);

  const seat = new Image();
  seat.src = "./images/seat.png";

  global.ripples.forEach((ripple) => {
    ripple.draw();
    ripple.move();
  });
  global.turds.forEach((turd) => {
    turd.draw();
    turd.move();
    turd.detectFlyTouchingTurd();
  });
  global.particles.forEach((particle) => {
    particle.draw();
    particle.move();
  });

  ctx.drawImage(seat, 0, canvas.height - 100);
  fly.draw();
  fly.detectFlyOutOfBounds();
  createScoreBoard();
  incrementScore();
  detectFlyDrowning();
  deleteExcessRipples();
  deleteExcessParticles();
  requestAnimationFrame(animate);
};
