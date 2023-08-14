import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js"; // Change this line
import {
  FontLoader,
  TextGeometry,
  MeshBasicMaterial,
  Mesh,
} from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from './three/examples/jsm/postprocessing/BokehPass.js';
import { FXAAShader } from './three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js';

let scene, camera, renderer, dragon, ground, composer; // <-- Added composer here
let mixers = []; // Declare an array to hold all mixers
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let angle = 0; // Initial angle
let radius = 20; // Define the radius of the circular path
let whiteSquare;
let circleTexture = new THREE.TextureLoader().load("circle.png");

const purpledragonTexture = new THREE.TextureLoader().load("textures/Dragon_ground_color.jpg");

//ground 

const groundGeometry = new THREE.PlaneGeometry(350, 350, 100, 100);
const groundTexture = new THREE.TextureLoader().load("textures/greenground.png");
const displacementTexture = new THREE.TextureLoader().load("textures/greengrounddisplacement3.png");

groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(4, 4);  // Adjust the repeat values as needed
const groundMaterial = new THREE.MeshPhongMaterial({
  map: groundTexture,
  displacementMap: displacementTexture,
  displacementScale: 20,  // Adjust this value as needed
  transparent: true, // Set to true for transparency
  opacity: .1, // Adjust this value to control transparency
  
});




function fadeInGround() {
    const duration = 1000; // Fade-in duration in milliseconds (1 second in this case)
    const start = performance.now();

    function animateFadeIn(now) {
        const elapsed = now - start;
        if (elapsed < duration) {
            // Calculate the current opacity
            ground.material.opacity = (elapsed / duration);
            requestAnimationFrame(animateFadeIn);
        } else {
            ground.material.opacity = 1; // Ensure that the opacity is set to 1 at the end
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


function addText() {
  const fontLoader = new FontLoader();

  fontLoader.load(
    "Cruiser Fortress Engraved Italic_Italic.json",
    function (font) {
      // Main title
      const geometryMain = new TextGeometry("", {
        font: font,
        size: 2,
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
      textMeshMain.position.set(-19, 30, 0); // Adjusted y position slightly
      scene.add(textMeshMain);

      // Subtitle
      const geometrySub = new TextGeometry("", {
        font: font,
        size: 1.5, // Made this a bit smaller than the main title
        height: 0.5, // Adjusted thickness for subtext

      });

      const materialSub = new MeshBasicMaterial({ color: 0xffffff });
      const textMeshSub = new Mesh(geometrySub, materialSub);
      textMeshSub.position.set(-18, 26, 0); // Positioned below main title
      scene.add(textMeshSub);
    }
  );
}

init();

function init() {
  // Create scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45, // Adjust the field of view for a cinematic effect
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  
  // Position the camera for a cinematic angle
  camera.position.set(0, -10, 69); // Adjust the position as needed
  camera.lookAt(0, -5, 0); // Look at the origin of the scene
  

  // Create a renderer
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });  // Set antialias to false as we will use FXAA later


  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // <-- Add this line here

  document.body.appendChild(renderer.domElement);
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.29;
bloomPass.strength = 1.9;
bloomPass.radius = 1;
composer.addPass(bloomPass);
const bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.0025,
  maxblur: 0.01,
  width: window.innerWidth,
  height: window.innerHeight
});
composer.addPass(bokehPass);
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * window.devicePixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * window.devicePixelRatio);
composer.addPass(fxaaPass);

  // Handle window resizing
  window.addEventListener("resize", function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    composer.setSize(newWidth, newHeight);

    fxaaPass.material.uniforms['resolution'].value.x = 1 / (newWidth * window.devicePixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (newHeight * window.devicePixelRatio);
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
        child.material.wireframe = true; // Turn off wireframe
        //child.material.map = purpledragonTexture; // Apply the texture
        child.material.needsUpdate = true; // Necessary after changing a material's properties
        child.castShadow = true; // Enable shadow casting
        child.receiveShadow = true; // Enable shadow receiving
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
    const circleGeometry = new THREE.CircleGeometry(77.5, 32);
    whiteSquare = new THREE.Mesh(circleGeometry, circleMaterial);
    whiteSquare.position.set(dragon.position.x, -20, dragon.position.z);
    whiteSquare.rotation.set(-Math.PI / 2, 0, 0); // Rotate 90 degrees to lie flat
    
    scene.add(whiteSquare);

  });

  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMaterial.needsUpdate = true; // Add this line

ground.rotation.x = -Math.PI / 2;  // Rotate the plane to be horizontal
ground.visible = false;
ground.position.set(0, -21, 0); // Adjust as per requirement

ground.receiveShadow = true;  // Optional: Enable if you want the ground to receive shadows
ground.castShadow = false; // A ground plane typically doesn't need to cast shadows

console.log(ground.material);

        scene.add(ground); // Add the ground to the scene here
        ground.visible = true;
        fadeInGround();


  addText();

  // ... rest of your code ...

 // Skybox
 const skyboxTexture = new THREE.TextureLoader().load('background.jpg');

 // Create the skybox material
 const skyboxMaterial = new THREE.MeshBasicMaterial({
   map: skyboxTexture,
   side: THREE.BackSide // Make the material visible from the inside
 });

 // Create the skybox geometry
 const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000); // Adjust size as needed

 // Create the skybox mesh
 const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

 // Add the skybox mesh to the scene
 //scene.add(skyboxMesh);
 scene.background = new THREE.CubeTexture();

    console.log(scene.background)
    console.log(scene);
    
//fog

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
    const alpha = 0.02; // This determines the speed/smoothness of the rotation. Lower value means smoother.
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
