import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js"; // Change this line
import {
  FontLoader,
  TextGeometry,
  MeshBasicMaterial,
  Mesh,
} from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { EffectComposer } from "./three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "./three/examples/jsm/postprocessing/BokehPass.js";
import { FXAAShader } from "./three/examples/jsm/shaders/FXAAShader.js";
import { ShaderPass } from "./three/examples/jsm/postprocessing/ShaderPass.js";

let scene, camera, renderer, dragon, ground, composer; // <-- Added composer here
let mixers = []; // Declare an array to hold all mixers
let particleGeometry;
let particleVertices = [];
let particleColors = [];
let textMeshes = [];
let velocities = [];
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let angle = 0; // Initial angle
let radius = 20; // Define the radius of the circular path
let whiteSquare;
let circleTexture = new THREE.TextureLoader().load("circle4.png");
let textMeshMain; // Declare at the top-level of your script

const purpledragonTexture = new THREE.TextureLoader().load(
  "textures/Dragon_ground_color.jpg"
);

//text
function addText() {
  const fontLoader = new FontLoader();

  fontLoader.load(
    "./three/examples/fonts/Noto Sans JP_Bold.json",
    function (font) {
      // Main title
      const geometryMain = new TextGeometry("JASONGODFREY.DEV", {
        font: font,
        size: 0.443,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5,
        opacity: 1,
        transparent: true,
      });

      const materialMain = new MeshBasicMaterial({ color: 0x717171 }); // Platinum black
      textMeshMain = new Mesh(geometryMain, materialMain);
      textMeshMain.position.set(-11.53, 6.4, 20);

      scene.add(textMeshMain);
      textMeshMain.rotation.y = Math.PI / 0.100195; // Rotate the text 90 degrees to the right

      // Subtitle
      const subtitleChars = Array.from("ジェイソン・ゴッドフリー");
      const subtitleSpacing = 0.8; // Adjust this value based on desired spacing between characters
      let subtitleYOffset = 2.4; // Starting position (adjust this if you want to change the subtitle's vertical position)

      for (let i = 0; i < subtitleChars.length; i++) {
        const geometrySub = new TextGeometry(subtitleChars[i], {
          font: font,
          size: 0.608,
          height: 0,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 0.5,
          bevelSize: 0.3,
          bevelOffset: 0,
          bevelSegments: 5,
          opacity: 1,
          transparent: true,
        });

        const materialSub = new MeshBasicMaterial({ color: 0x717171 });
        const textMeshSub = new Mesh(geometrySub, materialSub);
        textMeshSub.position.set(-6, subtitleYOffset + 3.0, 20); // Positioned below main title
        scene.add(textMeshSub);

        subtitleYOffset -= subtitleSpacing; // Decrease the y offset for each subsequent character
      }
  // Add "Enter" button
      const enterGeometry = new TextGeometry("Enter", {
        font: font,
        size: 1.0, // Adjust size as needed
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5,
        opacity: 1,
        transparent: true
      });

      const enterMaterial = new MeshBasicMaterial({ color: 0x717171 }); // Same material as other texts
      const enterMesh = new Mesh(enterGeometry, enterMaterial);
      enterMesh.position.set(-3, -5, 20); // Position it lower down, adjust these values as needed

      // Optional: add some interaction with mouse
      enterMesh.userData = { isButton: true };

      //scene.add(enterMesh); 

      // Logo
      const chars = ["開", "発", "者"];
      const spacing = 6.5;
      let yOffset = 1.4;

      for (let i = 0; i < chars.length; i++) {
        const geometryLogo = new THREE.TextGeometry(chars[i], {
          font: font,
          size: 4.608,
          height: 0,
          curveSegments: 12,
          bevelEnabled: false,
        });

        const materialLogo = new THREE.MeshBasicMaterial({ color: 0xb80000 });
        const textMeshLogo = new THREE.Mesh(geometryLogo, materialLogo);
        textMeshLogo.position.set(-12, yOffset, 18);
        scene.add(textMeshLogo);

        // Add the mesh and its initial velocity to arrays
        //textMeshes.push(textMeshLogo);
        velocities.push(0);

        yOffset -= spacing;
      }
    }
  );
}

//ground

const groundGeometry = new THREE.PlaneGeometry(350, 350, 100, 100);
const groundTexture = new THREE.TextureLoader().load(
  "textures/greenground.png"
);
const displacementTexture = new THREE.TextureLoader().load(
  "textures/greengrounddisplacement3.png"
);

groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(4, 4); // Adjust the repeat values as needed
const groundMaterial = new THREE.MeshPhongMaterial({
  map: groundTexture,
  displacementMap: displacementTexture,
  displacementScale: 20, // Adjust this value as needed
  transparent: true, // Set to true for transparency
  opacity: 0.1, // Adjust this value to control transparency
});

function fadeInGround() {
  const duration = 1000; // Fade-in duration in milliseconds (1 second in this case)
  const start = performance.now();

  function animateFadeIn(now) {
    const elapsed = now - start;
    if (elapsed < duration) {
      // Calculate the current opacity
      ground.material.opacity = elapsed / duration;
      requestAnimationFrame(animateFadeIn);
    } else {
      ground.material.opacity = 0; // Ensure that the opacity is set to 1 at the end
    }
    ground.material.needsUpdate = true;
  }

  requestAnimationFrame(animateFadeIn);
}

function onMouseMove(event) {
  if (event.touches) {
    // Use the first touch
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
  }
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
// Place the event listeners here, after defining the onMouseMove function
document.addEventListener("mousemove", onMouseMove, false);
document.addEventListener("touchmove", onMouseMove, false);

const MAX_DISTANCE = 10; // This is the distance up to which particles will surround the dragon

function updateParticles() {
  particleVertices.forEach((vertex, index) => {
    let direction = vertex.clone().sub(dragon.position).normalize();
    let distance = vertex.distanceTo(dragon.position);

    // If a particle is too far from the dragon, reset its position closer to the dragon
    if (distance > MAX_DISTANCE) {
      let offset = direction.multiplyScalar(distance - MAX_DISTANCE);
      particleVertices[index].sub(offset);
    } else {
      // Add a slight random movement to each particle to make the effect more dynamic
      particleVertices[index].add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      );
    }
  });

  // Update the geometry to reflect the new particle positions
  particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particleVertices, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({ size: 0.1 }); // or any other material setup you prefer
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);

  //scene.add(particleSystem);
}

init();
// Define your clickableObjects array globally or inside your main function
let clickableObjects = [];
function init() {
  // Create scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    30, // Adjust the field of view for a cinematic effect
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );

  // Position the camera for a cinematic angle
  //camera.position.set(0, -10, 69); // Adjust the position as needed
  //camera.lookAt(0, -5, 0); // Look at the origin of the scene
  camera.position.set(-10, -13, 79); // Moved the camera slightly to the left
  camera.lookAt(-4, -5, 0); // Have the camera look slightly to the right

  // Create a renderer
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); // Set antialias to false as we will use FXAA later

  renderer.setClearColor(0x000000, 0); // Set clear color to black and clearAlpha to 0

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // <-- Add this line here

  document.body.appendChild(renderer.domElement);
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.29;
  bloomPass.strength = 1.9;
  bloomPass.radius = 1;
  composer.addPass(bloomPass);
  const bokehPass = new BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.0025,
    maxblur: 0.01,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  composer.addPass(bokehPass);
  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms["resolution"].value.x =
    1 / (window.innerWidth * window.devicePixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y =
    1 / (window.innerHeight * window.devicePixelRatio);
  composer.addPass(fxaaPass);

  // Handle window resizing
  window.addEventListener("resize", function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    composer.setSize(newWidth, newHeight);

    fxaaPass.material.uniforms["resolution"].value.x =
      1 / (newWidth * window.devicePixelRatio);
    fxaaPass.material.uniforms["resolution"].value.y =
      1 / (newHeight * window.devicePixelRatio);
  });

  //mouse
  document.addEventListener("mousemove", onMouseMove, false);

  // Add some lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  pointLight.castShadow = true; // <-- Add this line here

  scene.add(pointLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 30, 20); // Adjust position to suit your scene
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Load the dragon.obj model

  const loader = new GLTFLoader();
  loader.load("Dragon.glb", function (gltf) {
    dragon = gltf.scene;
    dragon.scale.set(1, 1, 1);
    dragon.position.set(0, -19, 5);
    scene.add(dragon);
    // Make the dragon's skin wireframe

    // Traverse to set dragon's properties and gather its vertices
    dragon.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(0x151515); // Set the color to black

        child.material.wireframe = true;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;

        let positions;
        if (child.geometry.isBufferGeometry) {
          positions = child.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            particleVertices.push(
              new THREE.Vector3(
                positions[i],
                positions[i + 1],
                positions[i + 2]
              )
            );
          }
        } else if (child.geometry.isGeometry) {
          particleVertices.push(...child.geometry.vertices);
        }
      }
    });
    // Calculate the centroid of the particles
    let centroid = new THREE.Vector3();
    particleVertices.forEach((vertex) => {
      centroid.add(vertex);
    });
    centroid.divideScalar(particleVertices.length);
    // Offset the particles around the dragon
    let offsetDistance = 5;
    for (let i = 0; i < particleVertices.length; i++) {
      let direction = particleVertices[i].clone().sub(centroid).normalize();
      particleVertices[i].add(direction.multiplyScalar(offsetDistance));
    }

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1, // Size of each particle
      map: new THREE.TextureLoader().load("textures/blue.png"), // Optional: Use a sprite texture for particles
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleGeometry = new THREE.BufferGeometry().setFromPoints(
      particleVertices
    );
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    //scene.add(particleSystem);

    // Find and play the 'idle Pose' animation
    const targetAnimationName = "idle Pose";
    let targetAnimationClip;

    for (let clip of gltf.animations) {
      if (clip.name === targetAnimationName) {
        targetAnimationClip = clip;
        break;
      }
    }

    if (targetAnimationClip) {
      const mixer = new THREE.AnimationMixer(dragon);
      mixers.push(mixer); // Add the mixer to the array
      const action = mixer.clipAction(targetAnimationClip);
      action.play();
    }
    let circleMaterial = new THREE.MeshBasicMaterial({
      map: circleTexture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const circleGeometry = new THREE.CircleGeometry(77.5, 32);
    whiteSquare = new THREE.Mesh(circleGeometry, circleMaterial);
    whiteSquare.position.set(dragon.position.x, -20, dragon.position.z);
    whiteSquare.rotation.set(-Math.PI / 2, 0, 0); // Rotate 90 degrees to lie flat

    scene.add(whiteSquare);
  });

  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMaterial.needsUpdate = true; // Add this line

  ground.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
  ground.visible = false;
  ground.position.set(0, -21, 0); // Adjust as per requirement

  ground.receiveShadow = true; // Optional: Enable if you want the ground to receive shadows
  ground.castShadow = false; // A ground plane typically doesn't need to cast shadows

  console.log(ground.material);

  scene.add(ground); // Add the ground to the scene here
  ground.visible = true;
  fadeInGround();

  addText();

  // ... rest of your code ...

  // Skybox
  const skyboxTexture = new THREE.TextureLoader().load("background.jpg");

  // Create the skybox material
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    color: 0xe5e4e2, // Platinum white color in HEX
    side: THREE.BackSide, // Make the material visible from the inside
    transparent: true, // Set the material to be transparent
    opacity: 0.327, // Adjust the opacity as needed
  });

  // Create the skybox geometry
  const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000); // Adjust size as needed

  // Create the skybox mesh
  const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

  // Add the skybox mesh to the scene
  scene.add(skyboxMesh);
  scene.background = new THREE.CubeTexture();

  console.log(scene.background);
  console.log(scene);

  //fog
}
// Define parameters for cinematic orbit
const orbitRadius = 60;
const orbitSpeed = 0.005; // Adjust this value for desired speed
const targetLookAt = new THREE.Vector3(0, -20, 0); // Adjust target position

function animate() {
  requestAnimationFrame(animate);

  updateParticles();

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Create a plane at z=0 that we'll find the intersection on
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  // Rotate the dragon to face the intersection point
  if (dragon) {
    // Calculate the angle between the dragon and the intersection point
    const targetAngle =
      Math.atan2(
        intersection.y - dragon.position.y,
        intersection.x - dragon.position.x
      ) -
      Math.PI / 2; // Desired angle (facing the mouse)

    // Smoothly interpolate the dragon's current rotation towards the target angle
    const alpha = 0.006; // This determines the speed/smoothness of the rotation. Lower value means smoother.
    dragon.rotation.y = THREE.MathUtils.lerp(
      dragon.rotation.y,
      -targetAngle,
      alpha
    );
  }

  // Move the square in a circle around the dragon
  if (whiteSquare) {
    whiteSquare.rotation.z -= 0.001; // Adjust the value 0.01 for faster or slower rotation
  }

  // Update each mixer in the mixers array
  for (let mixer of mixers) {
    mixer.update(0.0025); // Assuming a 60fps frame rate. Adjust this value if necessary.
  }

  if (textMeshMain) {
    //textMeshMain.lookAt(camera.position);
    //console.log("Text is facing the camera");
  }

  // Update the y position of the text meshes
  for (let i = 0; i < textMeshes.length; i++) {
    const acceleration = -0.005; // Gravity

    // Update velocity and position based on acceleration
    velocities[i] += acceleration;
    textMeshes[i].position.y += velocities[i];

    // Reset position and velocity when the text goes too low
    if (textMeshes[i].position.y < -20) {
      textMeshes[i].position.y = 20;
      velocities[i] = 0;
    }
  }

  

  
  composer.render();
}

animate(); // Call this after the init function

// Other Three.js related code...

// Add event listeners to the buttons
document.querySelectorAll(".custom-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    // Here, "event.target" refers to the button that was clicked.
    // Depending on which button it was, you can decide what action to take.
    const contactInfoDiv = document.getElementById("contact-info");
    const gameInfoDiv = document.getElementById("GameDev-info");
    const WebInfoDiv = document.getElementById("WebDev-info");
    const AboutInfoDiv = document.getElementById("About-info");

    switch (event.target.innerText) {
      case "About":
        if (dragon) {
          dragon.traverse((child) => {
            if (child.isMesh) {
              child.material.wireframe = false; // Turn off wireframe
            }
          });
        }

        contactInfoDiv.style.display = "none"; // Show the contact information
        gameInfoDiv.style.display = "none"; // Show the contact information
        WebInfoDiv.style.display = "none"; // Show the contact information
        AboutInfoDiv.style.display = "block"; // Show the contact information

        break;

      case "Games":
        // Handle "GameDev" button click
        contactInfoDiv.style.display = "none"; // Show the contact information
        gameInfoDiv.style.display = "block"; // Show the contact information
        WebInfoDiv.style.display = "none"; // Show the contact information
        AboutInfoDiv.style.display = "none"; // Show the contact information

        break;
      case "Web":
        // Handle "WebDev" button click
        contactInfoDiv.style.display = "none"; // Show the contact information
        gameInfoDiv.style.display = "none"; // Show the contact information
        WebInfoDiv.style.display = "block"; // Show the contact information
        AboutInfoDiv.style.display = "none"; // Show the contact information
        dragon.traverse((child) => {
          if (child.isMesh) {
            child.material.map = purpledragonTexture; // Apply the texture
            child.material.needsUpdate = true; // Necessary after changing a material's properties
          }
        });
        break;
      case "Contact":
        gameInfoDiv.style.display = "none"; // Show the contact information
        contactInfoDiv.style.display = "block"; // Show the contact information
        WebInfoDiv.style.display = "none"; // Show the contact information
        AboutInfoDiv.style.display = "none"; // Show the contact information

        break;
      default:
        break;
    }
  });
});

const inputElement = document.getElementById("commandInput");
const contentElement = document.querySelector(".console-content");

document.querySelectorAll(".command-link").forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    const command = this.textContent.trim();
    executeCommand(command);
  });
});

inputElement.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const inputText = inputElement.value.trim();
    executeCommand(inputText);
    event.preventDefault();
  }
});

function executeCommand(command) {
  if (command !== "") {
    const outputLine = document.createElement("p");
    outputLine.className = "console-line";

    const promptSpan = document.createElement("span");
    promptSpan.textContent = "> ";
    outputLine.appendChild(promptSpan);

    const commandSpan = document.createElement("span");
    commandSpan.textContent = command;
    outputLine.appendChild(commandSpan);

    contentElement.appendChild(outputLine);

    // Scroll the console content to the bottom
    contentElement.scrollTop = contentElement.scrollHeight;

    inputElement.value = "";
  }
}

document.querySelector(".dir-btn").addEventListener("click", function () {
  const directoryContent = `
      <p class="console-line">//Directory:</p>
      <p class="console-line"><a href="#" class="command-link">*ABOUT ｜ について</a></p>
      <p class="console-line"><a href="#" class="command-link">*WEB ｜ ウェブ</a></p>
      <p class="console-line"><a href="#" class="command-link">*GAMES ｜ ゲーム</a></p>
      
  `;

  contentElement.innerHTML += directoryContent;
  contentElement.scrollTop = contentElement.scrollHeight;

  // Re-bind the click event to new command-links
  document.querySelectorAll(".command-link").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const command = this.textContent.trim();
      executeCommand(command);
    });
  });
});

const consoleElement = document.querySelector(".console");
const resizeHandle = document.querySelector(".console-resize-handle");

let isResizing = false;

let initialWidth, initialHeight, initialMouseX, initialMouseY;

resizeHandle.addEventListener("mousedown", (event) => {
  isResizing = true;
  initialWidth = consoleElement.offsetWidth;
  initialHeight = consoleElement.offsetHeight;
  initialMouseX = event.clientX;
  initialMouseY = event.clientY;

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.removeEventListener("mousemove", handleMouseMove);
  });
});

const INITIAL_WIDTH = consoleElement.offsetWidth;
const INITIAL_HEIGHT = consoleElement.offsetHeight;

function handleMouseMove(event) {
  if (!isResizing) return;

  const dx = event.clientX - initialMouseX;
  const dy = event.clientY - initialMouseY;

  const newWidth = Math.max(initialWidth + dx, INITIAL_WIDTH);
  const newHeight = Math.max(initialHeight + dy, INITIAL_HEIGHT);

  consoleElement.style.width = `${newWidth}px`;
  consoleElement.style.height = `${newHeight}px`;
}

const dragBar = document.querySelector(".console-drag-bar");

let isDragging = false;
let prevX, prevY;

dragBar.addEventListener("mousedown", (event) => {
  isDragging = true;
  prevX = event.clientX;
  prevY = event.clientY;

  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.removeEventListener("mousemove", handleDragMove);
  });
});

function handleDragMove(event) {
  if (!isDragging) return;

  const dx = event.clientX - prevX;
  const dy = event.clientY - prevY;

  const currentLeft = parseInt(
    window.getComputedStyle(consoleElement).left,
    10
  );
  const currentTop = parseInt(window.getComputedStyle(consoleElement).top, 10);

  consoleElement.style.left = `${currentLeft + dx}px`;
  consoleElement.style.top = `${currentTop + dy}px`;

  prevX = event.clientX;
  prevY = event.clientY;
}
