import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js"; // Change this line

let scene, camera, renderer;
let dragon;
let mixers = []; // Declare an array to hold all mixers
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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
  camera.position.z = 55; // or even further if needed

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
  document.addEventListener('mousemove', onMouseMove, false);


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

    animate(); // Call the animate loop
  });

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
        const targetAngle = Math.atan2(
            intersection.y + dragon.position.y,
            intersection.x - dragon.position.x
        );
        

        // Smoothly interpolate the dragon's current rotation towards the target angle
        const alpha = 0.05; // This determines the speed/smoothness of the rotation. Lower value means smoother.
        dragon.rotation.y = THREE.MathUtils.lerp(dragon.rotation.y, targetAngle, alpha);
    }
    
    // Update each mixer in the mixers array
    for (let mixer of mixers) {
        mixer.update(0.0025); // Assuming a 60fps frame rate. Adjust this value if necessary.
    }
    
    renderer.render(scene, camera);
}

animate(); // Call this after the init function

