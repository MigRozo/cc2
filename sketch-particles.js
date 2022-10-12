const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const eases = require('eases');

const cursor = { x: 9999, y: 9999 };

const onMouseUp = () => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);

  cursor.x = 9999;
  cursor.y = 9999;
};
const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  cursor.x = x;
  cursor.y = y;
};
const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  onMouseMove(e);
};

const Particle = function ({ x, y, radius = 10 }) {
  // POSITION
  this.x = x;
  this.y = y;

  // ACCELERATION
  this.ax = 0;
  this.ay = 0;

  // VELOCITY
  this.vx = 0;
  this.vy = 0;

  // INITIAL POSITION
  this.ix = x;
  this.iy = y;

  this.radius = radius;

  this.minDist = random.range(100, 150);
  this.pushFactor = random.range(0.01, 0.02);
  this.pullFactor = random.range(0.002, 0.006);
  this.dampFactor = random.range(0.9, 0.95);

  this.update = function () {
    let dx, dy, dd, distDelta;

    // Pull Force
    dx = this.ix - this.x;
    dy = this.iy - this.y;

    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;

    // Push Force
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy);
    distDelta = this.minDist - dd;

    if ( dd < this.minDist ) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }

    this.vx += this.ax;
    this.vy += this.ay;

    // Damp
    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;

    this.x += this.vx;
    this.y += this.vy;
  };

  this.draw = function (context) {
    context.save();

    context.translate(this.x, this.y);
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();

    context.restore();
  };
};

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const particles = [];

let elCanvas;

const sketch = ({ width, height, canvas }) => {
  let currentX, currentY, currentRadius, particle;
  let currentPos = [];

  const numCircles = 15;
  const gapCircle = 8;
  const gapDot = 4;
  let dotRadius = 12;
  let cirRadius = 0;
  const fitRadius = dotRadius;

  elCanvas = canvas;
  elCanvas.addEventListener('mousedown', onMouseDown);

  for (let i = 0; i < numCircles; i++) {
    const circumference = Math.PI * 2 * cirRadius;
    const numFit = i ? Math.floor( circumference / (fitRadius * 2 + gapDot) ) : 1;
    const fitSlice = Math.PI * 2 / numFit;

    for (let j = 0; j < numFit; j++) {
      const theta = fitSlice * j;

      currentX = Math.cos(theta) * cirRadius;
      currentY = Math.sin(theta) * cirRadius;
      currentX += width * 0.5;
      currentY += height * 0.5;

      currentRadius = dotRadius;

      particle = new Particle({ x: currentX, y: currentY, radius: currentRadius });
      particles.push(particle);
    }

    cirRadius += fitRadius * 2 + gapCircle;

    // LINEAR
    // dotRadius = (1 - i / numCircles) * fitRadius;

    // EASING
    dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius;
  }

  /* for (let i = 0; i < 200; i++) {
    currentX = width * 0.5;
    currentY = height * 0.5;

    random.insideCircle(400, currentPos);
    currentX += currentPos[0];
    currentY += currentPos[1];

    particle = new Particle({ x: currentX, y: currentY });

    particles.push(particle);
  } */

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    });
  };
};

canvasSketch(sketch, settings);
