// Initialize canvas and context
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const onScreenPrompt = document.getElementById('instructions')
let hasMoved = false;
let projectiles = [];
var currentRoom = 0;
var enemies = []
// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//create new image object
const playerSprite = new Image();
playerSprite.src = 'sprites/pixil-frame-0.png'

// Create player object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 4,
    width: 128,
    height: 128,
    image: playerSprite,
    canFire: false,
    angleX: 0, // Add angle property
    angleY:0,
    draw: function() {
      ctx.save(); // Save the current state of the canvas
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the player
      ctx.rotate(this.angle); // Rotate by the angle
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height); // Draw the player centered on the current position
      ctx.restore(); // Restore the previous state of the canvas
    }
  };
  

// Create walls around the screen
class Wall {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.fillStyle = "grey";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// weapon class
class Weapon {
    constructor(x, y, width, height, fireRate, ammo) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.acquired = false; //weapons spawn as unacquired
      this.fireRate = fireRate;
      this.ammo = ammo;
    }
  
    draw() {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  
    acquire() {
      this.acquired = true; //once picked up the weapon is acquired
      this.width = 0;
      this.height = 0;
    }
  }

class Projectile {
    constructor(x, y, dirX, dirY, speed) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = speed;
        this.radius = 5; // radius of the projectile
    }

    update() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
    }
}
  

  //create  weapons
const weapon2 = new Weapon(100, 100, 50, 50, 3, 10);

  

var walls = [
  new Wall(0, 0, canvas.width, 10), // top wall
  new Wall(0, canvas.height - 10, canvas.width, 10), // bottom wall
  new Wall(0, 0, 10, canvas.height), // left wall
  new Wall(canvas.width - 10, 0, 10, canvas.height), // right wall
];

// Handle keyboard input
const keys = {};

document.addEventListener("keydown", function(e) {
  keys[e.code] = true;
});

document.addEventListener("keyup", function(e) {
  keys[e.code] = false;
});

//fire projectile function
function fireProjectile(playerX, playerY, playerDirX, playerDirY) {
    var projectile = {
      x: playerX,
      y: playerY,
      speed: 5,
      dirX: playerDirX,
      dirY: playerDirY,
      update: function() {
        this.x += this.speed * playerDirX;
        this.y += this.speed * playerDirY;
      },
      draw: function() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 5, 5);
      }
    };
    
    projectiles.push(projectile);

     
  }


  //ENEMIES
  var enemies = [];

  // create an Enemy object
  function Enemy(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  
    // update the enemy's position
    this.update = function() {
      this.x += this.speed;
      if (this.x > canvas.width) {
        // remove the enemy when it goes off the screen
        enemies.splice(enemies.indexOf(this), 1);
      }
    };
  
    // draw the enemy on the canvas
    this.draw = function() {
      ctx.fillStyle = "green";
      ctx.fillRect(this.x, this.y, 30, 30);
    };
  }
  
  // function to create a random enemy
  function createRandomEnemy() {
    var numEnemies = Math.floor(Math.random() * 10) + 1; // Generate 1-10 enemies
    if (Math.random() < 0.7) {
      numEnemies = 3; // 70% chance of generating 3 enemies
    }
    for (var i = 0; i < numEnemies; i++) {
      var randSpeed = Math.floor(Math.random() * 3) + 1
      var enemy = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: randSpeed,
        dirX: 0,
        dirY: 0,
        draw: function() {
          ctx.fillStyle = "green";
          ctx.fillRect(this.x, this.y, 10, 10);
        },
        update: function(playerX, playerY){
          var dx = playerX - this.x;
          var dy = playerY - this.y;
          var distance = Math.sqrt(dx*dx + dy*dy);
          var speed = 1;
          this.x += speed * dx / distance;
          this.y += speed * dy / distance;
        }
      };
      // Set enemy direction towards player
      var dx = player.x - enemy.x;
      var dy = player.y - enemy.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      enemy.dirX = dx / distance;
      enemy.dirY = dy / distance;
      enemies.push(enemy);
    }
  }
  
// Call createRandomEnemy function when player enters a new room
function enterNewRoom() {
  currentRoom++;
  enemies = []; // clear existing enemies
  createRandomEnemy(); // generate new enemies
}



  
  // update and draw all enemies on the canvas
  function updateEnemies() {
    for (var i = 0; i < enemies.length; i++) {
      enemies[i].update(player.x, player.y);
      enemies[i].draw();
    }
  }


  
  

// Create the beginning weapon object
const beginWeapon = new Weapon(50, 50, 25, 25, 5, 20);

// Define game loop
async function gameLoop() {


    // Update game state


    // CONTROLS -- ACCOUNT FOR ANGLES VIA PLAYER ANGLE X AND Y
    if (keys["ArrowUp"] && player.y > 15) { // If the "ArrowUp" key is pressed and the player is not at the top edge of the screen
        player.y -= player.speed; // Move the player upwards
        hasMoved = true;
        player.angleY = -1
        if(keys["ArrowLeft"] && player.x > 0){
          player.angleX = -1
        }
        else if(keys["ArrowRight"] && player.x + player.width < canvas.width){
          player.angleX = 1
        }
        else{
          player.angleX = 0
        }
      }
      if (keys["ArrowDown"] && player.y + player.height < canvas.height) { // If the "ArrowDown" key is pressed and the player is not at the bottom edge of the screen
        player.y += player.speed; // Move the player downwards
        hasMoved = true;
        player.angleY = 1
        if(keys["ArrowLeft"] && player.x > 0){
          player.angleX = -1
        }
        else if(keys["ArrowRight"] && player.x + player.width < canvas.width){
          player.angleX = 1
        }
        else{
          player.angleX = 0
        }
      }
      if (keys["ArrowLeft"] && player.x > 0) { // If the "ArrowLeft" key is pressed and the player is not at the left edge of the screen
        player.x -= player.speed; // Move the player to the left
        hasMoved = true;
        player.angleX = -1
        if(keys["ArrowUp"] && player.y > 15){
          player.angleY = -1
        }
        else if(keys["ArrowDown"] && player.y + player.height < canvas.height){
          player.angleY = 1
        }
        else{
          player.angleY = 0
        }
      }
      if (keys["ArrowRight"] && player.x + player.width < canvas.width) { // If the "ArrowRight" key is pressed and the player is not at the right edge of the screen
        player.x += player.speed; // Move the player to the right
        hasMoved = true;
        player.angleX = 1
        if(keys["ArrowUp"] && player.y > 15){
          player.angleY = -1
        }
        else if(keys["ArrowDown"] && player.y + player.height < canvas.height){
          player.angleY = 1
        }
        else{
          player.angleY = 0
        }
      }
  
    
  




    // Check for collisions with WALL
    for (let i = 0; i < walls.length; i++) {
      if (rectIntersect(player.x, player.y, player.width, player.height, walls[i].x, walls[i].y, walls[i].width, walls[i].height)) {
        console.log("Collision detected!"); //collision with the WALL detected
      }
    }

    // Check for collisions with FIRST WEAPON
    for (let i = 0; i < walls.length; i++) {
        if (rectIntersect(player.x, player.y, player.width, player.height, beginWeapon.x, beginWeapon.y, beginWeapon.width, beginWeapon.height)) {
          console.log("Collision with WEAPON!"); //collision with the FIRST WEAPON detected
          
          //make weapon dissapear
          beginWeapon.acquire();
          await enterNewRoom();

          //player can fire weapons now
          player.canFire = true;

            // change on screen prompt to shoot
            onScreenPrompt.innerHTML = `
            <h1>Shoot!</h1>
            <div class="arrow-container">

            <img src="icons/spacebar.png" alt="Shoot!">
            <p>press spacebar</p>
            
            </div>
    `
            //open all 4 sides
            walls = [
                new Wall(0, 0, (canvas.width / 2) - 80, 10), // top wall with open section LEFt
                new Wall(canvas.width / 2 + 80, 0, (canvas.width / 2) - 80, 10), // top wall with open section RIGHT
                
                new Wall(0, canvas.height - 10, canvas.width / 2 - 80, 10), // bottom wall with open section LEFT
                new Wall(canvas.width / 2 + 80, canvas.height - 10, canvas.width - 20, 10), // bottom wall with open section RIGHT

                new Wall(0, 10, 10, canvas.height / 2 - 80), // left wall with open section TOP
                new Wall(0, canvas.height / 2 + 80, 10, canvas.height / 2 - 80), // left wall with open section BOTTOM

                new Wall(canvas.width - 10, 10, 10, canvas.height / 2 - 80), // right wall with open section TOP
                new Wall(canvas.width - 10, canvas.height / 2 + 80, 10, canvas.height / 2 - 80), // right wall with open section BOTTOM
                
              ];

            //give palyer shooting abilities

          
        }
      }
    
 
    // Render graphics
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < walls.length; i++) {
      walls[i].draw();
    }
     // Render beginWeapon at top left corner if player has moved
    if (hasMoved && !beginWeapon.acquired) {
        beginWeapon.x = 25;
        beginWeapon.y = 25;
        beginWeapon.draw();
    }

    player.draw();

     // Update projectiles
     for (var i = 0; i < projectiles.length; i++) {
      projectiles[i].update();
      projectiles[i].draw()
  }

  updateEnemies();
  
    // Call game loop again
    requestAnimationFrame(gameLoop);
  }
  

// Start the game loop
gameLoop();

// Utility functions -- checking for collsion of two rectangles using their coordinates, height, and width
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}






//event listeners
// Add key event listener for spacebar
document.addEventListener("keydown", function(event) {
    if (keys['Space'] === true) {
      // Check if player can fire
      if (player.canFire) {
        onScreenPrompt.innerHTML = ''
        // Call fireProjectile function with player's position and direction
        fireProjectile(player.x + player.width/2, player.y + player.height/2, player.angleX, player.angleY);
        // Set canFire to false to prevent rapid firing
        player.canFire = false;
        // Set a timeout to reset canFire after a delay
        setTimeout(function() {
            console.log('pew')
          player.canFire = true;
        }, 50); // Change this value to adjust fire rate
      }
    }
  });
  



  