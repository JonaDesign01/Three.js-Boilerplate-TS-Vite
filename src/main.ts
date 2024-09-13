import "./style.css";
import { createNoise4D } from "simplex-noise";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

//basics
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Resize listener to update camera and renderer on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Basic setup for post-processing
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // Intensity
  0.4, // Radius
  0.45 // Threshold
);
composer.addPass(bloomPass);

//lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

const pLight1 = new THREE.PointLight(0xffffff, 100);
pLight1.position.set(0, 0, 10);
pLight1.castShadow = true;
scene.add(pLight1);

const pLight2 = new THREE.PointLight(0x2f0000, 3, 100);
pLight2.position.set(12, 0, -2);
pLight2.castShadow = true;
scene.add(pLight2);

const pLight3 = new THREE.PointLight(0x00002f, 3, 100);
pLight3.position.set(-12, 0, -2);
pLight3.castShadow = true;
scene.add(pLight3);

//mid Light

const mLight = new THREE.PointLight(0xffffff, 3, 0.3);
mLight.position.set(0, 0, 0);
mLight.castShadow = true;
scene.add(mLight);

// Torus geomerty
let geometries = [
  new THREE.TorusGeometry(8, 2, 40, 150),
  new THREE.TorusGeometry(8, 2, 40, 150),
  new THREE.TorusGeometry(8, 2, 40, 150),
];

let colors: Float32Array[] = [];
geometries.forEach((geometry) =>
  colors.push(new Float32Array(geometry.attributes.position.count * 3))
);
colors.forEach((color, i) =>
  geometries[i].setAttribute("color", new THREE.BufferAttribute(color, 3))
);

let materials = [
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 2,
    metalness: 0.4,
  }),
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 2,
    metalness: 0.4,
  }),
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 2,
    metalness: 0.4,
  }),
];

// sphere geomerty
let spheres: THREE.Mesh[] = [];
geometries.forEach((geomerty, i) =>
  spheres.push(new THREE.Mesh(geomerty, materials[i]))
);
spheres.forEach((sphere) => scene.add(sphere));

camera.position.z = 3;

const noise4D = createNoise4D();
let time = 0;

// Animation
function animate() {
  const maxChange = 0.25;

  geometries.forEach((geometry, index) => {
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.length; i += 3) {
      vertex.set(positions[i], positions[i + 1], positions[i + 2]);

      const noiseValue = noise4D(vertex.x, vertex.y, vertex.z, time + index);
      const displacement = maxChange * noiseValue;
      vertex.normalize().multiplyScalar(1 + displacement);

      positions[i] = vertex.x;
      positions[i + 1] = vertex.y;
      positions[i + 2] = vertex.z;

      const baseColor = new THREE.Color("#9a60d3");
      const displacedColor = new THREE.Color("#d7a0f9");

      const color = baseColor.lerp(
        displacedColor,
        Math.abs(displacement) / maxChange
      );

      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  time += 0.015;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
