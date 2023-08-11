import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js"; // Change this line
import {
  FontLoader,
  TextGeometry,
  MeshBasicMaterial,
  Mesh,
} from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";

let scene, camera, renderer;
let dragon;
let mixers = []; // Declare an array to hold all mixers
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let angle = 0; // Initial angle
let radius = 20; // Define the radius of the circular path
let whiteSquare;
let circleTexture = new THREE.TextureLoader().load("circle.png");

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function addText() {
  const fontLoader = new FontLoader();

  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      // Main title
      const geometryMain = new TextGeometry("Jason Godfrey", {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      const materialMain = new MeshBasicMaterial({ color: 0xffffff });
      const textMeshMain = new Mesh(geometryMain, materialMain);
      textMeshMain.position.set(-22, 30, 0); // Adjusted y position slightly
      scene.add(textMeshMain);

      // Subtitle
      const geometrySub = new TextGeometry("Software Engineer", {
        font: font,
        size: 2, // Made this a bit smaller than the main title
        height: 0.5, // Adjusted thickness for subtext
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      const materialSub = new MeshBasicMaterial({ color: 0xffffff });
      const textMeshSub = new Mesh(geometrySub, materialSub);
      textMeshSub.position.set(-12, 26, 0); // Positioned below main title
      scene.add(textMeshSub);
    }
  );
}

init();

function init() {
  // Create scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50; // or even further if needed

  // Create a renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Handle window resizing
  window.addEventListener("resize", function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
  //mouse
  document.addEventListener("mousemove", onMouseMove, false);

  // Add some lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Load the dragon.obj model
  // ... rest of your code ...

  const loader = new GLTFLoader();
  loader.load("Dragon.glb", function (gltf) {
    dragon = gltf.scene;
    dragon.scale.set(1, 1, 1);
    dragon.position.set(0, -20, 0);
    scene.add(dragon);
    // Make the dragon's skin wireframe
    dragon.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = true;
      }
    });

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
    let circleGeometry = new THREE.CircleGeometry(77.5, 32); // 7.5 is the radius and 32 is the number of segments
    whiteSquare = new THREE.Mesh(circleGeometry, circleMaterial);
    whiteSquare.position.z = -1; // Adjust this value to position the circle as far back as you want

    animate(); // Call the animate loop
  });
  addText();

  // ... rest of your code ...
}

function animate() {
  requestAnimationFrame(animate);

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
    const alpha = 0.05; // This determines the speed/smoothness of the rotation. Lower value means smoother.
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

  renderer.render(scene, camera);
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
    const AboutMeInfoDiv = document.getElementById("AboutMe-info");


    switch (event.target.innerText) {
      case "AboutMe":
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
        AboutMeInfoDiv.style.display = "block"; // Show the contact information

        break;

      case "GameDev":
        // Handle "GameDev" button click
        contactInfoDiv.style.display = "none"; // Show the contact information
        gameInfoDiv.style.display = "block"; // Show the contact information
        WebInfoDiv.style.display = "none"; // Show the contact information
        AboutMeInfoDiv.style.display = "none"; // Show the contact information

        break;
      case "WebDev":
        // Handle "WebDev" button click
        contactInfoDiv.style.display = "none"; // Show the contact information
        gameInfoDiv.style.display = "none"; // Show the contact information
        WebInfoDiv.style.display = "block"; // Show the contact information
        AboutMeInfoDiv.style.display = "none"; // Show the contact information

        break;
      case "Contact":
        gameInfoDiv.style.display = "none"; // Show the contact information
        contactInfoDiv.style.display = "block"; // Show the contact information
        WebInfoDiv.style.display = "none"; // Show the contact information
        AboutMeInfoDiv.style.display = "none"; // Show the contact information

        break;
      default:
        break;
    }
  });
});
