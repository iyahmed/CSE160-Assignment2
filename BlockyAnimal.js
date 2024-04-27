// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas, gl, a_Position, u_fragColor, u_Size, u_ModelMatrix, u_GlobalRotateMatrix; // Global variables

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for the matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;

// Set up actions for the HTMl UI elements
function addActionsForHTMLUI() {
  // Button Events
  document.getElementById('animationYellowOffButton').onclick = function () { g_yellowAnimation = false; };
  document.getElementById('animationYellowOnButton').onclick = function () { g_yellowAnimation = true; };
  document.getElementById('animationMagentaOffButton').onclick = function () { g_magentaAnimation = false; };
  document.getElementById('animationMagentaOnButton').onclick = function () { g_magentaAnimation = true; };

  // Color Slider Events
  document.getElementById('magentaSlide').addEventListener('mousemove', function () { g_magentaAngle = this.value; renderAllShapes(); });
  document.getElementById('yellowSlide').addEventListener('mousemove', function () { g_yellowAngle = this.value; renderAllShapes(); });

  // Angle Slider Events
  // document.getElementById('angleSlide').addEventListener('mouseup', function () { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader progress and cibbecr GLSL variables 
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev); } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Render
  //gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);

}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_yellowAnimation === true) {
    g_yellowAngle = (45 * Math.sin(g_seconds));
  }
  if (g_magentaAnimation === true) {
    g_magentaAngle = (45 * Math.sin(3 * g_seconds));
  }
}

var g_shapesList = [];

function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segment = g_selectedSegment;
    g_shapesList.push(point);
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segment = g_selectedSegment;
    g_shapesList.push(point);
  } else if (g_selectedType == CIRCLE) {
    point = new Circle();
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segment = g_selectedSegment;
    g_shapesList.push(point);
  } else if (g_selectedType == DRAWING) {
    // Draw a diamond at the center
    let diamond = new Rectangle();
    diamond.position = [0, 0];
    diamond.color = g_selectedColor.slice();
    diamond.size = 40;
    diamond.segment = g_selectedSegment;
    g_shapesList.push(diamond);

    // Draw two reflected triangles at the center
    let reflected = new Rectangle();
    reflected.position = [0.5, 0];
    reflected.color = g_selectedColor.slice();
    reflected.size = 40;
    reflected.segment = g_selectedSegment;
    g_shapesList.push(reflected);

    // Draw a yellow Sun circle at the top
    let circle = new Circle();
    circle.position = [0.0, 0.5];
    circle.color = [1.0, 1.0, 0.0, 1.0];
    circle.size = 40;
    circle.segment = 16;
    g_shapesList.push(circle);
  }

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Draw every shape that is supposed to be in the canvas
  renderAllShapes();

}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function renderAllShapes() {// I could not include the performance monitoring code because I do not have NodeJS setup
  // Check the time at the start of the function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the body cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  // Draw a left arm
  var yellow = new Cube();
  yellow.color = [1, 1, 0, 1];
  yellow.matrix.setTranslate(0, -0.5, 0.0);
  yellow.matrix.rotate(-5, 1, 0, 0);

  yellow.matrix.rotate(-g_yellowAngle, 0, 0); // Custom rotation matrix

  //  if (g_yellowAnimation === true) {
  //  yellow.matrix.rotate(45 * Math.sin(g_seconds), 0, 0, 1); // Custom animation
  //} else {
  //  yellow.matrix.rotate(-g_yellowAngle, 0, 0); / / Custom rotation matrix
  //}

  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, 0.7, 0.5);
  yellow.matrix.translate(-0.5, 0, 0);
  yellow.render();

  // Test box
  var magenta = new Cube();
  magenta.color = [1, 0, 1, 1];
  magenta.matrix = yellowCoordinatesMat; // Setting box to be leftArm's coordinates
  magenta.matrix.translate(0, 0.65, 0);
  magenta.matrix.rotate(g_magentaAngle, 0, 0, 1); // Custom rotation matrix
  magenta.matrix.scale(0.3, 0.3, 0.3);
  magenta.matrix.translate(-0.5, 0, - 0.001);
  //magenta.matrix.translate(-0.1, 0.1, 0, 0);
  //magenta.matrix.rotate(-30, 1, 0, 0);
  //magenta.matrix.scale(0.2, 0.4, 0.2);
  magenta.render();

  // A bunch of rotating cubes
  var K = 300.0;
  for (var i = 1; i < K; i++) {
    var c = new Cube();
    c.matrix.translate(-0.8, 1.9 * i / K - 1.0, 0);
    c.matrix.rotate(g_seconds * 100, 1, 1, 1);
    c.matrix.scale(0.1, 0.5 / K, 1.0 / K);
    c.render();
  }

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration), "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get: " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}