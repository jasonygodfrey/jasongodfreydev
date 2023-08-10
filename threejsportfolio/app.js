let scene, camera, renderer;
let cube, greenMaterial, redMaterial;
let text, whiteMaterial, redTextMaterial;
let fontLoader = new THREE.FontLoader();
let raycaster = new THREE.Raycaster();
let videoMesh;  // Declare at the top 
let font;


// Function to handle the click event on the startGameMesh
function onClickStartGame() {
  // Remove the existing elements from the scene
  console.log("Start game clicked!");

  scene.remove(startGameMesh);
  scene.remove(videoMesh);

  // Create a new scene for the sample text


  // Create sample text
  const sampleTextGeometry = new THREE.TextGeometry("Sample Text", {
    font: font,
    size: 0.5,
    height: 0.1,
  });

  const sampleTextMesh = new THREE.Mesh(sampleTextGeometry, whiteMaterial);
  sampleTextMesh.position.y = 0; // Adjust the position as needed
  sampleScene.add(sampleTextMesh);

  // Set the new scene

}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const light = new THREE.PointLight(0xffffff, 1, 100); // White light
light.position.set(0, 0, 5); // Adjust as needed
scene.add(light);




const videoElement = document.createElement('video');
videoElement.src = 'racoonvid.mp4';
videoElement.autoplay = true;
videoElement.loop = true;
videoElement.muted = true;
videoElement.play();

videoElement.addEventListener('loadedmetadata', function() {
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    const backgroundPlaneGeometry = new THREE.PlaneGeometry(21, 11);
    const backgroundPlaneMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    const backgroundPlane = new THREE.Mesh(backgroundPlaneGeometry, backgroundPlaneMaterial);
    backgroundPlane.position.z = -2;
    scene.add(backgroundPlane);
});


// Step 1: Load and play the WebM video
const video = document.createElement('video');
video.src = 'startframe.webm';
video.autoplay = true;
video.loop = true;
video.muted = true;
video.play();

// Step 2: Create a VideoTexture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;  // Change to RGBA format for alpha

// Step 3: Use the VideoTexture
const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true,
    alphaTest: 0.1,  // This can be adjusted as per your needs
    depthWrite: false  // Important for transparency
});

const videoAspectRatio = 16 / 9;  // Adjust this if you know your video's aspect ratio
const videoGeometry = new THREE.PlaneGeometry(2 * videoAspectRatio, 2);
videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);

videoMesh.position.set(-3.75, 0.75, 1);
scene.add(videoMesh);


const startGameTexture = new THREE.TextureLoader().load('startgame.png', function(texture) {
  // Steps 2 & 3: Create the geometry and material
  const aspectRatio = texture.image.width / texture.image.height; 
  const startGameGeometry = new THREE.PlaneGeometry(2 * aspectRatio, 2); // Adjust the size as required.
  const startGameMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

// ... (your existing code)

// Step 4: Create the mesh
startGameMesh = new THREE.Mesh(startGameGeometry, startGameMaterial);



// Add the click event listener to the startGameMesh
startGameMesh.addEventListener("click", onClickStartGame);

// Add the startGameMesh to the scene
scene.add(startGameMesh);

// ... (your existing code)

});


const jasonTexture = new THREE.TextureLoader().load('jasongodfreydev.png', function(texture) {

  // Create the geometry and material
  const aspectRatio = texture.image.width / texture.image.height;
  const jasonGeometry = new THREE.PlaneGeometry(1 * aspectRatio, 1);  

  const jasonMaterial = new THREE.MeshPhongMaterial({ 
      map: texture, 
      transparent: true,
      shininess: 100,
      specular: 0xffffff
  });

  // Create the glow gradient
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
  );

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const glowTexture = new THREE.Texture(canvas);
  glowTexture.needsUpdate = true;

  // Use glow texture for the sprite material
  const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending
  });

  const glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.scale.set(1.2 * aspectRatio, 1.2, 1);  // Adjust the size as needed
  glowSprite.position.set(2.75, 1.75, 0.9);  // Positioned slightly behind the PNG

  // Create the mesh
  const jasonMesh = new THREE.Mesh(jasonGeometry, jasonMaterial);
  jasonMesh.position.set(2.75, 1.75, 1);

  // Add the glow sprite and mesh to the scene
  //scene.add(glowSprite);
 // scene.add(jasonMesh);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousemove', function(event) {
  event.preventDefault();
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  for (const intersect of intersects) {
      if (ASCII_DATA.some(data => data.mesh === intersect.object)) {
          const dx = mouse.x - intersect.object.position.x;
          const dy = mouse.y - intersect.object.position.y;
          intersect.object.position.x += dx * 0.05;
          intersect.object.position.y += dy * 0.05;
      }
  }
});


const ASCII_ART = `
       __                          ______          ______               
      / /___ __________  ____     / ____/___  ____/ / __/_______  __  __
 __  / / __ \`/ ___/ __ \\/ __ \\   / / __/ __ \\/ __  / /_/ ___/ _ \\/ / / /
/ /_/ / /_/ (__  ) /_/ / / / /  / /_/ / /_/ / /_/ / __/ /  /  __/ /_/ / 
\\____/\\__,_/____/\\____/_/ /_/   \\____/\\____/\\__,_/_/ /_/   \\___/\\__, /  
                                                               /____/  
`;

const ASCII_DATA = [];

// Split the ASCII_ART into lines
const lines = ASCII_ART.split('\n');

for(let y = 0; y < lines.length; y++) {
    for(let x = 0; x < lines[y].length; x++) {
        const char = lines[y][x];
        if(char !== ' ') {
            ASCII_DATA.push({
                x: x,
                y: y,
                char: char
            });
        }
    }
}

const fontLoader = new THREE.FontLoader();
fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", function (font) {
    ASCII_DATA.forEach(data => {
        const textGeometry = new THREE.TextGeometry(data.char, {
            font: font,
            size: 0.1,  // Adjust this
            height: 0.02
        });
        
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Change to white
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // Maybe adjust these values
        textMesh.position.set(data.x * 0.12 - 4, -data.y * 0.2 + 3, 0);
        
        scene.add(textMesh);
        data.mesh = textMesh;  // Important for the hover effect

    });
    
    document.addEventListener("mousemove", function(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      ASCII_DATA.forEach(data => {
          const dx = mouse.x - data.mesh.position.x;
          const dy = mouse.y - data.mesh.position.y; // removed "+" as it's already negative from mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.5) {
              data.mesh.position.x += dx * 0.05;
              data.mesh.position.y += dy * 0.05; // removed "-" as dy is calculated correctly above
            }
        });
    });
});


  // Create green material
  greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // Create red material
  redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  const geometry = new THREE.BoxGeometry();
  // Assign green material to the cube
  cube = new THREE.Mesh(geometry, greenMaterial);
  //scene.add(cube);

  // Create white material for the text
  whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // Create red material for the text
  redTextMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // Load the default font
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      const textGeometry = new THREE.TextGeometry("Hover over me!", {
        font: font,
        size: 0.5,
        height: 0.1,
      });

      text = new THREE.Mesh(textGeometry, whiteMaterial);
      text.position.y = -1; // Position the text below the cube
      //scene.add(text);

      // Add mousemove event listener to the document
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener('click', onMouseClick);

    }
  );

  // Set up the scene and animation
  animate();
}

function onMouseMove(event) {
  // Get the normalized mouse coordinates (-1 to 1)
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Check if the mouse is over the text
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(text);

  if (intersects.length > 0) {
    // Mouse is over the text, change the text color to red
    text.material = redTextMaterial;
  } else {
    // Mouse is not over the text, change the text color to white
    text.material = whiteMaterial;
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
function onMouseClick(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([startGameMesh]); // Intersect only with the startGameMesh

  if (intersects.length > 0) {
      onClickStartGame();
  }
}



init();
