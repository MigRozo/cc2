const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ]
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

const sketch = ({ width, height }) => {
  let rectX, rectY, rectWidth, rectHeight, rectFill, rectStroke, blend;

  const rectsLength = 40;
  const rectsSkewDegrees = -30;
  const rects = [];
  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors)
  ];
  const bgColor = random.pick(risoColors).hex;

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
    context.lineWidth = 10;

    rects.forEach(rect => {
      const { rectX, rectY, rectWidth, rectHeight, rectFill, rectStroke, blend } = rect;
      let shadowColor;

      context.save();
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

  };
};

canvasSketch(sketch, settings);
