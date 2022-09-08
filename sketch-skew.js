const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const seed = random.getRandomSeed();

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  name: seed
};

const drawSkewedRect = ({ context, rectWidth = 600, rectHeight = 200, degrees = -45 }) => {
  const angle = math.degToRad( degrees );
  const rx = Math.cos( angle ) * rectWidth;
  const ry = Math.sin( angle ) * rectWidth;

  context.save();
  context.translate( rx * -0.5, (ry + rectHeight) * -0.5 );

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + rectHeight);
  context.lineTo(0, rectHeight);
  context.closePath();

  context.restore();
};

const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);
  
  for (let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    
  }

  context.closePath();
};

const sketch = ({ width, height }) => {
  random.setSeed( seed );

  let rectX, rectY, rectWidth, rectHeight, rectFill, rectStroke, blend;

  const rectsLength = 40;
  const rectsSkewDegrees = -30;
  const rects = [];
  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors)
  ];
  const bgColor = random.pick(risoColors).hex;

  const mask = {
    radius: width * 0.4,
    // sides: 3,
    sides: 6,
    x: width * 0.5,
    // y: height * 0.58,
    y: height * 0.5
  };

  for (let i = 0; i < rectsLength; i++) {
    rectX = random.range(0, width);
    rectY = random.range(0, height);
    rectWidth = random.range(200, 600);
    rectHeight = random.range(40, 200);

    rectFill = random.pick(rectColors).hex;
    rectStroke = random.pick(rectColors).hex;

    blend = (random.value() > 0.5) ? 'overlay' : 'source-over';

    rects.push({ rectX, rectY, rectWidth, rectHeight, rectFill, rectStroke, blend });
  }

  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
    context.lineWidth = 20;

    context.save();
    context.translate( mask.x, mask.y );

    drawPolygon({ context, radius: mask.radius, sides: mask.sides });
    
    context.clip();


    rects.forEach(rect => {
      const { rectX, rectY, rectWidth, rectHeight, rectFill, rectStroke, blend } = rect;
      let shadowColor;

      context.save();
      context.translate(-mask.x, -mask.y);
      context.translate(rectX, rectY);
      context.strokeStyle = rectStroke;
      context.fillStyle   = rectFill;

      context.globalCompositeOperation = blend;

      drawSkewedRect({ context, rectWidth, rectHeight, degrees: rectsSkewDegrees });

      shadowColor = Color.offsetHSL( rectFill, 0, 0, -20 );
      shadowColor.rgba[3] = 0.8;

      context.shadowColor = Color.style(shadowColor.rgba);
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20;

      context.fill();

      context.shadowColor = null;
      context.stroke();

      context.globalCompositeOperation = 'source-over';
      
      context.lineWidth = 2;
      context.strokeStyle = 'black';
      context.stroke();

      context.restore();
    });

    context.restore();

    // Polygon Outline
    context.save();
    context.translate( mask.x, mask.y );

    drawPolygon({ context, radius: mask.radius - (context.lineWidth * 3), sides: mask.sides });

    context.lineWidth = 20;
    context.globalCompositeOperation = 'color-burn';
    context.strokeStyle = rectColors[0].hex;
    context.stroke();

    context.restore();

  };
};

canvasSketch(sketch, settings);
