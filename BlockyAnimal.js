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


// Globals related to UI elements
// Angle's Global
let g_globalAngle = 0;
// Front-Left Leg's Globals
let g_frontLeftLegThighAngle = 0;
let g_frontLeftLegPawAngle = 0;
let g_frontLeftLegThighAnimation = false;
let g_frontLeftLegPawAnimation = false;
// Front-Right Leg's Globals
let g_frontRightLegThighAngle = 0;
let g_frontRightLegPawAngle = 0;
let g_frontRightLegThighAnimation = false;
let g_frontRightLegPawAnimation = false;
// Back-Left Leg's Globals
let g_backLeftLegThighAngle = 0;
let g_backLeftLegPawAngle = 0;
let g_backLeftLegThighAnimation = false;
let g_backLeftLegPawAnimation = false;
// Back-Right Leg's Globals
let g_backRightLegThighAngle = 0;
let g_backRightLegPawAngle = 0;
let g_backRightLegThighAnimation = false;
let g_backRightLegPawAnimation = false;
// Bottom Tail's Globals
let g_tailAngle = 0;
let g_tailAnimation = false;


// Set up actions for the HTMl UI elements
function addActionsForHTMLUI() {
  // Front-Left Leg's Button Events
  document.getElementById('animationfrontLeftLegThighOffButton').onclick = function () { g_frontLeftLegThighAnimation = false; };
  document.getElementById('animationfrontLeftLegThighOnButton').onclick = function () { g_frontLeftLegThighAnimation = true; };
  document.getElementById('animationfrontLeftLegPawOffButton').onclick = function () { g_frontLeftLegPawAnimation = false; };
  document.getElementById('animationfrontLeftLegPawOnButton').onclick = function () { g_frontLeftLegPawAnimation = true; };

  // Front-Right Leg's Button Events
  document.getElementById('animationfrontRightLegThighOffButton').onclick = function () { g_frontRightLegThighAnimation = false; };
  document.getElementById('animationfrontRightLegThighOnButton').onclick = function () { g_frontRightLegThighAnimation = true; };
  document.getElementById('animationfrontRightLegPawOffButton').onclick = function () { g_frontRightLegPawAnimation = false; };
  document.getElementById('animationfrontRightLegPawOnButton').onclick = function () { g_frontRightLegPawAnimation = true; };
  document.getElementById('animationfrontLeftLegThighOffButton').onclick = function () { g_frontLeftLegThighAnimation = false; };

  // Back-Left Leg's Button Events
  document.getElementById('animationbackLeftLegThighOnButton').onclick = function () { g_backLeftLegThighAnimation = true; };
  document.getElementById('animationbackLeftLegPawOffButton').onclick = function () { g_backLeftLegPawAnimation = false; };
  document.getElementById('animationbackLeftLegPawOnButton').onclick = function () { g_backLeftLegPawAnimation = true; };

  // Back-Right Leg's Button Events
  document.getElementById('animationbackRightLegThighOffButton').onclick = function () { g_backRightLegThighAnimation = false; };
  document.getElementById('animationbackRightLegThighOnButton').onclick = function () { g_backRightLegThighAnimation = true; };
  document.getElementById('animationbackRightLegPawOffButton').onclick = function () { g_backRightLegPawAnimation = false; };
  document.getElementById('animationbackRightLegPawOnButton').onclick = function () { g_backRightLegPawAnimation = true; };
  
  // Tail's Button Events
  document.getElementById('animationTailOffButton').onclick = function () { g_tailAnimation = false; };
  document.getElementById('animationTailOnButton').onclick = function () { g_tailAnimation = true; };
  
  // Front-Left Leg's Color Slider Events
  document.getElementById('frontLeftLegPawSlide').addEventListener('mousemove', function () { g_frontLeftLegPawAngle = this.value; renderAllShapes(); });
  document.getElementById('frontLeftLegThighSlide').addEventListener('mousemove', function () { g_frontLeftLegThighAngle = this.value; renderAllShapes(); });
  
  // Front-Right Leg's Color Slider Events
  document.getElementById('frontRightLegPawSlide').addEventListener('mousemove', function () { g_frontRightLegPawAngle = this.value; renderAllShapes(); });
  document.getElementById('frontRightLegThighSlide').addEventListener('mousemove', function () { g_frontRightLegThighAngle = this.value; renderAllShapes(); });

  // Back-Left Leg's Color Slider Events
  document.getElementById('backLeftLegPawSlide').addEventListener('mousemove', function () { g_backLeftLegPawAngle = this.value; renderAllShapes(); });
  document.getElementById('backLeftLegThighSlide').addEventListener('mousemove', function () { g_backLeftLegThighAngle = this.value; renderAllShapes(); });

  // Back-Right Leg's Color Slider Events
  document.getElementById('backRightLegPawSlide').addEventListener('mousemove', function () { g_backRightLegPawAngle = this.value; renderAllShapes(); });
  document.getElementById('backRightLegThighSlide').addEventListener('mousemove', function () { g_backRightLegThighAngle = this.value; renderAllShapes(); });
  
  // Tail's Color Slider Events
  document.getElementById('tailSlide').addEventListener('mousemove', function () { g_TailAngle = this.value; renderAllShapes(); });

  // Angle Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
}


function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader progress and other GLSL variables 
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHTMLUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Render
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
  // Delaying movement of the right side compared to left side for realism
  if (g_frontLeftLegThighAnimation === true) {
    g_frontLeftLegThighAngle = (30 * Math.sin(g_seconds));
  }
  if (g_frontLeftLegPawAnimation === true) {
    g_frontLeftLegPawAngle = (30 * Math.sin(3 * g_seconds));
  }
  if (g_frontRightLegThighAnimation === true) {
    g_frontRightLegThighAngle = (30 * Math.cos(g_seconds));
  }
  if (g_frontRightLegPawAnimation === true) {
    g_frontRightLegPawAngle = (30 * Math.cos(3 * g_seconds));
  }
  if (g_backLeftLegThighAnimation === true) {
    g_backLeftLegThighAngle = (30 * Math.sin(g_seconds));
  }
  if (g_backLeftLegPawAnimation === true) {
    g_backLeftLegPawAngle = (30 * Math.sin(3 * g_seconds));
  }
  if (g_backRightLegThighAnimation === true) {
    g_backRightLegThighAngle = (30 * Math.cos(g_seconds));
  }
  if (g_backRightLegPawAnimation === true) {
    g_backRightLegPawAngle = (30 * Math.cos(3 * g_seconds));
  }
  if (g_tailAnimation === true) {
    g_tailAngle = (60 * Math.cos(g_seconds)); // Double the speed of walking with a leg
  }
}


var g_shapesList = [];


function renderAllShapes() {
  // Check the time at the start of the function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the body cube
  var body = new Cube(); // Creating the body as a large rectangle
  body.color = [0.752, 0.752, 0.752, 1]; // Coloring the body silver
  body.matrix.translate(-0.25, -0.025, 0.0); // X and Y placements for the body
  body.matrix.rotate(-5, 1, 0, 0); // Set rotation for the body
  body.matrix.scale(0.7, 0.5, 0.7); // Scaling for the body
  body.render(); // Rendering for the body

  // Draw a front-left leg's thigh
  var frontLeftLegThigh = new Cube(); // Creating the front-left leg's thigh as a small rectangle
  frontLeftLegThigh.color = [0.662, 0.662, 0.662, 1]; // Coloring it dark gray
  frontLeftLegThigh.matrix.setTranslate(-0.12, 0, 0.0); // X placement for the whole front-left leg
  frontLeftLegThigh.matrix.rotate(-5, 1, 0, 0); // Rotation for the whole front-left leg
  frontLeftLegThigh.matrix.rotate(-g_frontLeftLegThighAngle, 0, 0); // Setting the animation rotation for the whole front-left leg
  frontLeftLegThigh.matrix.scale(0.5, -0.5, 0.5); // Flipping the whole front-left leg vertically and scaling it by 1/2th
  var frontLeftLegThighCoordinatesMat = new Matrix4(frontLeftLegThigh.matrix); // Setting the coordinate system for the whole left leg to be the front-left leg's thigh
  frontLeftLegThigh.matrix.scale(0.25, 0.75, 0.25); // Setting the custom 1/4th, 3/4th, 1/4th scale for the front-left leg's thigh
  frontLeftLegThigh.matrix.translate(-0.5, 0, 0); // Setting the custom X placement for the front-left leg's thigh
  frontLeftLegThigh.render(); // Rendering the front-left leg's thigh

  // Draw a front-left leg's paw
  var frontLeftLegPaw = new Cube(); // Creating the front-left leg's paw as a small rectangle
  frontLeftLegPaw.color = [0.5, 0.25, 0.1, 1]; // Coloring the front-left leg's paw as brown because black would be too hard to see
  frontLeftLegPaw.matrix = frontLeftLegThighCoordinatesMat; // Setting the coordinate system for the whole front-left leg to be the front-left leg's thigh
  frontLeftLegPaw.matrix.translate(0, 0.65, 0); // Setting the custom Y placement for the front-left leg's paw
  frontLeftLegPaw.matrix.rotate(-g_frontLeftLegPawAngle, 0, 0, 1); // Setting the animation rotation for the whole front-left leg
  frontLeftLegPaw.matrix.scale(0.20, 0.25, 0.20); // Setting the custom 1/5th, 1/4th, 1/5th scale for the front-left leg's paw
  frontLeftLegPaw.matrix.translate(-0.5, 0.45, -0.001); // Setting the custom X, Y, and Z (to avoid z-buffering) placement for the front-left leg's paw
  frontLeftLegPaw.render(); // Rendering the front-left leg's paw

  // Draw a front-right leg's thigh
  var frontRightLegThigh = new Cube(); // Creating the front-right leg's thigh as a small rectangle
  frontRightLegThigh.color = [0.662, 0.662, 0.662, 1]; // Coloring it dark gray
  frontRightLegThigh.matrix.setTranslate(-0.12, 0, 0.5); // X placement for the whole front-right leg
  frontRightLegThigh.matrix.rotate(-5, 1, 0, 0); // Rotation for the whole left leg
  frontRightLegThigh.matrix.rotate(-g_frontRightLegThighAngle, 0, 0); // Setting the animation rotation for the whole front-right leg
  frontRightLegThigh.matrix.scale(0.5, -0.5, 0.5); // Flipping the whole front-right leg vertically and scaling it by 1/2th
  var frontRightLegThighCoordinatesMat = new Matrix4(frontRightLegThigh.matrix); // Setting the coordinate system for the whole front-right leg to be the front-right leg's thigh
  frontRightLegThigh.matrix.scale(0.25, 0.75, 0.25); // Setting the custom 1/4th, 3/4th, 1/4th scale for the front-right leg's thigh
  frontRightLegThigh.matrix.translate(-0.5, 0, 0); // Setting the custom X placement for the front-right leg's thigh
  frontRightLegThigh.render(); // Rendering the front-right leg's thigh

  // Draw a front-right leg's paw
  var frontRightLegPaw = new Cube(); // Creating the front-right leg's paw as a small rectangle
  frontRightLegPaw.color = [0.5, 0.25, 0.1, 1]; // Coloring the front-right leg's paw as brown because black would be too hard to see
  frontRightLegPaw.matrix = frontRightLegThighCoordinatesMat; // Setting the coordinate system for the whole front-right leg to be the front-right leg's thigh
  frontRightLegPaw.matrix.translate(0, 0.65, 0); // Setting the custom Y placement for the front-right leg's paw
  frontRightLegPaw.matrix.rotate(-g_frontRightLegPawAngle, 0, 0, 1); // Setting the animation rotation for the whole front-right leg
  frontRightLegPaw.matrix.scale(0.20, 0.25, 0.20); // Setting the custom 1/5th, 1/4th, 1/5th scale for the front-right leg's paw
  frontRightLegPaw.matrix.translate(-0.5, 0.45, -0.001); // Setting the custom X, Y, and Z (to avoid z-buffering) placement for the front-right leg's paw
  frontRightLegPaw.render(); // Rendering the front-right leg's paw

  // Draw a back-left leg's thigh
  var backLeftLegThigh = new Cube(); // Creating the back-left leg's thigh as a small rectangle
  backLeftLegThigh.color = [0.662, 0.662, 0.662, 1]; // Coloring it dark gray
  backLeftLegThigh.matrix.setTranslate(0.25, 0, 0.0); // X placement for the whole back-left leg
  backLeftLegThigh.matrix.rotate(-5, 1, 0, 0); // Rotation for the whole back-left leg
  backLeftLegThigh.matrix.rotate(-g_backLeftLegThighAngle, 0, 0); // Setting the animation rotation for the whole back-left leg
  backLeftLegThigh.matrix.scale(0.5, -0.5, 0.5); // Flipping the whole back-left leg vertically and scaling it by 1/2th
  var backLeftLegThighCoordinatesMat = new Matrix4(backLeftLegThigh.matrix); // Setting the coordinate system for the whole back-left leg to be the back-left leg's thigh
  backLeftLegThigh.matrix.scale(0.25, 0.75, 0.25); // Setting the custom 1/4th, 3/4th, 1/4th scale for the back-left leg's thigh
  backLeftLegThigh.matrix.translate(-0.5, 0, 0); // Setting the custom X placement for the back-left leg's thigh
  backLeftLegThigh.render(); // Rendering the back-left leg's thigh

  // Draw a back-left leg's paw
  var backLeftLegPaw = new Cube(); // Creating the back-left leg's paw as a small rectangle
  backLeftLegPaw.color = [0.5, 0.25, 0.1, 1]; // Coloring the back-left leg's paw as brown because black would be too hard to see
  backLeftLegPaw.matrix = backLeftLegThighCoordinatesMat; // Setting the coordinate system for the whole back-left leg to be the front-left leg's thigh
  backLeftLegPaw.matrix.translate(0, 0.65, 0); // Setting the custom Y placement for the back-left leg's paw
  backLeftLegPaw.matrix.rotate(-g_backLeftLegPawAngle, 0, 0, 1); // Setting the animation rotation for the whole back-left leg
  backLeftLegPaw.matrix.scale(0.20, 0.25, 0.20); // Setting the custom 1/5th, 1/4th, 1/5th scale for the back-left leg's paw
  backLeftLegPaw.matrix.translate(-0.5, 0.45, -0.001); // Setting the custom X, Y, and Z (to avoid z-buffering) placement for the back-left leg's paw
  backLeftLegPaw.render(); // Rendering the back-left leg's paw

  // Draw a back-right leg's thigh
  var backRightLegThigh = new Cube(); // Creating the back-right leg's thigh as a small rectangle
  backRightLegThigh.color = [0.662, 0.662, 0.662, 1]; // Coloring it dark gray
  backRightLegThigh.matrix.setTranslate(0.25, 0, 0.5); // X placement for the whole back-right leg
  backRightLegThigh.matrix.rotate(-5, 1, 0, 0); // Rotation for the whole left leg
  backRightLegThigh.matrix.rotate(-g_backRightLegThighAngle, 0, 0); // Setting the animation rotation for the whole back-right leg
  backRightLegThigh.matrix.scale(0.5, -0.5, 0.5); // Flipping the whole back-right leg vertically and scaling it by 1/2th
  var backRightLegThighCoordinatesMat = new Matrix4(backRightLegThigh.matrix); // Setting the coordinate system for the whole front-right leg to be the back-right leg's thigh
  backRightLegThigh.matrix.scale(0.25, 0.75, 0.25); // Setting the custom 1/4th, 3/4th, 1/4th scale for the back-right leg's thigh
  backRightLegThigh.matrix.translate(-0.5, 0, 0); // Setting the custom X placement for the back-right leg's thigh
  backRightLegThigh.render(); // Rendering the back-right leg's thigh

  // Draw a back-right leg's paw
  var backRightLegPaw = new Cube(); // Creating the back-right leg's paw as a small rectangle
  backRightLegPaw.color = [0.5, 0.25, 0.1, 1]; // Coloring the back-right leg's paw as brown because black would be too hard to see
  backRightLegPaw.matrix = backRightLegThighCoordinatesMat; // Setting the coordinate system for the whole back-right leg to be the back-right leg's thigh
  backRightLegPaw.matrix.translate(0, 0.65, 0); // Setting the custom Y placement for the back-right leg's paw
  backRightLegPaw.matrix.rotate(-g_backRightLegPawAngle, 0, 0, 1); // Setting the animation rotation for the whole back-right leg
  backRightLegPaw.matrix.scale(0.20, 0.25, 0.20); // Setting the custom 1/5th, 1/4th, 1/5th scale for the back-right leg's paw
  backRightLegPaw.matrix.translate(-0.5, 0.45, -0.001); // Setting the custom X, Y, and Z (to avoid z-buffering) placement for the back-right leg's paw
  backRightLegPaw.render(); // Rendering the back-right leg's paw

  // Draw a crown
  var crown = new Prism();
  crown.color = [1, 0.843, 0, 1]; // Coloring the crown gold
  crown.matrix.translate(-0.5, 0.75, 0.15); // Setting the crown's placement on the top of the head
  crown.matrix.scale(0.5, 0.25, 0.25); // Scaling the crown
  crown.render(); // Rendering the crown

  // Draw a head
  var head = new Cube();
  head.color = [0.827, 0.827, 0.827, 1]; // Coloring the head light gray
  head.matrix.translate(-0.5, 0.5, 0.15); // Setting the head's placement at the top of the body
  head.matrix.scale(0.25, 0.25, 0.25); // Scaling the crown
  head.render();

  // Draw a tail
  var tail = new Cube(); // Creating the bottom tail as a small rectangle
  tail.color = [0.662, 0.662, 0.662, 1]; // Coloring it dark gray
  tail.matrix.translate(0.45, 0.5, 0.15); // X and Z placement for the tail
  tail.matrix.rotate(-0.75, 1, 0, 0); // Rotation for the tail
  tail.matrix.rotate(-g_tailAngle, 0, 0); // Setting the animation rotation for the tail
  tail.matrix.scale(0.2, 0.4, 0.2); // Flipping the tail vertically and scaling it by 1/2th
  /*tail.matrix.scale(0.25, 0.75, 0.25); // Setting the custom 1/4th, 3/4th, 1/4th scale for the tail
  tail.matrix.translate(-0.5, 0, 0); // Setting the custom X placement for the bottom tail*/
  tail.render(); // Rendering the bottom tail

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