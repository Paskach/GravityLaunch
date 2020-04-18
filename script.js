var ROCKET_MASS = 2; //kg
var EARTH_MASS = 1000; // m/s^2
var MOON_MASS = 1000/2; // m/s^2
var GRAV = 10; //Fictional gravitational constant
var GRAV_EXP_MOD = 0.9;


var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var rocketImg = document.getElementById('rocket');
var earthImg = document.getElementById('earth');
var moonImg = document.getElementById('moon');
var stationImg = document.getElementById('station');
var stationGreenImg = document.getElementById('stationGreen');

var blastSound = document.createElement('audio');
var dockSound = document.createElement('audio');
var crashSound = document.createElement('audio');
var tryAgainSound = document.createElement('audio');
var dingSound = document.createElement('audio');
blastSound.src = 'blastoff.mp3';
dockSound.src = 'dock.mp3';
crashSound.src = 'crash.mp3';
tryAgainSound.src = 'tryagain.mp3'
dingSound.src = 'ding.mp3'

var earthDia = 40;
var moonDia = 15;
var stationDia = 15;
var earthY = 0;
var moonY = 0;
var earthX = 0;
var moonX = 0;
var rocketY = 0;
var rocketX = 0;
var rocketOldX = 0;
var rocketOldY = 0;
var stations = [[0, 0], [0, 0], [0, 0]];
var stationsDocked = [false, false, false];
var stationBob = 0;
var stationBobVel = 0.02;

var frameNumber = 0;

var isFlying = false;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, c.width, c.height);

reset();
newLevel();

var gameFrame;// = setInterval(frame, 10);

function newLevel()
{
  earthY = Math.floor(Math.random() * 200) + 300;
  moonY  = Math.floor(Math.random() * 200) + 100;
  clearInterval(gameFrame);
  reset();
  frame();
  calculateStations();
  //reset();
  gameFrame = setInterval(frame, 10);
  reset();
}

function reset()
{
  earthX = 100;
  moonX = c.width - 150
  rocketX = earthX;
  rocketY = earthY - earthDia/2;
  rocketOldX = rocketX;
  rocketOldY = rocketY;
  stationsDocked = [false, false, false];
}

function calculateStations()
{
  frameNumber = 0;
  while(frameNumber < 800)
  {
    frameNumber = 0;
    var t = Math.floor(Math.random() * 50) / 100 + 6;
    var a = Math.floor(Math.random() * 100) / 100 * 180;
    //console.log('thrust: ' + t + '  angle: ' + a);
    reset();
    calcLaunch(t, a);
    while(frameNumber < 800 && !colliding() && !outOfBounds())
    {
      calcFrame();
    }
  }
  reset();
}

function launch()
{
  reset();
  var realThrust = document.getElementById('thrustVal').value;
  var a = (document.getElementById('angleVal').value) * (Math.PI / 180);
  rocketX -= realThrust * Math.cos(a);
  rocketY -= realThrust * Math.sin(a);
  isFlying = true;
  frameNumber = 0;
  frame();
  blastSound.play();
}

function calcLaunch(t, a)
{
  rocketX -= t * Math.cos(a * (Math.PI / 180));
  rocketY -= t * Math.sin(a * (Math.PI / 180));
}

function frame()
{

  //Clear screen
  frameNumber += 1;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);

  /*
  var i;
  var j;
  for(i = 0; i < c.height; i += 20)
  {
    for(j = 0; j < c.width; j += 20)
    {
      var earthForce = (GRAV * ROCKET_MASS * EARTH_MASS) / Math.pow((Math.pow((j - earthX), 2) + Math.pow((i - earthY), 2)), GRAV_EXP_MOD);
      var moonForce = (GRAV * ROCKET_MASS * MOON_MASS) / Math.pow((Math.pow((j - moonX), 2) + Math.pow((i - moonY), 2)), GRAV_EXP_MOD);
      var netForce = earthForce + moonForce;
      ctx.fillStyle = 'rgb('+ 255*netForce +', ' + 255*netForce + ', ' + 255*netForce + ')';
      ctx.fillRect(j, i, 1, 1);
    }
  }
  */


  //Draw Sprites
  ctx.drawImage(earthImg, earthX - earthDia/2, earthY - earthDia/2, earthDia, earthDia);
  ctx.drawImage(moonImg, moonX - moonDia/2, moonY - moonDia/2, moonDia, moonDia);
  ctx.drawImage(stationsDocked[0] ? stationGreenImg : stationImg, stations[0][0] - stationDia/2 + stationBob/2, stations[0][1] - stationDia/2 - stationBob, stationDia, stationDia);
  ctx.drawImage(stationsDocked[1] ? stationGreenImg : stationImg, stations[1][0] - stationDia/2 + stationBob/2, stations[1][1] - stationDia/2 - stationBob, stationDia, stationDia);
  ctx.drawImage(stationsDocked[2] ? stationGreenImg : stationImg, stations[2][0] - stationDia/2 + stationBob/2, stations[2][1] - stationDia/2 - stationBob, stationDia, stationDia);

  var rocketOffsetX = 1;
  var rocketOffsetY = -1;
  ctx.translate(rocketX + rocketOffsetX, rocketY + rocketOffsetY);
  if(isFlying)
  {
    ctx.rotate((rocketX > rocketOldX ? 0 : Math.PI) +(Math.PI / 2) + Math.atan((rocketY - rocketOldY) / (rocketX - rocketOldX)));
    ctx.drawImage(rocketImg, -5, -8, 10, 10);
    ctx.rotate(-(rocketX > rocketOldX ? 0 : Math.PI) -(Math.PI / 2) - Math.atan((rocketY - rocketOldY) / (rocketX - rocketOldX)));
  }
  else
  {
    var a = (document.getElementById('angleVal').value - 90) * (Math.PI / 180);
    ctx.rotate(a);
    ctx.drawImage(rocketImg, -5, -8, 10, 10);
    ctx.rotate(-a);
  }
  ctx.translate(-rocketX - rocketOffsetX, -rocketY - rocketOffsetY);


  //Update control panel values
  document.getElementById('thrustVal').value = document.getElementById('thrust').value / 100 + 5.5;
  document.getElementById('angleVal').value = document.getElementById('angle').value / 100 * 180;

  if(colliding() && isFlying)
  {
    crashSound.play();
    isFlying = false;
    reset();
  }
  if(outOfBounds() && isFlying)
  {
    isFlying = false;
    tryAgainSound.play();
    reset();
  }
  if(frameNumber > 1600 && isFlying)
  {
    isFlying = false;
    tryAgainSound.play();
    reset();
  }
  stationBob += stationBobVel;
  if(stationBob > 2 && stationBobVel > 0)
  {
    stationBobVel = -0.02;
  }
  if(stationBob < -2 && stationBobVel < 0)
  {
    stationBobVel = 0.02;
  }

  //Calculate rocket position
  if(isFlying)
  {
    checkDocks();
    var xVel = rocketX - rocketOldX;
    var yVel = rocketY - rocketOldY;
    var earthForce = (GRAV * ROCKET_MASS * EARTH_MASS) / Math.pow((Math.pow((rocketX - earthX), 2) + Math.pow((rocketY - earthY), 2)), GRAV_EXP_MOD);
    var earthXForce = (rocketX > earthX ? -1 : 1) * earthForce * Math.cos(Math.atan(Math.abs(rocketY - earthY) / Math.abs(rocketX - earthX)));
    var earthYForce = (rocketY > earthY ? -1 : 1) * earthForce * Math.sin(Math.atan(Math.abs(rocketY - earthY) / Math.abs(rocketX - earthX)));
    //-var earthXForce = (GRAV * ROCKET_MASS * EARTH_MASS) / -Math.pow((rocketX - earthX), 2);
    //-var earthYForce = (GRAV * ROCKET_MASS * EARTH_MASS) / -Math.pow((rocketY - earthY), 2);
    var moonForce = (GRAV * ROCKET_MASS * MOON_MASS) / Math.pow((Math.pow((rocketX - moonX), 2) + Math.pow((rocketY - moonY), 2)), GRAV_EXP_MOD);
    var moonXForce = (rocketX > moonX ? -1 : 1) * moonForce * Math.cos(Math.atan(Math.abs(rocketY - moonY) / Math.abs(rocketX - moonX)));
    var moonYForce = (rocketY > moonY ? -1 : 1) * moonForce * Math.sin(Math.atan(Math.abs(rocketY - moonY) / Math.abs(rocketX - moonX)));
    //-var moonXForce = (GRAV * ROCKET_MASS * MOON_MASS) / -Math.pow((rocketX - moonX), 2);
    //-var moonYForce = (GRAV * ROCKET_MASS * MOON_MASS) / -Math.pow((rocketY - moonY), 2);
    var netXForce = earthXForce + moonXForce;
    var netYForce = earthYForce + moonYForce;
    var xAccel = netXForce / ROCKET_MASS;
    var yAccel = netYForce / ROCKET_MASS;
    xVel += 0.02 * xAccel;
    yVel += 0.02 * yAccel;
    rocketOldX = rocketX;
    rocketOldY = rocketY;
    rocketX += xVel;
    rocketY += yVel;
  }
}

function calcFrame()
{
  var rocketOffsetX = 1;
  var rocketOffsetY = -1;
  frameNumber += 1;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(earthImg, earthX - earthDia/2, earthY - earthDia/2, earthDia, earthDia);
  ctx.drawImage(moonImg, moonX - moonDia/2, moonY - moonDia/2, moonDia, moonDia);
  ctx.drawImage(stationImg, stations[0][0] - stationDia/2, stations[0][1] - stationDia/2, stationDia, stationDia);
  ctx.drawImage(stationImg, stations[1][0] - stationDia/2, stations[1][1] - stationDia/2, stationDia, stationDia);
  ctx.drawImage(stationImg, stations[2][0] - stationDia/2, stations[2][1] - stationDia/2, stationDia, stationDia);

  ctx.translate(rocketX + rocketOffsetX, rocketY + rocketOffsetY);
  ctx.rotate((rocketX > rocketOldX ? 0 : Math.PI) +(Math.PI / 2) + Math.atan((rocketY - rocketOldY) / (rocketX - rocketOldX)));
  ctx.drawImage(rocketImg, -5, -8, 10, 10);
  ctx.rotate(-(rocketX > rocketOldX ? 0 : Math.PI) -(Math.PI / 2) - Math.atan((rocketY - rocketOldY) / (rocketX - rocketOldX)));
  ctx.translate(-rocketX - rocketOffsetX, -rocketY - rocketOffsetY);

  var xVel = rocketX - rocketOldX;
  var yVel = rocketY - rocketOldY;
  var earthForce = (GRAV * ROCKET_MASS * EARTH_MASS) / Math.pow((Math.pow((rocketX - earthX), 2) + Math.pow((rocketY - earthY), 2)), GRAV_EXP_MOD);
  var earthXForce = (rocketX > earthX ? -1 : 1) * earthForce * Math.cos(Math.atan(Math.abs(rocketY - earthY) / Math.abs(rocketX - earthX)));
  var earthYForce = (rocketY > earthY ? -1 : 1) * earthForce * Math.sin(Math.atan(Math.abs(rocketY - earthY) / Math.abs(rocketX - earthX)));
  //-var earthXForce = (GRAV * ROCKET_MASS * EARTH_MASS) / -Math.pow((rocketX - earthX), 2);
  //-var earthYForce = (GRAV * ROCKET_MASS * EARTH_MASS) / -Math.pow((rocketY - earthY), 2);
  var moonForce = (GRAV * ROCKET_MASS * MOON_MASS) / Math.pow((Math.pow((rocketX - moonX), 2) + Math.pow((rocketY - moonY), 2)), GRAV_EXP_MOD);
  var moonXForce = (rocketX > moonX ? -1 : 1) * moonForce * Math.cos(Math.atan(Math.abs(rocketY - moonY) / Math.abs(rocketX - moonX)));
  var moonYForce = (rocketY > moonY ? -1 : 1) * moonForce * Math.sin(Math.atan(Math.abs(rocketY - moonY) / Math.abs(rocketX - moonX)));
  //-var moonXForce = (GRAV * ROCKET_MASS * MOON_MASS) / -Math.pow((rocketX - moonX), 2);
  //-var moonYForce = (GRAV * ROCKET_MASS * MOON_MASS) / -Math.pow((rocketY - moonY), 2);
  var netXForce = earthXForce + moonXForce;
  var netYForce = earthYForce + moonYForce;
  var xAccel = netXForce / ROCKET_MASS;
  var yAccel = netYForce / ROCKET_MASS;
  xVel += 0.02 * xAccel;
  yVel += 0.02 * yAccel;
  rocketOldX = rocketX;
  rocketOldY = rocketY;
  rocketX += xVel;
  rocketY += yVel;

  if(frameNumber == 100) stations[0] = [rocketX, rocketY];
  if(frameNumber == 500) stations[1] = [rocketX, rocketY];
  if(frameNumber == 700) stations[2] = [rocketX, rocketY];
}

function colliding()
{
  var earthD = Math.sqrt(Math.pow(rocketY - earthY, 2) + Math.pow(rocketX - earthX, 2));
  var moonD = Math.sqrt(Math.pow(rocketY - moonY, 2) + Math.pow(rocketX - moonX, 2));
  //return outOfBounds;
  return earthD < 20 || moonD < 8;
}
function outOfBounds()
{
  return (rocketX < 0) || (rocketX > c.width) || (rocketY < 0) || (rocketY > c.height);
}
function checkDocks()
{
  for(var s = 0; s < 3; s++)
  {
    var d = Math.sqrt(Math.pow(rocketY - stations[s][1], 2) + Math.pow(rocketX - stations[s][0], 2));
    if(d < 15 && stationsDocked[s] == false)
    {
      stationsDocked[s] = true;
      dockSound.play();
    }
  }
  if(stationsDocked.every(checkDocked))
  {
    dingSound.play();
    isFlying = false;
    newLevel();
  }
}
function checkDocked(station)
{
  return station;
}
