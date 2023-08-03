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
  this.load.image("space", "assets/space.jpg");
  this.load.image("spark", "assets/blue.png");
  this.load.image("startGame", "assets/startgame.png");
  this.load.spritesheet('uiSprite', 'assets/ui1spritesheet.png', { frameWidth: 224, frameHeight: 101 });
}



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

  this.add.particles("spark").createEmitter({
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

  let startGameText = this.add.text(gameWidth, 0, 'Start Game', { fontSize: '32px', fill: '#C71585' }).setOrigin(0.5, 4);
  let startGameImage = this.add.image(gameWidth, 0, 'startGame').setOrigin(1.68, 1.05).setScale(0.19);



  const sprite = this.add.sprite(0, 0, 'uiSprite').setOrigin(1.2, 0.9).setScale(2.5).setDepth(1000);

  this.anims.create({
    key: 'uiAnimate',
    frames: this.anims.generateFrameNumbers('uiSprite', { start: 0, end: 124 })
    ,
    frameRate: 20,
    repeat: -1
  });

  sprite.anims.play('uiAnimate');

  
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

const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: { preload, create },
  audio: { noAudio: true },
  input: { mouse: false, touch: false, keyboard: false }
});


