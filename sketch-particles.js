const canvasSketch = require('canvas-sketch');

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

  this.update = function () {
    this.vx += this.ax;
    this.vy += this.ay;

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

const sketch = ({ width, height }) => {
  let currentX, currentY, particle;

  for (let i = 0; i < 1; i++) {
    currentX = width * 0.5;
    currentY = height * 0.5;

    particle = new Particle({ x: currentX, y: currentY });

    particles.push(particle);
  }

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
