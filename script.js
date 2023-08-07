document.addEventListener('DOMContentLoaded', (event) => {
  const navLinks = document.querySelectorAll('nav ul.nav-links a');
  const currentPathname = window.location.pathname;

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPathname || href + '/' === currentPathname) {
      link.classList.add('active-link');
    }
  });
});

const { GetRandom } = Phaser.Utils.Array;

function preload() {
  this.load.crossOrigin = "anonymous";
  // this.load.setBaseURL("https://labs.phaser.io");
  this.load.image("boba2042text", "assets/boba2042text.png");

  this.load.image("space", "assets/dragon.png");
  this.load.image("spark", "assets/blue.png");
  this.load.image("startGame", "assets/startgame.png");
  this.load.image("jasong", "assets/jasong.png");

  this.load.spritesheet('uiSprite', 'assets/ui1spritesheet.png', { frameWidth: 224, frameHeight: 101 });
  this.load.spritesheet('glitchbar', 'assets/glitchbarspritesheet.png', { frameWidth: 416, frameHeight: 95 });

}

let emitter;

//create()
function create() {
   // Get 10% of game height
   let topCropHeight = this.game.config.height * 0.10;
   let bottomCropHeight = this.game.config.height * 0.90;
 
   // Set the camera viewport to be cropped
   this.cameras.main.setViewport(0, topCropHeight, this.game.config.width, bottomCropHeight - topCropHeight);
  this.cameras.main.centerOn(0, 0);

  const emitCircle = new Phaser.Geom.Circle(0, 0, 350);
  const moveToCircle = new Phaser.Geom.Circle(0, 0, 200);
  const moveToPoints = moveToCircle.getPoints(600);

  let moveToPoint = moveToPoints[0];

  this.add.image(0, 0, "space");

  emitter = this.add.particles("spark").createEmitter({
    alpha: { start: 0, end: 0.2, ease: "Cubic.easeInOut" },
    blendMode: "ADD",
    emitCallback: () => { moveToPoint = GetRandom(moveToPoints); },
    emitZone: { source: emitCircle },
    frequency: 1000 / 60,
    lifespan: { min: 1000, max: 5000 },
    moveToX: () => moveToPoint.x,
    moveToY: () => moveToPoint.y,
    quantity: 10,
    scale: { start: 1, end: 0, ease: "Cubic.easeIn" }
  });

  const { gameWidth, gameHeight } = this.game.config;

  let startGameImage = this.add.image(gameWidth, 0, 'startGame').setOrigin(1.68, 1.05).setScale(0.19);
  startGameImage.setInteractive();
  
  // Flash the image once when it is clicked
  startGameImage.on('pointerdown', () => {
    this.tweens.add({
        targets: startGameImage,
        alpha: 0,
        duration: 100,
        ease: 'Power2',
        yoyo: true
    });
    // Double the number of particles
    emitter.setQuantity(20);
    // Transition to Scene2
    this.scene.start('Scene2');
});




  const sprite = this.add.sprite(0, 0, 'uiSprite').setOrigin(1.2, 0.9).setScale(2.5).setDepth(1000);

  this.anims.create({
    key: 'uiAnimate',
    frames: this.anims.generateFrameNumbers('uiSprite', { start: 0, end: 124 })
    ,
    frameRate: 20,
    repeat: -1
  });

  sprite.anims.play('uiAnimate');


  const sprite2 = this.add.sprite(0, 0, 'glitchbar').setOrigin(0.07, -1.2).setScale(1.3).setDepth(1000);

  this.anims.create({
    key: 'uiAnimate2',
    frames: this.anims.generateFrameNumbers('glitchbar', { start: 0, end: 124 })
    ,
    frameRate: 20,
    repeat: -1
  });

  sprite2.anims.play('uiAnimate2');
// First, get the bottom Y coordinate of the image
let textStartY = startGameImage.y + startGameImage.displayHeight / 2;

// Then add the text
let style = { font: "32px Arial", fill: "#BD75DF", };

let text1 = this.add.text(startGameImage.x, textStartY, 'BOBA 2042', style);
text1.setOrigin(3, 1.05); // This will center align the text horizontally and align it to the top vertically
text1.setInteractive(new Phaser.Geom.Rectangle(0, 0, text1.width, text1.height), Phaser.Geom.Rectangle.Contains);
text1.setDepth(1000);
text1.on('pointerover', () => {
  text1.setStyle({ fill: '#FFFFFF' });
});
text1.on('pointerout', () => {
  text1.setStyle({ fill: '#BD75DF' });
});
text1.on('pointerdown', () => {
  console.log('pointerdown event fired');

  // Add the image when the text is clicked
  // Note: adjust the coordinates (300, 30) to suit your needs
  let boba2042Image = this.add.image(300, 30, 'boba2042text').setScale(0.5).setDepth(1001);
  // Create a Tween that animates the y property of the image
  // This will cause the image to move up and down between its original y position and 10 pixels above that
  let hoverTween = this.tweens.add({
    targets: boba2042Image,
    y: boba2042Image.y - 10,
    duration: 1000,  // Time in ms that the animation will take
    ease: 'Power1',  // Easing function to use for the animation
    yoyo: true,  // Makes the animation go back and forth, creating a hover effect
    repeat: -1  // Makes the animation repeat indefinitely
  });
});



let text2 = this.add.text(startGameImage.x, textStartY, 'NO HXPE', style);
text2.setOrigin(3.4, -0.05);
text2.setInteractive();
text2.on('pointerover', () => {
  text2.setStyle({ fill: '#000000' });
});
text2.on('pointerout', () => {
  text2.setStyle({ fill: '#ffffff' });
});

let text3 = this.add.text(startGameImage.x, textStartY, 'CODE SHIT', style);
text3.setOrigin(2.9, -1.15);
text3.setInteractive();
text3.on('pointerover', () => {
  text3.setStyle({ fill: '#000000' });
});
text3.on('pointerout', () => {
  text3.setStyle({ fill: '#ffffff' });
});


let jasong = this.add.image(gameWidth, 0, 'jasong').setOrigin(-0.20, 1.75).setScale(0.20);

  
}

///end create

const windowAspectRatio = window.innerWidth / window.innerHeight;
const gameAspectRatio = 3 / 2;

let gameWidth, gameHeight;

if (windowAspectRatio > gameAspectRatio) {
  gameHeight = window.innerHeight;
  gameWidth = gameHeight * gameAspectRatio;
} else {
  gameWidth = window.innerWidth;
  gameHeight = gameWidth / gameAspectRatio;
}
// ... your existing code ...

const Scene2 = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Scene2() {
    Phaser.Scene.call(this, { key: 'Scene2' });
  },
  preload: function () {
    // Preload any assets if needed
  },
  create: function () {
    // Add the three colored squares side by side
    const squareSize = this.game.config.width / 3; // One third of the game width
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    for (let i = 0; i < 3; i++) {
      this.add.rectangle(squareSize * (i + 0.5), this.game.config.height / 2, squareSize, squareSize, colors[i]);
    }
  }
});


// ... the rest of your code ...



const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [ { preload, create }, Scene2 ], // Scene2 is added here
  audio: { noAudio: true },
  input: { mouse: true, touch: true, keyboard: true }
});





