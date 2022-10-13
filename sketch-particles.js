const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const eases = require('eases');
const colormap = require('colormap');
const interpolate = require('color-interpolate');

const cursor = { x: 9999, y: 9999 };

const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};

let imgA, imgB;

const colors = colormap({
  colormap: 'viridis',
  nshades: 20
});

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

const Particle = function ({ x, y, radius = 10, colMap }) {
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
  this.scale = 1;
  // this.color = colors[0];
  this.colMap = colMap;
  this.color = colMap(0);

  this.minDist = random.range(100, 150);
  this.pushFactor = random.range(0.01, 0.02);
  this.pullFactor = random.range(0.002, 0.006);
  this.dampFactor = random.range(0.9, 0.95);

  this.update = function () {
    let dx, dy, dd, distDelta;
    let idxColor;

    // Pull Force
    dx = this.ix - this.x;
    dy = this.iy - this.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;

    this.scale = math.mapRange(dd, 0, 200, 1, 5);

    // idxColor = Math.floor( math.mapRange(dd, 0, 200, 0, colors.length - 1, true) );
    // this.color = colors[idxColor];

    this.color = this.colMap( math.mapRange(dd, 0, 200, 0, 1, true) );

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
    // context.fillStyle = 'white';
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
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
  // let currentPos = [];

  const imgAcanvas = document.createElement('canvas');
  const imgAcontext = imgAcanvas.getContext('2d');

  const imgBcanvas = document.createElement('canvas');
  const imgBcontext = imgBcanvas.getContext('2d');

  imgAcanvas.width = imgA.width;
  imgAcanvas.height = imgA.height;

  imgBcanvas.width = imgB.width;
  imgBcanvas.height = imgB.height;

  imgAcontext.drawImage(imgA, 0, 0);
  imgBcontext.drawImage(imgB, 0, 0);

  const imgAdata = imgAcontext.getImageData(0, 0, imgA.width, imgA.height).data;
  const imgBdata = imgBcontext.getImageData(0, 0, imgB.width, imgB.height).data;

  // const numCircles = 15;
  // const gapCircle = 8;
  // const gapDot = 4;
  const numCircles = 30;
  const gapCircle = 3;
  const gapDot = 3;
  let dotRadius = 12;
  let cirRadius = 0;
  const fitRadius = dotRadius;

  elCanvas = canvas;
  elCanvas.addEventListener('mousedown', onMouseDown);

  for (let i = 0; i < numCircles; i++) {
    const circumference = Math.PI * 2 * cirRadius;
    const numFit = i ? Math.floor( circumference / (fitRadius * 2 + gapDot) ) : 1;
    const fitSlice = Math.PI * 2 / numFit;
    let ix, iy, idx, r, g, b, colA, colB, colMap;

    for (let j = 0; j < numFit; j++) {
      const theta = fitSlice * j;

      currentX = Math.cos(theta) * cirRadius;
      currentY = Math.sin(theta) * cirRadius;
      currentX += width * 0.5;
      currentY += height * 0.5;

      ix = Math.floor( (currentX / width) * imgA.width );
      iy = Math.floor( (currentY / height) * imgA.height );
      idx = (iy * imgA.width + ix) * 4;

      r = imgAdata[idx + 0];
      g = imgAdata[idx + 1];
      b = imgAdata[idx + 2];
      colA = `rgb(${r}, ${g}, ${b})`;

      // currentRadius = dotRadius;
      currentRadius = math.mapRange(r, 0, 255, 1, 12);

      r = imgBdata[idx + 0];
      g = imgBdata[idx + 1];
      b = imgBdata[idx + 2];
      colB = `rgb(${r}, ${g}, ${b})`;

      colMap = interpolate([colA, colB]);

      particle = new Particle({ x: currentX, y: currentY, radius: currentRadius, colMap });
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

    // context.drawImage( imgAcanvas, 0, 0 );
    // context.drawImage( imgBcanvas, imgA.width, 0 );

    particles.sort((a, b) => a.scale - b.scale);

    particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    });
  };
};

const init = async () => {
  imgA = await loadImage('./images/img1.jpg');
  imgB = await loadImage('./images/img2.jpg');

  canvasSketch(sketch, settings);
};
init();
