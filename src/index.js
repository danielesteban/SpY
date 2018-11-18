import { Vector2, Vector3 } from 'three';
import Dude from '@/actors/dude';
import Scene from '@/engine/scene';

const scene = new Scene({ mount: document.body });
scene.camera.lookAt(0, -0.5, -1);

const pack = 5;
const dudes = [...Array(pack)].map((v, i) => {
  const dude = new Dude();
  dude.position.set(Math.floor((i + 1) / 2) * ((i + 1) % 2 === 0 ? 1 : -1), 0, 0);
  scene.root.add(dude);
  return dude;
});

scene.camera.target = {
  position: dudes[0].position,
  offset: new Vector3(0, 3, 5),
};

const pointer = new Vector2();
scene.mount.addEventListener('mousedown', ({ button, clientX: x, clientY: y }) => {
  if (button !== 0) return;
  const { camera, grid, raycaster } = scene;
  const { width, height } = scene.renderer.getSize();
  pointer.x = ((x / width) * 2) - 1;
  pointer.y = 1 - ((y / height) * 2);
  raycaster.setFromCamera(pointer, camera);
  const hit = scene.raycaster.intersectObject(grid)[0];
  if (!hit) return;
  const { x: mainDudeX, z: mainDudeZ } = hit.point;
  dudes.forEach((dude, i) => {
    hit.point.x = mainDudeX + Math.floor((i + 1) / 2) * ((i + 1) % 2 === 0 ? 1 : -1);
    hit.point.z = mainDudeZ + Math.floor((i + 1) / 2) * -1;
    if (i > 0) {
      dude.actions.walk.timeScale = 0.75 + Math.random() * 0.5;
    }
    dude.walkTo(hit.point);
  });
});
